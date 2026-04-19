import React from 'react';
import { ShieldAlert, Info, Scale, Handshake } from 'lucide-react';

const Terms = () => (
  <div className="min-h-screen bg-white py-20 px-6 font-sans antialiased">
    <div className="max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="mb-16">
        <h1 className="text-5xl font-black text-[#111827] tracking-tighter mb-4">Terms of Service</h1>
        <div className="flex items-center gap-4">
          <p className="text-[#9CA3AF] font-bold uppercase tracking-[0.2em] text-[10px]">
            Last Updated: April 2026
          </p>
          <div className="h-px flex-1 bg-gray-100"></div>
        </div>
      </div>
      
      <div className="space-y-16 text-[#4B5563] leading-relaxed">
        {/* SECTION 1 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-xl font-black text-[#111827] uppercase tracking-tight">1. Acceptance of Terms</h2>
          </div>
          <p className="font-medium">
            By accessing or using <span className="text-[#4F46E5] font-bold">LostLink</span>, you agree to be bound by these Terms of Service. This platform is designed to facilitate the recovery of lost items through community cooperation. If you do not agree to these terms, you must cease use of the service immediately.
          </p>
        </section>

        {/* SECTION 2 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-xl font-black text-[#111827] uppercase tracking-tight">2. User Conduct & Content</h2>
          </div>
          <p className="mb-4 font-medium">
            You are solely responsible for the content you post. By using LostLink, you agree:
          </p>
          <ul className="grid gap-4 pl-2">
            {[
              "To provide truthful and accurate descriptions of items.",
              "Not to post prohibited or illegal items.",
              "Not to use the platform for harassment or spam.",
              "That your contact information will be shared with potential matches."
            ].map((item, i) => (
              <li key={i} className="flex gap-4 items-start bg-[#F9FAFB] p-4 rounded-2xl border border-gray-50 text-sm font-bold">
                <span className="text-[#4F46E5]">0{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* SECTION 3 - SAFETY CRITICAL */}
        <section className="bg-[#FFF1F2] p-8 rounded-[2.5rem] border border-[#FECDD3]">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-[#E11D48]" />
            <h2 className="text-xl font-black text-[#9F1239] uppercase tracking-tight">3. Safety & Reclaiming Items</h2>
          </div>
          <p className="text-[#BE123C] font-bold text-sm mb-4">
            LostLink does not verify the identity of its users. For your protection:
          </p>
          <div className="text-[#9F1239] text-sm space-y-3 font-medium">
            <p>• Always meet in public, well-lit spaces like police stations or malls.</p>
            <p>• Never go to a private residence to claim an item.</p>
            <p>• LostLink is not responsible for any incidents that occur during physical meetups.</p>
          </div>
        </section>

        {/* SECTION 4 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Handshake className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-xl font-black text-[#111827] uppercase tracking-tight">4. Limitations of Liability</h2>
          </div>
          <p className="font-medium italic">
            LostLink is provided "as is." We do not guarantee that your lost item will be found, nor do we guarantee the condition of items returned. We are not liable for any loss, damage, or emotional distress resulting from the use of this community platform.
          </p>
        </section>

        {/* SECTION 5 */}
        <section>
          <h2 className="text-xl font-black text-[#111827] mb-4 uppercase tracking-tight">5. Account Termination</h2>
          <p className="font-medium">
            We reserve the right to suspend or terminate accounts that violate these terms, specifically those engaged in fraudulent "Found" reports to scam users.
          </p>
        </section>

        {/* FOOTER OF DOCUMENT */}
        <div className="pt-10 border-t border-gray-100 text-center">
          <p className="text-xs font-black text-[#D1D5DB] tracking-[0.3em] uppercase">
            Thank you for keeping the community safe.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Terms;