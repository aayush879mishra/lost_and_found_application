import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { Mail, Lock, LogIn } from "lucide-react";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Verifying credentials...");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.status === 403 && data.unverified) {
        toast.error("Account not verified. Redirecting to OTP...");
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: email } });
        }, 1500);
        return;
      }

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success("Welcome back!");

      // DYNAMIC REDIRECT BASED ON USER ROLE
      if (data.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Server error. Please try again later.");
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const loadingToast = toast.loading("Authenticating...");
    try {
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (!res.ok) throw new Error();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success("Login Successful!");

      // DYNAMIC REDIRECT FOR GOOGLE OAUTH LOGINS
      if (data.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Google login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] text-center">
        
        <h2 className="text-3xl font-black text-[#111827] tracking-tight mb-2">Welcome Back</h2>
        <p className="text-[#6B7280] font-semibold text-sm mb-8">Enter your details to access your reports.</p>

        {/* GOOGLE LOGIN */}
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google login failed")}
            theme="outline"
            shape="pill"
            width="360"
          />
        </div>

        <div className="flex items-center mb-8">
          <div className="flex-1 border-t border-gray-100"></div>
          <span className="px-4 text-[#D1D5DB] font-black text-[10px] tracking-widest uppercase">OR</span>
          <div className="flex-1 border-t border-gray-100"></div>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-5 text-left">
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                className="w-full pl-11 pr-4 py-4 bg-[#F9FAFB] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4F46E5] transition shadow-inner"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-black text-[#4F46E5] uppercase tracking-wider hover:opacity-70">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                className="w-full pl-11 pr-4 py-4 bg-[#F9FAFB] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4F46E5] transition shadow-inner"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 mt-2 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg ${
              loading 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-[#4F46E5]/20"
            }`}
          >
            {loading ? "Authenticating..." : "Sign In"}
            {!loading && <LogIn className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-8 text-sm font-bold text-[#6B7280]">
          New to LostLink?{" "}
          <Link to="/signup" className="text-[#4F46E5] no-underline hover:underline">
            Join now
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;