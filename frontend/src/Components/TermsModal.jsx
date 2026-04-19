import React from 'react';
import { X, Shield, AlertCircle, Eye } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EEF2FF] rounded-xl">
              <Shield className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <h2 className="text-2xl font-black text-[#111827]">Terms of Service</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 overflow-y-auto text-left space-y-6 font-medium text-[#4B5563] leading-relaxed">
          <section>
            <h3 className="text-[#111827] font-bold mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#4F46E5]" /> 1. Accuracy of Information
            </h3>
            <p className="text-sm">
              Users must provide truthful and accurate descriptions of lost or found items. Creating fake reports or intentionally misleading others is strictly prohibited.
            </p>
          </section>

          <section>
            <h3 className="text-[#111827] font-bold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#4F46E5]" /> 2. Personal Safety
            </h3>
            <p className="text-sm">
              LostLink is a platform for connection. We do not verify individual users. For your safety, always meet in public, well-lit areas (e.g., shopping malls, police stations) when exchanging items.
            </p>
          </section>

          <section>
            <h3 className="text-[#111827] font-bold mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4F46E5]" /> 3. Data Visibility
            </h3>
            <p className="text-sm">
              By posting a report, you acknowledge that your chosen contact method (Email or Phone) will be visible to registered users who wish to help return or claim an item.
            </p>
          </section>

          <section>
            <h3 className="text-[#111827] font-bold mb-2">4. Limitation of Liability</h3>
            <p className="text-sm italic bg-[#F9FAFB] p-4 rounded-2xl border border-gray-100">
              LostLink and its developers are not responsible for any lost property, unsuccessful returns, or any incidents occurring during physical meetups.
            </p>
          </section>
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-[#4F46E5] text-white font-bold rounded-2xl hover:bg-[#4338CA] transition-all active:scale-95"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;