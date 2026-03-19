"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { 
  BookOpen, Users, GraduationCap, ArrowRight, 
  BarChart3, Plus, Settings, CreditCard, Search
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminHub() {
  const { user, isLoaded } = useUser();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = user?.primaryEmailAddress?.emailAddress === "evancbillings@gmail.com";

  useEffect(() => {
    if (isAdmin) fetchAdminData();
  }, [isAdmin]);

  async function fetchAdminData() {
    const { data: profiles } = await supabase
      .from("student_profiles")
      .select("*")
      .order('full_name', { ascending: true });
    
    setStudents(profiles || []);
    setLoading(false);
  }

  async function updateRate(id: string, newRate: number) {
    await supabase.from("student_profiles").update({ hourly_rate: newRate }).eq("id", id);
    fetchAdminData();
  }

  if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Initialising Teacher Hub...</div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Unauthorized Access</div>;

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* GLOBAL HEADER */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-lg"><Settings size={20}/></div>
            <h1 className="text-xl font-bold tracking-tight">Teacher Hub</h1>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition">View Student Portal</Link>
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        
        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Users/>} label="Total Students" value={students.length} color="blue" />
          <StatCard icon={<CreditCard/>} label="Avg. Rate" value={`£${Math.round(students.reduce((acc, curr) => acc + curr.hourly_rate, 0) / students.length)}`} color="emerald" />
          <StatCard icon={<BookOpen/>} label="Active Modules" value="4" color="indigo" />
          <StatCard icon={<GraduationCap/>} label="Predicted 9s" value="6" color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT: STUDENT MANAGEMENT */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="font-bold text-lg text-slate-800">Student Roster</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all w-64"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-8 py-4">Student Details</th>
                      <th className="px-8 py-4">Hourly Rate</th>
                      <th className="px-8 py-4 text-right">Settings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-bold text-slate-700">{s.full_name || "New Student"}</div>
                          <div className="text-xs text-slate-400 font-medium">{s.email}</div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm">
                            £{s.hourly_rate}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <select 
                            onChange={(e) => updateRate(s.id, parseInt(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all"
                            value={s.hourly_rate}
                          >
                            {[30, 35, 40, 45, 50, 55, 60, 65, 70, 80].map(r => (
                              <option key={r} value={r}>£{r}/hr</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: QUICK TOOLS */}
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 px-2 text-sm uppercase tracking-widest">Management Tools</h2>
            <ToolLink href="/admin/curriculum" icon={<BookOpen/>} title="Curriculum" desc="Update syllabus points and LaTeX content." color="blue" />
            <ToolLink href="/admin/questions" icon={<Plus/>} title="Question Factory" desc="Add MCQ or 6-marker questions instantly." color="amber" />
            <ToolLink href="/admin/analytics" icon={<BarChart3/>} title="Performance" desc="View student grades and heatmaps." color="emerald" />
          </div>

        </div>
      </main>
    </div>
  );
}

// HELPER COMPONENTS
function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600"
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={`${colors[color]} p-3 rounded-xl`}>{icon}</div>
      <div>
        <div className="text-2xl font-black text-slate-800">{value}</div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function ToolLink({ href, icon, title, desc, color }: any) {
  const colors: any = {
    blue: "group-hover:bg-blue-600 bg-blue-50 text-blue-600",
    amber: "group-hover:bg-amber-600 bg-amber-50 text-amber-600",
    emerald: "group-hover:bg-emerald-600 bg-emerald-50 text-emerald-600"
  };
  return (
    <Link href={href} className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-start gap-4">
      <div className={`${colors[color]} p-3 rounded-xl text-white transition-colors flex-shrink-0 text-current`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mt-1">{desc}</p>
      </div>
    </Link>
  );
}