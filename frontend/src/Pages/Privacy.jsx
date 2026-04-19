import React from 'react';
import { Eye, Lock, Share2, Database, Trash2 } from 'lucide-react';

const Privacy = () => (
  <div className="min-h-screen bg-[#F9FAFB] py-20 px-6 font-sans">
    <div className="max-w-3xl mx-auto bg-white p-12 md:p-16 rounded-[3.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-100">
      
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-[#111827] tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-[#4F46E5] font-black text-[10px] uppercase tracking-[0.3em]">
          Protecting the LostLink Community
        </p>
      </div>

      <div className="space-y-10 text-[#4B5563] leading-relaxed">
        
        {/* SECTION: INTRO */}
        <section>
          <p className="font-medium text-lg text-[#1F2937]">
            At **LostLink**, we believe privacy is a fundamental right. This policy outlines how we handle your information when you use our platform to reunite with your belongings.
          </p>
        </section>

        {/* SECTION: DATA COLLECTION */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="font-black text-[#111827] uppercase text-sm tracking-wider">1. Data We Collect</h3>
          </div>
          <div className="grid gap-4">
            <div className="bg-[#F9FAFB] p-6 rounded-3xl border border-gray-50">
              <h4 className="font-bold text-[#111827] mb-2 text-sm">Account Information</h4>
              <p className="text-sm">When you sign up via Email or Google, we store your name and email address to manage your reports and prevent spam.</p>
            </div>
            <div className="bg-[#F9FAFB] p-6 rounded-3xl border border-gray-50">
              <h4 className="font-bold text-[#111827] mb-2 text-sm">Report Data</h4>
              <p className="text-sm">This includes item names, descriptions, categories, general locations, and images you upload to help identify lost property.</p>
            </div>
          </div>
        </section>

        {/* SECTION: HOW WE SHARE */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="font-black text-[#111827] uppercase text-sm tracking-wider">2. Information Visibility</h3>
          </div>
          <p className="text-sm font-medium mb-4">
            To facilitate reunions, certain data must be visible to other users:
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm font-bold text-[#1F2937]">
              <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full" />
              Public: Item details, images, and location.
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-[#1F2937]">
              <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full" />
              Registered Users: Your provided contact method (WhatsApp/Email).
            </li>
          </ul>
        </section>

        {/* SECTION: SECURITY */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="font-black text-[#111827] uppercase text-sm tracking-wider">3. Data Security</h3>
          </div>
          <p className="text-sm">
            We use industry-standard encryption to protect your data. Your passwords are never stored in plain text. While we strive to protect your personal information, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        {/* SECTION: THIRD PARTY */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="font-black text-[#111827] uppercase text-sm tracking-wider">4. Third-Party Services</h3>
          </div>
          <p className="text-sm">
            LostLink utilizes **Google OAuth** for secure authentication and may use cloud storage providers for hosting item images. These services have their own privacy policies which we encourage you to review.
          </p>
        </section>

        {/* SECTION: DELETION */}
        <section className="pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-5 h-5 text-[#E11D48]" />
            <h3 className="font-black text-[#111827] uppercase text-sm tracking-wider">5. Your Rights</h3>
          </div>
          <p className="text-sm">
            You have the right to delete your reports at any time. Once a report is deleted, the images and descriptions are removed from our active database.
          </p>
        </section>

      </div>

      {/* FOOTER */}
      <div className="mt-16 text-center">
        <p className="text-[10px] font-black text-[#D1D5DB] uppercase tracking-[0.4em]">
          End of Privacy Policy • LostLink 2026
        </p>
      </div>
    </div>
  </div>
);

export default Privacy;