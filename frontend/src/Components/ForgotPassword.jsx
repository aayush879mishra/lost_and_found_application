import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { KeyRound, Mail, ShieldCheck, ChevronLeft, ArrowRight, Lock } from "lucide-react";
import logo from "../assets/logo.jpeg";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // STEP 1: Request OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    const loadToast = toast.loading("Sending OTP...");

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      toast.dismiss(loadToast);

      if (res.ok) {
        toast.success("OTP sent to your email!");
        setStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      return toast.error("All fields are required");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    const loadToast = toast.loading("Resetting password...");

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      toast.dismiss(loadToast);

      if (res.ok) {
        toast.success("Password reset successful!");
        navigate("/Login");
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-16 px-4 antialiased font-sans flex items-center justify-center">
      <div className="max-w-md w-full">
        
        {/* LOGO AREA */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="LostLink Logo" className="w-24 rounded-2xl shadow-sm" />
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-[#F3F4F6]">
          
          {/* DYNAMIC HEADER */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-[#EEF2FF] rounded-[1.5rem] mb-6">
              {step === 1 ? (
                <KeyRound className="w-8 h-8 text-[#4F46E5]" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-[#4F46E5]" />
              )}
            </div>
            <h2 className="text-[32px] font-[800] text-[#111827] mb-3 tracking-tight leading-tight">
              {step === 1 ? "Forgot Password?" : "Reset Password"}
            </h2>
            <p className="text-[#6B7280] text-sm font-medium leading-relaxed px-2">
              {step === 1 
                ? "Enter your email address and we'll send you a code to reset your password." 
                : `We've sent a 6-digit code to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            /* STEP 1: EMAIL ENTRY */
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="relative">
                <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F3F4F6] pl-14 pr-5 py-5 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[#4F46E5]/10 transition font-medium text-[#1F2937]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-5 bg-[#4F46E5] text-white rounded-[1.5rem] font-bold text-lg shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:bg-[#4338CA] transition-all transform hover:-translate-y-1 active:scale-95 disabled:bg-[#9CA3AF] disabled:transform-none"
              >
                {loading ? "Sending..." : "Send Reset Code"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP & NEW PASSWORD */
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">Verification Code</label>
                <input
                  type="text"
                  placeholder="0 0 0 0 0 0"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-[#F3F4F6] p-5 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[#4F46E5]/10 transition text-center tracking-[0.5em] font-[900] text-2xl text-[#4F46E5]"
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#F3F4F6] pl-14 pr-5 py-5 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[#4F46E5]/10 transition font-medium text-[#1F2937]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#F3F4F6] pl-14 pr-5 py-5 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[#4F46E5]/10 transition font-medium text-[#1F2937]"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#4F46E5] text-white rounded-[1.5rem] font-bold text-lg shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:bg-[#4338CA] transition-all transform hover:-translate-y-1 active:scale-95"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>

              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-[13px] text-[#9CA3AF] font-bold hover:text-[#4F46E5] transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Change Email Address
              </button>
            </form>
          )}
        </div>

        {/* FOOTER NAVIGATION */}
        <div className="text-center mt-8">
          <Link 
            to="/Login" 
            className="inline-flex items-center gap-2 text-[#4F46E5] font-bold hover:gap-3 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;