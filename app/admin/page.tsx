"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { 
  Users, CreditCard, BookOpen, GraduationCap, 
  Search, BookText, PlusSquare, BarChart3, Loader2 
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase.from("student_profiles").select("*").order('full_name');
    if (data) setStudents(data);
    setLoading(false);
  }

  // UPDATED: Reliable rate update with console logging
  async function updateRate(id: string, newRate: number) {
    const rateToSave = Number(newRate);
    
    // 1. Optimistic Update (UI changes immediately)
    setStudents(prev => prev.map(s => s.id === id ? { ...s, hourly_rate: rateToSave } : s));

    // 2. Database Save
    const { error } = await supabase
      .from("student_profiles")
      .update({ hourly_rate: rateToSave })
      .eq("id", id);

    if (error) {
      console.error("❌ DB Update Failed:", error.message);
    } else {
      console.log(`✅ DB Update Success: ID ${id} is now £${rateToSave}`);
    }
  }

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgRate = students.length > 0 
    ? Math.round(students.reduce((acc, curr) => acc + (curr.hourly_rate || 0), 0) / students.length) 
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <div className="max-w-7xl mx-auto p-8">
        
        {/* Page Title Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Teacher Hub</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Management & Administration</p>
        </div>
        
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Users size={24} />} val={students.length} label="Total Students" color="bg-blue-50 text-blue-600" />
          <StatCard icon={<CreditCard size={24} />} val={`£${avgRate}`} label="Avg. Rate" color="bg-emerald-50 text-emerald-600" />
          <StatCard icon={<BookOpen size={24} />} val="4" label="Active Modules" color="bg-indigo-50 text-indigo-600" />
          <StatCard icon={<GraduationCap size={24} />} val="6" label="Predicted 9s" color="bg-amber-50 text-amber-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Student Roster (Now wider) */}
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Student Roster</h2>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus-within:border-blue-400 transition-colors">
                <Search size={16} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="bg-transparent border-none text-sm outline-none font-bold text-slate-700 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="p-8">
              <div className="flex text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">
                <div className="flex-1">Student Details</div>
                <div className="w-32 text-center">Hourly Rate</div>
                <div className="w-24 text-right">Settings</div>
              </div>

              <div className="space-y-2">
                {loading ? (
                  <div className="flex flex-col items-center p-12 gap-2 text-slate-400">
                    <Loader2 className="animate-spin text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Fetching Roster</span>
                  </div>
                ) : filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                    <div className="flex-1">
                      <h3 className="font-black text-slate-900 leading-none tracking-tight">{student.full_name || "New Student"}</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">{student.email}</p>
                    </div>
                    
                    {/* FIXED INPUT STYLE */}
                    <div className="w-32 flex justify-center">
                      <div className="flex items-center gap-0.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <span className="text-slate-900 font-black text-sm">£</span>
                        <input 
                          type="number" 
                          min="0"
                          value={student.hourly_rate}
                          onChange={(e) => updateRate(student.id, Number(e.target.value))}
                          className="w-10 bg-transparent border-none outline-none text-center font-black text-slate-900 p-0 text-sm tracking-tighter"
                        />
                        <span className="text-slate-400 font-black text-[10px] tracking-tighter uppercase">/hr</span>
                      </div>
                    </div>

                    <div className="w-24 text-right">
                       <Link 
                          href={`/admin/student/${encodeURIComponent(student.email)}`}
                          className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          Tracker
                        </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Management Tools */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-4">Management</h2>
            <ToolCard icon={<BookText size={20}/>} title="Curriculum" desc="Update syllabus points." />
            <ToolCard icon={<PlusSquare size={20}/>} title="Factory" desc="Add MCQ questions." />
            <ToolCard icon={<BarChart3 size={20}/>} title="Grades" desc="View student heatmaps." />
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, val, label, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-200 transition-colors">
      <div className={`p-4 ${color} rounded-2xl shadow-sm`}>{icon}</div>
      <div>
        <p className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{val}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">{label}</p>
      </div>
    </div>
  )
}

function ToolCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-400 transition-all cursor-pointer group shadow-blue-900/5">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">{icon}</div>
        <h3 className="font-black text-slate-900 text-lg tracking-tighter m-0 uppercase">{title}</h3>
      </div>
      <p className="text-[10px] font-bold text-slate-400 m-0 uppercase tracking-widest leading-relaxed">{desc}</p>
    </div>
  )
}