"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, BookOpen, Atom, Flag, CheckCircle, Search, Loader2
} from "lucide-react";

// --- TYPES ---
type Student = {
  email: string;
  last_active?: string;
};

type Topic = {
  id: string;
  module_id: number;
  title: string;
  is_assigned?: boolean; 
  status?: string;
};

type Module = {
  id: number;
  title: string;
  order_index: number;
  subject: string;
  topics: Topic[];
};

export default function AssignmentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chemistry");

  // --- 1. FETCH STUDENTS ---
  useEffect(() => {
    async function fetchStudents() {
      // Get unique emails from the progress table to see who has logged in
      const { data } = await supabase.from('progress').select('student_email');
      
      if (data) {
        const uniqueEmails = Array.from(new Set(data.map(d => d.student_email)))
          .map(email => ({ email }));
        setStudents(uniqueEmails);
        if (uniqueEmails.length > 0 && !selectedStudent) {
            setSelectedStudent(uniqueEmails[0].email);
        }
      }
    }
    fetchStudents();
  }, []);

  // --- 2. FETCH CURRICULUM & ASSIGNMENTS ---
  useEffect(() => {
    if (!selectedStudent) return;

    async function fetchData() {
      setLoading(true);
      
      const { data: modulesData } = await supabase.from('modules').select('*').order('order_index');
      const { data: topicsData } = await supabase.from('topics').select('*');
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('student_email', selectedStudent);

      if (modulesData && topicsData) {
        const merged = modulesData.map((mod) => {
           const modTopics = topicsData
            .filter((t) => t.module_id === mod.id)
            .map((topic) => {
                const prog = progressData?.find(p => p.topic_id === topic.id);
                return {
                    ...topic,
                    is_assigned: prog ? prog.is_assigned : false,
                    status: prog ? prog.status : 'todo'
                };
            })
            .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
            
            return { ...mod, topics: modTopics };
        });
        setModules(merged);
      }
      setLoading(false);
    }

    fetchData();
  }, [selectedStudent]); 


  // --- 3. TOGGLE ASSIGNMENT ---
  const toggleAssignment = async (topicId: string, currentstate: boolean) => {
    if (!selectedStudent) return;

    // 1. Optimistic Update (Instant UI change)
    setModules(prev => prev.map(mod => ({
        ...mod,
        topics: mod.topics.map(t => t.id === topicId ? { ...t, is_assigned: !currentstate } : t)
    })));

    // 2. Database Update
    await supabase.from('progress').upsert({
        student_email: selectedStudent,
        topic_id: topicId,
        is_assigned: !currentstate,
        status: modules.flatMap(m => m.topics).find(t => t.id === topicId)?.status || 'todo'
    }, { onConflict: 'student_email, topic_id' });
  };


  const visibleModules = modules.filter(m => m.subject === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR: STUDENT LIST */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-100">
            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 transition-colors font-bold text-xs uppercase tracking-widest no-underline">
                <ArrowLeft size={16} /> Back
            </Link>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Assignments</h1>
        </div>
        
        <div className="p-4 space-y-2 flex-grow">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Select Student</div>
            {students.map(student => (
                <button
                    key={student.email}
                    onClick={() => setSelectedStudent(student.email)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                        selectedStudent === student.email 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                        selectedStudent === student.email ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                        {student.email.substring(0,2).toUpperCase()}
                    </div>
                    <div className="truncate text-xs font-bold">{student.email}</div>
                </button>
            ))}
        </div>
      </aside>

      {/* RIGHT SIDE: CURRICULUM & ASSIGNMENTS */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 p-8">
        
        {selectedStudent ? (
            <div className="max-w-4xl mx-auto">
                
                {/* HEADER */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                            Manage: <span className="text-blue-600">{selectedStudent}</span>
                        </h2>
                    </div>
                    
                    {/* SUBJECT TABS */}
                    <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                        <button 
                            onClick={() => setActiveTab('chemistry')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                                activeTab === 'chemistry' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            <BookOpen size={14} /> Chemistry
                        </button>
                        <button 
                             onClick={() => setActiveTab('physics')}
                             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                                activeTab === 'physics' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            <Atom size={14} /> Physics
                        </button>
                    </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-6">
                      {visibleModules.map(module => (
                          <div key={module.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                              <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                  {module.title}
                              </div>
                              <div className="divide-y divide-slate-100">
                                  {module.topics.map(topic => (
                                      <div key={topic.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                          <div className="flex items-center gap-4">
                                              <span className="font-mono text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                                  {topic.id}
                                              </span>
                                              <span className={`text-sm font-bold ${topic.status === 'complete' ? 'text-emerald-500 line-through' : 'text-slate-700'}`}>
                                                  {topic.title}
                                              </span>
                                              {topic.status === 'complete' && (
                                                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                                                      <CheckCircle size={10} /> Done
                                                  </span>
                                              )}
                                          </div>

                                          <button
                                              onClick={() => toggleAssignment(topic.id, topic.is_assigned || false)}
                                              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                  topic.is_assigned 
                                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                                  : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600'
                                              }`}
                                          >
                                              <Flag size={14} fill={topic.is_assigned ? "white" : "none"} />
                                              {topic.is_assigned ? 'Assigned' : 'Assign'}
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
                )}
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="font-bold uppercase text-xs tracking-widest">Select a student to manage assignments</p>
            </div>
        )}

      </main>
    </div>
  );
}