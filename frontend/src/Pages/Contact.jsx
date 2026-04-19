import { Send, MessageCircle, Mail } from "lucide-react";

const Contact = () => (
  <div className="min-h-screen bg-white py-20 px-6 text-center">
    <div className="max-w-2xl mx-auto">
      <h1 className="text-5xl font-black text-[#111827] mb-6">Get in touch.</h1>
      <p className="text-[#6B7280] text-lg mb-12 font-medium">Have questions or found a bug? We're here to help.</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-8 bg-[#F3F4F6] rounded-[2rem] text-left">
          <Mail className="text-[#4F46E5] mb-4" />
          <h4 className="font-black text-[#111827] mb-2">Email Support</h4>
          <p className="text-sm text-[#6B7280]">support@lostlink.com</p>
        </div>
        <div className="p-8 bg-[#EEF2FF] rounded-[2rem] text-left border border-[#4F46E5]/10">
          <MessageCircle className="text-[#4F46E5] mb-4" />
          <h4 className="font-black text-[#111827] mb-2">WhatsApp Community</h4>
          <p className="text-sm text-[#6B7280]">Connect for quick help</p>
        </div>
      </div>
    </div>
  </div>
);

export default Contact;