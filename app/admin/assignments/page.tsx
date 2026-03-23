"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, BookOpen, Atom, Flag, Search
} from "lucide-react";

// --- TYPES ---
type Student = {
  email: string;
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
      const { data } = await supabase.from('progress').select('student_email');
      
      if (data) {
        const uniqueEmails = Array.from(new Set((data as any[]).map(d => d.student_email)))
          .map(email => ({ email: email as string }));
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
    // FIX: Only run if selectedStudent is actually a string
    if (!selectedStudent) return;

    async function fetchData() {
      setLoading(true);
      
      const { data: modulesData } = await supabase.from('modules').select('*').order('order_index');
      const { data: topicsData } = await supabase.from('topics').select('*');
      
      // FIX FOR ERROR ON LINE 68: Tell TS that selectedStudent is definitely a string here
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('student_email', selectedStudent as string);

      if (modulesData && topicsData) {
        const mData = modulesData as any[];
        const tData = topicsData as any[];
        const pData = progressData as any[] || [];

        const merged = mData.map((mod) => {
           const modTopics = tData
            .filter((t) => t.module_id === mod.id)
            .map((topic) => {
                const prog = pData.find(p => p.topic_id === topic.id);
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

    // Optimistic UI Update
    setModules(prev => prev.map(mod => ({
        ...mod,
        topics: mod.topics.map(t => t.id === topicId ? { ...t, is_assigned: !currentstate } : t)
    })));

    const currentStatus = modules.flatMap(m => m.topics).find(t => t.id === topicId)?.status || 'todo';

    // DB Update
    await supabase.from('progress').upsert({
        student_email: selectedStudent as string,
        topic_id: topicId,
        is_assigned: !currentstate,
        status: currentStatus
    } as any, { onConflict: 'student_email, topic_id' });
  };

  const visibleModules = modules.filter(m => (m as any).subject === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-100">
            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 transition-colors">
                <ArrowLeft size={16} /> Back to Admin
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Assignment Manager</h1>
            <p className="text-xs text-slate-500 mt-1">Select a student below.</p>
        </div>
        
        <div className="p-4 space-y-2 flex-grow">
            {students.map(student => (
                <button
                    key={student.email}
                    onClick={() => setSelectedStudent(student.email)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                        selectedStudent === student.email ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                    <div className="truncate text-sm font-medium">{student.email}</div>
                </button>
            ))}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 p-8">
        {selectedStudent ? (
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Assigning: <span className="text-blue-600">{selectedStudent}</span></h2>
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button onClick={() => setActiveTab('chemistry')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${activeTab === 'chemistry' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}>
                            <BookOpen size={16} /> Chemistry
                        </button>
                        <button onClick={() => setActiveTab('physics')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${activeTab === 'physics' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>
                            <Atom size={16} /> Physics
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {visibleModules.map(module => (
                        <div key={module.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50/50 px-6 py-3 border-b font-bold text-slate-700">{module.title}</div>
                            <div className="divide-y divide-slate-100">
                                {module.topics.map(topic => (
                                    <div key={topic.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <span className="text-sm font-medium text-slate-700">{topic.title}</span>
                                        <button
                                            onClick={() => toggleAssignment(topic.id, topic.is_assigned || false)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                                topic.is_assigned ? 'bg-red-500 text-white shadow-md' : 'bg-white border text-slate-400 hover:border-red-300'
                                            }`}
                                        >
                                            <Flag size={14} fill={topic.is_assigned ? "white" : "none"} />
                                            {topic.is_assigned ? 'ASSIGNED' : 'Assign'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p>Select a student from the left to start.</p>
            </div>
        )}
      </main>
    </div>
  );
}