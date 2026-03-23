"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2, Star, Zap, Lock } from "lucide-react";
import Link from "next/link";

export default function BookingPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchStudentProfile();
  }, [user]);

  async function fetchStudentProfile() {
    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("email", user.primaryEmailAddress!.emailAddress)
      .single();
    setProfile(data);
    setLoading(false);
  }

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
              /* LOCK STATE: No Credits */
              <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center">
                <div className="bg-blue-50 text-blue-600 p-6 rounded-3xl mb-6">
                  <Lock size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Insufficient Lesson Balance</h2>
                <p className="text-slate-500 font-bold max-w-sm mb-10 leading-relaxed uppercase text-xs tracking-widest">
                  You currently have 0 lessons remaining. Please top up your account to unlock the booking calendar.
                </p>
                <Link href="/dashboard/payments" className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
                  Top Up Balance
                </Link>
              </div>
            ) : (
              /* ACTIVE STATE: Show Cal.com */
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
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Balance</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">
                            {profile?.lessons_balance || 0}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Sessions Remaining</p>
                    </div>
                </div>
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