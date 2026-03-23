"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { 
  Zap, 
  BookOpen, 
  ArrowRight, 
  MessageSquare, 
  Star, 
  Clock, 
  Loader2, 
  GraduationCap, 
  CreditCard 
} from "lucide-react";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StudentDashboard() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const DEFAULT_WAITLIST_RATE = 40; 

  useEffect(() => {
    if (!user) return;

    const userEmail = user.primaryEmailAddress?.emailAddress.toLowerCase().trim();

    // 1. Initial Load
    fetchProfile();

    // 2. Realtime Sync: Listens for Evan's updates in the Teacher Hub
    const channel = supabase
      .channel(`sync-${userEmail}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'student_profiles',
          filter: `email=eq.${userEmail}`,
        },
        (payload) => {
          console.log("⚡ Realtime Sync: Rate updated to", payload.new.hourly_rate);
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function fetchProfile() {
    const email = user?.primaryEmailAddress?.emailAddress.toLowerCase().trim();
    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("email", email)
      .single();
    
    setProfile(data);
    setLoading(false);
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // FIX: Explicitly check that rate is not the default. 
  // We use "Number" to ensure we aren't comparing strings vs numbers.
  const isApproved = profile && Number(profile.hourly_rate) !== DEFAULT_WAITLIST_RATE;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <main className="max-w-6xl mx-auto p-8">
        
        {/* WELCOME HEADER */}
        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            Welcome, <span className="text-blue-600">{user?.firstName || "Student"}</span>
          </h2>
          <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Student Learning Portal</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-3 space-y-8">
            
            {!isApproved ? (
              /* --- PENDING APPROVAL STATE --- */
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center shadow-sm">
                <div className="bg-amber-100 text-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Application Under Review</h3>
                <p className="text-slate-500 font-medium mt-4 max-w-md mx-auto leading-relaxed">
                  Thanks for joining EB Tutors! Evan is currently reviewing your profile to set your bespoke tuition rate. 
                  You will be able to book lessons as soon as your account is activated.
                </p>
              </div>
            ) : (
              /* --- ACTIVE ACCOUNT STATE --- */
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Active Account</div>
                  <div className="flex items-end gap-6 mb-10">
                      <div className="bg-blue-600 p-5 rounded-3xl shadow-lg shadow-blue-500/20">
                          <Zap size={40} className="text-white" fill="currentColor" />
                      </div>
                      <div>
                          <div className="text-7xl font-black leading-none tracking-tighter">
                            {profile?.lessons_balance || 0}
                          </div>
                          <div className="text-xs font-black text-slate-400 mt-2 uppercase tracking-widest">Lessons Remaining</div>
                      </div>
                  </div>
                  
                  <Link href="/book" className="inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl group">
                      Book New Session <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </div>
            )}

            {/* ACTION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard href="/curriculum" icon={<BookOpen size={24}/>} title="Course Material" desc="Notes & tracking." />
                <ActionCard href="/dashboard/payments" icon={<CreditCard size={24}/>} title="Billing" desc="Receipts & top-ups." />
                <ActionCard href="mailto:evancbillings@gmail.com" icon={<MessageSquare size={24}/>} title="Support" desc="Message Evan." />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                    <Star size={14} className="text-blue-600" fill="currentColor" /> Account Details
                </h3>
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Your Rate</p>
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">
                                {/* FIX: Explicitly check for 0 so it doesn't fall back to "Awaiting Review" */}
                                {isApproved || profile?.hourly_rate === 0 ? `£${profile.hourly_rate}` : "Awaiting Review"}
                            </span>
                            {(isApproved || profile?.hourly_rate === 0) && <span className="text-sm font-black text-slate-400 tracking-tighter">/hr</span>}
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
                        <GraduationCap size={18} className="text-blue-600" />
                        <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase">St John's College</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-nowrap">Cambridge University</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ActionCard({ href, icon, title, desc }: any) {
    return (
        <Link href={href} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:border-blue-300 transition-all group h-full block">
            <div className="text-blue-600 mb-6 bg-slate-50 w-fit p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                {icon}
            </div>
            <h4 className="font-black text-slate-900 mb-1 text-lg tracking-tight">{title}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{desc}</p>
        </Link>
    );
}