"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { CreditCard, Clock, ChevronLeft, CheckCircle2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BookSession() {
  const { user, isLoaded } = useUser();
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function getRate() {
      if (!isLoaded || !user) return;
      const { data } = await supabase
        .from("student_profiles")
        .select("hourly_rate")
        .eq("id", user.id)
        .maybeSingle();
      
      if (data) setRate(data.hourly_rate);
      setLoading(false);
    }
    getRate();
  }, [user, isLoaded]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user?.id, 
          userEmail: user?.primaryEmailAddress?.emailAddress 
        }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading Portal...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Back to Dashboard
      </Link>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 overflow-hidden relative">
        {/* Design Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="relative">
          <div className="bg-slate-900 text-white w-14 h-14 flex items-center justify-center rounded-2xl font-bold text-xl mb-6 shadow-xl">
            EB
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Book a Session</h1>
          <p className="text-slate-500 text-sm mb-8 font-medium">1-on-1 Cambridge Natural Sciences Tutoring</p>

          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600"><Clock size={20}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                <p className="font-bold text-slate-700 text-sm">60 Minute Session</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <div className="bg-blue-500 p-2 rounded-xl text-white"><CreditCard size={20}/></div>
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Your Rate</p>
                <p className="font-black text-2xl">£{rate || 40}<span className="text-sm font-normal opacity-60">/hr</span></p>
              </div>
            </div>
          </div>

          <ul className="space-y-3 mb-10 px-1">
            <li className="flex items-center gap-3 text-xs font-bold text-slate-500">
              <CheckCircle2 size={16} className="text-emerald-500" /> Secure Payment via Stripe
            </li>
            <li className="flex items-center gap-3 text-xs font-bold text-slate-500">
              <CheckCircle2 size={16} className="text-emerald-500" /> Instant Booking Confirmation
            </li>
            <li className="flex items-center gap-3 text-xs font-bold text-slate-500">
              <CheckCircle2 size={16} className="text-emerald-500" /> Personalized Feedback included
            </li>
          </ul>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all transform active:scale-95 shadow-xl disabled:bg-slate-300 flex items-center justify-center gap-2"
          >
            {isProcessing ? "Connecting..." : "Proceed to Payment"}
          </button>
          
          <p className="mt-6 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
            Evan Billings Tutoring • Cambridge
          </p>
        </div>
      </div>
    </div>
  );
}