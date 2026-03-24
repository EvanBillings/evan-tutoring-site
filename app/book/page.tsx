"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2, Star, Zap, Lock } from "lucide-react";
import Link from "next/link";

export default function BookingPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchStudentProfile = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    try {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("email", user.primaryEmailAddress.emailAddress)
        .maybeSingle();
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchStudentProfile();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [user, isLoaded, fetchStudentProfile]);

  const handleTopUp = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.primaryEmailAddress?.emailAddress,
          rate: profile?.hourly_rate ?? 40,
          userId: user?.id,
        }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isLoaded || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  const hasCredits = (profile?.lessons_balance || 0) > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <nav className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition font-black no-underline">
            <ArrowLeft size={20} /> <span className="text-[10px] uppercase tracking-widest">Dashboard</span>
          </Link>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">Book Session</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-3">
            {!hasCredits ? (
              <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center">
                <div className="bg-blue-50 text-blue-600 p-6 rounded-3xl mb-6">
                  <Lock size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Insufficient Lesson Balance</h2>
                <p className="text-slate-500 font-bold max-w-sm mb-10 leading-relaxed uppercase text-xs tracking-widest">
                  You currently have 0 lessons remaining. Please top up your account to unlock the booking calendar.
                </p>
                <button
                  onClick={handleTopUp}
                  disabled={checkoutLoading}
                  className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center gap-3"
                >
                  {checkoutLoading ? <><Loader2 size={20} className="animate-spin" /> Processing...</> : "Top Up Balance"}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-[750px]">
                <iframe
                  src={`https://cal.com/evanbillings/lesson?email=${user?.primaryEmailAddress?.emailAddress}&name=${user?.firstName}`}
                  title="Lesson Booking"
                  className="w-full h-full border-none"
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <Star size={14} className="text-blue-600" fill="currentColor" /> Lesson Credits
              </h3>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Balance</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {profile?.lessons_balance || 0}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Sessions Remaining</p>
              </div>
              {hasCredits && (
                <button
                  onClick={handleTopUp}
                  disabled={checkoutLoading}
                  className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : "+ Top Up"}
                </button>
              )}
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
              <Zap className="mb-4 text-blue-500" size={24} fill="currentColor" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                Booking a slot will automatically deduct 1 lesson from your balance.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}