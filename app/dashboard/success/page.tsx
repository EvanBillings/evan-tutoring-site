"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, ArrowRight, PartyPopper } from "lucide-react";
export const dynamic = 'force-dynamic';
export default function BookingSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6">
          <CheckCircle size={40} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2">Lesson Booked!</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Payment received. Your session with Evan is now officially secured.
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left border border-slate-100">
          <div className="flex items-center gap-3 text-slate-700 font-bold mb-1">
            <Calendar size={18} className="text-blue-600" />
            <span>Check your email</span>
          </div>
          <p className="text-xs text-slate-500 ml-7">
            A Google Meet link and calendar invitation have been sent to your primary email address.
          </p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/dashboard" 
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            Go to Dashboard <ArrowRight size={18} />
          </Link>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            EB Tutors • Ref: {sessionId?.substring(0, 10)}...
          </p>
        </div>
      </div>
    </div>
  );
}