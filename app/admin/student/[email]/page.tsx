"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { 
  ArrowLeft, ExternalLink, PoundSterling, Mail, 
  Zap, PlusCircle, MinusCircle, Loader2 
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminStudentList() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .order('full_name', { ascending: true });
    
    if (!error && data) setStudents(data);
    setLoading(false);
  }

  // Update the Student's Private Hourly Rate
  async function updateRate(id: string, newRate: number) {
    const rateToSave = Math.max(0, newRate); 
    setStudents(prev => prev.map(s => s.id === id ? { ...s, hourly_rate: rateToSave } : s));

    await supabase
      .from("student_profiles")
      .update({ hourly_rate: rateToSave })
      .eq("id", id);
  }

  // Update the Lesson Balance (Add or Subtract)
  async function adjustBalance(id: string, currentBalance: number, amount: number) {
    const newBalance = Math.max(0, currentBalance + amount);
    
    // Optimistic UI Update
    setStudents(prev => prev.map(s => s.id === id ? { ...s, lessons_balance: newBalance } : s));

    await supabase
      .from("student_profiles")
      .update({ lessons_balance: newBalance })
      .eq("id", id);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <div className="font-bold text-slate-400 uppercase tracking-widest text-xs">Accessing Student Database...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/admin" className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-8 no-underline hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
          EB Tutors <span className="text-blue-600">Student Manager</span>
        </h1>

        <div className="grid grid-cols-1 gap-4">
          {students.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold">
              No students found in the database.
            </div>
          ) : (
            students.map((student) => (
              <div key={student.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm hover:shadow-md transition-shadow">
                
                {/* 1. STUDENT INFO */}
                <div className="flex items-center gap-4 flex-grow min-w-0">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl italic flex-shrink-0 shadow-lg shadow-slate-200">
                    {student.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-slate-900 m-0 text-xl leading-tight">{student.full_name}</h3>
                    <p className="text-slate-400 text-sm font-medium m-0 flex items-center gap-1 truncate">
                      <Mail size={12} /> {student.email}
                    </p>
                  </div>
                </div>

                {/* 2. LESSON BALANCE CONTROL */}
                <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</span>
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" fill="currentColor" />
                            <span className="text-2xl font-black text-slate-900 leading-none">{student.lessons_balance || 0}</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => adjustBalance(student.id, student.lessons_balance || 0, -1)}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                        >
                            <MinusCircle size={20} />
                        </button>
                        <button 
                            onClick={() => adjustBalance(student.id, student.lessons_balance || 0, 1)}
                            className="p-1 text-slate-300 hover:text-emerald-500 transition-colors"
                        >
                            <PlusCircle size={20} />
                        </button>
                    </div>
                </div>

                {/* 3. RATE CONTROL & LINKS */}
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hourly Rate</span>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-inner">
                      <PoundSterling size={14} className="text-blue-600" />
                      <input 
                        type="number"
                        min="0"
                        step="1"
                        value={student.hourly_rate}
                        onChange={(e) => updateRate(student.id, Number(e.target.value))}
                        className="w-16 bg-transparent border-none font-black text-slate-900 outline-none p-0 text-right focus:ring-0 text-lg"
                      />
                    </div>
                  </div>

                  <Link 
                    href={`/admin/students/${encodeURIComponent(student.email)}`}
                    className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-100 flex items-center justify-center"
                    title="View Progress Tracker"
                  >
                    <ExternalLink size={20} />
                  </Link>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}