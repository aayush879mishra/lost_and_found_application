import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ArrowRight, RefreshCw, ChevronLeft } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please signup again.");
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return; 

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    const loadToast = toast.loading("Resending code...");
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', { email });
      toast.success("New OTP sent to your email!");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      toast.dismiss(loadToast);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return toast.error("Enter all 6 digits");

    setLoading(true);
    const loadToast = toast.loading("Verifying code...");
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp: otpString
      });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      toast.dismiss(loadToast);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-16 px-4 antialiased font-sans flex items-center justify-center">
      <div className="max-w-md w-full">
        
        {/* BACK BUTTON */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#4F46E5] font-bold mb-8 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-[#F3F4F6] text-center">
          
          {/* ICON & HEADER */}
          <div className="inline-flex p-4 bg-[#EEF2FF] rounded-[1.5rem] mb-6">
            <ShieldCheck className="w-8 h-8 text-[#4F46E5]" />
          </div>
          
          <h2 className="text-[32px] font-[800] text-[#111827] mb-3 tracking-tight">Verify Email</h2>
          <p className="text-[#6B7280] text-sm font-medium leading-relaxed px-4">
            We’ve sent a 6-digit security code to <br />
            <span className="text-[#111827] font-bold">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            {/* OTP INPUTS */}
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-16 text-center text-[24px] font-bold bg-[#F3F4F6] border-2 border-transparent rounded-[1rem] focus:border-[#4F46E5]/20 focus:bg-white focus:ring-4 focus:ring-[#4F46E5]/5 outline-none transition-all text-[#1F2937]"
                />
              ))}
            </div>

            {/* VERIFY BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-[#4F46E5] text-white rounded-[1.5rem] font-bold text-lg shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:bg-[#4338CA] transition-all transform hover:-translate-y-1 active:scale-95 disabled:bg-[#9CA3AF] disabled:transform-none"
            >
              {loading ? "Verifying..." : "Verify Account"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* RESEND SECTION */}
          <div className="mt-10 pt-8 border-t border-[#F3F4F6]">
            <p className="text-[13px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`flex items-center gap-2 mx-auto font-bold text-sm transition-all ${
                canResend 
                  ? "text-[#4F46E5] hover:text-[#4338CA] cursor-pointer" 
                  : "text-[#D1D5DB] cursor-not-allowed"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${!canResend ? "" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              {canResend ? "Resend New Code" : `Resend in ${timer}s`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;