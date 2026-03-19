"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { BookOpen, Calendar, Award, ArrowRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!isLoaded || !user) return;
      const { data } = await supabase
        .from("student_profiles")
        .select("hourly_rate")
        .eq("id", user.id)
        .maybeSingle();
      
      if (data) setRate(data.hourly_rate);
      setLoading(false);
    }
    fetchProfile();
  }, [user, isLoaded]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg shadow-md">
            EB
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">EB Tutors</h1>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard/book" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Book Session</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, {user?.firstName}!</h2>
            <p className="text-slate-500 mt-2 font-medium italic">Cambridge Natural Sciences • EB Tutors</p>
          </div>
          
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Personal Rate</p>
              <p className="text-3xl font-black text-slate-900">
                £{loading ? "..." : rate || "40"}
                <span className="text-sm font-bold text-slate-400">/hr</span>
              </p>
            </div>
            <Link href="/dashboard/book" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
              Book Now <ArrowRight size={16} />
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col items-center text-center">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl mb-4"><BookOpen /></div>
            <h3 className="font-bold text-slate-900">Course Materials</h3>
            <p className="text-xs text-slate-400 mt-2">Access specialized Physics & Maths notes.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col items-center text-center opacity-40">
            <div className="bg-slate-50 text-slate-600 p-4 rounded-2xl mb-4"><Calendar /></div>
            <h3 className="font-bold text-slate-900">Upcoming Sessions</h3>
            <p className="text-xs text-slate-400 mt-2">Scheduling panel coming soon.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col items-center text-center opacity-40">
            <div className="bg-slate-50 text-slate-600 p-4 rounded-2xl mb-4"><Award /></div>
            <h3 className="font-bold text-slate-900">Quiz Progress</h3>
            <p className="text-xs text-slate-400 mt-2">Track your mastery of each topic.</p>
          </div>
        </div>
      </main>
    </div>
  );
}