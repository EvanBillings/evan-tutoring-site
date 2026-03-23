"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function LessonBalance({ email }: { email: string }) {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    async function getBalance() {
      const { data } = await supabase
        .from("student_profiles")
        .select("lessons_balance")
        .eq("email", email)
        .single();
      setBalance((data as any)?.lessons_balance || 0);
    }
    getBalance();
  }, [email]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex justify-between items-center">
      <div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          Prepaid Lessons
        </div>
        <div className="flex items-center gap-2">
          <Zap className="text-amber-500" size={20} fill="currentColor" />
          <span className="text-3xl font-black text-slate-900">{balance}</span>
          <span className="text-slate-400 font-bold">Remaining</span>
        </div>
      </div>
      
      <Link href="/book" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-100">
        <PlusCircle size={24} />
      </Link>
    </div>
  );
}