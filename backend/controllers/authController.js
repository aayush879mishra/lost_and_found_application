const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { googleClient, GOOGLE_CLIENT_ID } = require("../config/google");
const { sendWelcomeEmail, sendOTPEmail } = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOtp");

// Helper to get secret dynamically
const getSecret = () => process.env.JWT_SECRET;

/* 1. REGISTER (With Signup OTP) */
exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [existing] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (full_name, email, password, otp_code, otp_expiry, is_verified) VALUES (?, ?, ?, ?, ?, ?)`;
    await db.promise().query(sql, [full_name, email, hashedPassword, otp, expiry, false]);

    // Send Verification OTP
    await sendOTPEmail(email, otp, "verification");

    res.status(201).json({ message: "OTP sent to email. Please verify your account." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/* 2. VERIFY SIGNUP OTP */
exports.verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expiry > NOW()",
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = rows[0];
    await db.promise().query(
      "UPDATE users SET is_verified = true, otp_code = NULL, otp_expiry = NULL WHERE email = ?",
      [email]
    );

    // Send Welcome Email now that they are verified
    sendWelcomeEmail(email, user.full_name).catch(err => console.error(err));

    res.json({ message: "Account verified successfully! You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

/* 3. LOGIN (Check Verification) */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Blocked check
    if (user.is_blocked) {
      return res.status(403).json({ message: "Your account is blocked. Please contact support." });
    }

    // Verification check
    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email first.", unverified: true });
    }

    if (user.password === "GOOGLE_USER") {
      return res.status(400).json({ message: "Please use Google Login for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ user_id: user.user_id, role: user.role }, getSecret(), { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: { user_id: user.user_id, full_name: user.full_name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};

/* 4. FORGOT PASSWORD (Send OTP) */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [user] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length === 0) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.promise().query(
      "UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?",
      [otp, expiry, email]
    );

    await sendOTPEmail(email, otp, "reset");
    res.json({ message: "Password reset OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* 5. RESET PASSWORD (Verify OTP & Save) */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expiry > NOW()",
      [email, otp]
    );

    if (rows.length === 0) return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.promise().query(
      "UPDATE users SET password = ?, otp_code = NULL, otp_expiry = NULL WHERE email = ?",
      [hashedPassword, email]
    );

    res.json({ message: "Password reset successful! You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Reset failed" });
  }
};

/* 6. GOOGLE LOGIN (Auto-verify) */
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();
    const [users] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    let user = users[0];

    if (user && user.is_blocked) {
       return res.status(403).json({ message: "Your account is blocked." });
    }

    if (!user) {
      const [result] = await db.promise().query(
        "INSERT INTO users (full_name, email, password, role, profile_image, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, "GOOGLE_USER", "user", picture, true] // Google users are auto-verified
      );
      
      user = { user_id: result.insertId, full_name: name, email: email, role: "user" };
      sendWelcomeEmail(email, name).catch(err => console.error(err));
    }

    const jwtToken = jwt.sign({ user_id: user.user_id, role: user.role || "user" }, getSecret(), { expiresIn: "7d" });

    res.json({ 
      token: jwtToken, 
      user: { user_id: user.user_id, full_name: user.full_name, email: user.email, role: user.role || "user" } 
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ message: "Google login failed" });
  }
};

/* 7. OTHER HELPERS (getMe, updateProfile, changePassword) */
exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT user_id, full_name, email, profile_image, role FROM users WHERE user_id = ?", 
      [req.user.user_id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, email } = req.body;
    let query = "UPDATE users SET full_name = ?, email = ? WHERE user_id = ?";
    let params = [full_name, email, req.user.user_id];

    if (req.file) {
      const imagePath = `/uploads/${req.file.filename}`;
      query = "UPDATE users SET full_name = ?, email = ?, profile_image = ? WHERE user_id = ?";
      params = [full_name, email, imagePath, req.user.user_id];
    }

    await db.promise().query(query, params);
    const [updated] = await db.promise().query("SELECT * FROM users WHERE user_id = ?", [req.user.user_id]);
    res.json({ message: "Profile updated successfully", user: updated[0] });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query("UPDATE users SET password = ? WHERE user_id = ?", [hashedPassword, req.user.user_id]);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


/* RESEND OTP */
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if user exists
    const [users] = await db.promise().query("SELECT full_name, is_verified FROM users WHERE email = ?", [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // 2. Generate new OTP
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Update DB
    await db.promise().query(
      "UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?",
      [otp, expiry, email]
    );

    // 4. Send Email (Detect if it's for signup or reset based on is_verified)
    const emailType = users[0].is_verified ? "reset" : "verification";
    await sendOTPEmail(email, otp, emailType);

    res.json({ message: "A new OTP has been sent to your email." });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};