const Help = () => {
  const faqs = [
    { q: "How do I report a found item?", a: "Click on 'Report Found' in the home page and fill the form." },
    { q: "Is LostLink free to use?", a: "Yes, our mission is purely community-driven." }
  ];

  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-[#111827] mb-12">How can we help?</h1>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 border border-gray-100 rounded-2xl hover:border-[#4F46E5] transition-colors">
              <h3 className="font-bold text-[#111827] mb-2">{faq.q}</h3>
              <p className="text-[#6B7280] text-sm font-medium">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;