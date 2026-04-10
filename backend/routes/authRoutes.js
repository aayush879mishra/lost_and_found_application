const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); 
const upload = require("../middleware/multer");

// Public Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin);

// Protected Routes
router.get("/me", protect, authController.getMe);
router.put("/update-profile", protect, upload.single("profileImage"), authController.updateProfile);
router.put("/change-password", protect, authController.changePassword);

router.post('/verify-otp', authController.verifySignupOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-otp', authController.resendOTP);

module.exports = router;