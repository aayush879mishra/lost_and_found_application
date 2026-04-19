import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { UserPlus, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import TermsModal from "../Components/TermsModal"; // 1. Import your new Modal component

function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 2. State for Modal
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!fullName || !email || !password || !confirmPassword) {
      setMessage("error:All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("error:Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setMessage("error:Please accept the Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`error:${data.message || "Signup failed"}`);
        setLoading(false);
        return;
      }

      setMessage("success:Signup successful! Sending OTP...");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: email } });
      }, 1500);

    } catch (err) {
      setMessage("error:Server error. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setMessage("error:Google signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center px-4 font-sans py-12">
      
      {/* 3. Include the Modal Component */}
      <TermsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] text-center">
        
        <h2 className="text-3xl font-black text-[#111827] tracking-tight mb-2">Create Account</h2>
        <p className="text-[#6B7280] font-semibold text-sm mb-8">Join the community to start reporting.</p>

        {/* GOOGLE SIGNUP SECTION */}
        <div className="flex flex-col items-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={() => setMessage("error:Google signup failed")}
            theme="outline"
            shape="pill"
            text="signup_with"
            width="360"
          />
          <p className="mt-4 text-[11px] text-[#9CA3AF] font-bold uppercase tracking-wider leading-relaxed px-6">
            By continuing with Google, you agree to our 
            <button 
              type="button" 
              onClick={() => setIsModalOpen(true)}
              className="text-[#4F46E5] hover:underline mx-1 cursor-pointer"
            >
              Terms
            </button> 
            and 
            <button 
              type="button" 
              onClick={() => setIsModalOpen(true)}
              className="text-[#4F46E5] hover:underline ml-1 cursor-pointer"
            >
              Safety Rules
            </button>.
          </p>
        </div>

        <div className="flex items-center mb-8">
          <div className="flex-1 border-t border-gray-100"></div>
          <span className="px-4 text-[#D1D5DB] font-black text-[10px] tracking-widest uppercase">OR</span>
          <div className="flex-1 border-t border-gray-100"></div>
        </div>

        {/* MANUAL SIGNUP FORM */}
        <form onSubmit={handleSignup} className="space-y-4 text-left">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              className="w-full pl-11 pr-4 py-4 bg-[#F9FAFB] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4F46E5] transition shadow-inner"
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              className="w-full pl-11 pr-4 py-4 bg-[#F9FAFB] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4F46E5] transition shadow-inner"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              className="w-full pl-11 pr-4 py-4 bg-[#F9FAFB] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4F46E5] transition shadow-inner"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              className="w-full pl-11 pr-4 py-4 bg-[#F9FAFB] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4F46E5] transition shadow-inner"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* CHECKBOX FOR MANUAL FORM */}
          <div className="flex items-start gap-3 px-1 py-2 group cursor-pointer">
            <div className="relative flex items-center mt-0.5">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-[#E5E7EB] bg-[#F9FAFB] checked:border-[#4F46E5] checked:bg-[#4F46E5] transition-all"
              />
              <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity stroke-[4px]" />
            </div>
            <label htmlFor="terms" className="text-[12px] text-[#6B7280] font-bold leading-tight cursor-pointer select-none">
              I agree to the 
              <button 
                type="button" 
                onClick={() => setIsModalOpen(true)}
                className="text-[#4F46E5] hover:underline mx-1 font-bold"
              >
                Terms
              </button> 
              and 
              <button 
                type="button" 
                onClick={() => setIsModalOpen(true)}
                className="text-[#4F46E5] hover:underline ml-1 font-bold"
              >
                Safety Guidelines
              </button>.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg ${
              loading 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-[#4F46E5]/20"
            }`}
          >
            {loading ? "Creating..." : "Sign Up"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-3 rounded-xl text-xs font-black uppercase tracking-wider ${
            message.startsWith("success") ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FFF1F2] text-[#E11D48]"
          }`}>
            {message.split(":")[1]}
          </div>
        )}

        <p className="mt-8 text-sm font-bold text-[#6B7280]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#4F46E5] no-underline hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;