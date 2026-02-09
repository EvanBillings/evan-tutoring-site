"use client";

import { useState } from "react";
import Link from "next/link";
// I added ArrowRight to this list below
import { ArrowLeft, Send, CheckCircle, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    level: "GCSE",
    subject: "Physics",
    comments: ""
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct the email subject
    const subject = `Tutoring Enquiry: ${formData.level} - ${formData.subject}`;
    
    // Construct the email body
    const body = `Hi Evan,%0D%0A%0D%0AI would like to enquire about tutoring.%0D%0A%0D%0A-------%0D%0A%0D%0ALevel: ${formData.level}%0D%0ASubject: ${formData.subject}%0D%0A%0D%0ADetails / Current Grades:%0D%0A${encodeURIComponent(formData.comments)}%0D%0A%0D%0A-------`;

    // Open user's email client
    window.location.href = `mailto:evancbillings@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- HEADER --- */}
      <nav className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-700 transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="font-bold text-lg tracking-tight">Evan Billings Tutoring</div>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Make an Enquiry</h1>
          <p className="text-slate-600">
            Please fill out the details below so I can understand your needs before we start.
          </p>
        </div>

        {/* --- THE FORM --- */}
        <form className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            
            {/* Level Selection */}
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                    Level
                </label>
                <select 
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                    <option value="GCSE">GCSE</option>
                    <option value="A-level">A-level</option>
                </select>
            </div>

            {/* Subject Selection */}
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                    Subject
                </label>
                <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Maths">Maths</option>
                    <option value="Further Maths">Further Maths</option>
                    <option value="Combined Science">Combined Science (GCSE Only)</option>
                </select>
            </div>

            {/* Comments / Details */}
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                    Additional Details
                </label>
                <textarea 
                    rows={4}
                    placeholder="e.g. Currently working at grade 5 but aiming for 7. Struggling specifically with Paper 2 organic chemistry."
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    required
                ></textarea>
            </div>

            {/* Submit Button */}
            <button 
                onClick={handleSend}
                className="w-full bg-blue-700 text-white font-bold py-4 rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-2"
            >
                <Send size={18} /> Send Enquiry
            </button>

            <p className="text-xs text-center text-slate-400 mt-4">
                This will open your email app with your details pre-filled.
            </p>
        </form>

        {/* --- ALTERNATIVE --- */}
        <div className="mt-8 text-center bg-blue-50 p-6 rounded-xl border border-blue-100">
            <p className="text-slate-700 text-sm mb-2">
                Already know what you need?
            </p>
            <Link 
                href="/book"
                className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
            >
                Skip to Booking Calendar <ArrowRight size={14}/>
            </Link>
        </div>

      </div>
    </main>
  );
}