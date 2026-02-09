"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, User, BookOpen, Atom, Flag, CheckCircle, Search
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
  is_assigned?: boolean; // We will merge this in
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
      // We get unique emails from the progress table
      const { data } = await supabase.from('progress').select('student_email');
      
      if (data) {
        // Extract unique emails
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
      
      // A. Get Curriculum
      const { data: modulesData } = await supabase.from('modules').select('*').order('order_index');
      const { data: topicsData } = await supabase.from('topics').select('*');
      
      // B. Get THIS Student's Assignments
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
  }, [selectedStudent]); // Re-run whenever we click a different student


  // --- 3. TOGGLE ASSIGNMENT ---
  const toggleAssignment = async (topicId: string, currentstate: boolean) => {
    if (!selectedStudent) return;

    // 1. Optimistic Update (Instant UI change)
    setModules(prev => prev.map(mod => ({
        ...mod,
        topics: mod.topics.map(t => t.id === topicId ? { ...t, is_assigned: !currentstate } : t)
    })));

    // 2. Database Update
    // We upsert: if row exists, update 'is_assigned'. If not, create it.
    await supabase.from('progress').upsert({
        student_email: selectedStudent,
        topic_id: topicId,
        is_assigned: !currentstate,
        // We must preserve existing status, or default to 'todo' if new
        status: modules.flatMap(m => m.topics).find(t => t.id === topicId)?.status || 'todo'
    }, { onConflict: 'student_email, topic_id' });
  };


  const visibleModules = modules.filter(m => m.subject === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR: STUDENT LIST */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-100">
            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 transition-colors">
                <ArrowLeft size={16} /> Back to Admin
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Assignment Manager</h1>
            <p className="text-xs text-slate-500 mt-1">Select a student to manage homework.</p>
        </div>
        
        <div className="p-4 space-y-2 flex-grow">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Students Found</div>
            {students.map(student => (
                <button
                    key={student.email}
                    onClick={() => setSelectedStudent(student.email)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                        selectedStudent === student.email 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        selectedStudent === student.email ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                        {student.email.substring(0,2).toUpperCase()}
                    </div>
                    <div className="truncate text-sm font-medium">{student.email}</div>
                </button>
            ))}
             {students.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-sm italic">
                    No students have logged in yet.
                </div>
            )}
        </div>
      </aside>

      {/* RIGHT SIDE: CURRICULUM & ASSIGNMENTS */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 p-8">
        
        {selectedStudent ? (
            <div className="max-w-4xl mx-auto">
                
                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Assigning to: <span className="text-blue-600">{selectedStudent}</span>
                        </h2>
                    </div>
                    
                    {/* SUBJECT TABS */}
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button 
                            onClick={() => setActiveTab('chemistry')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
                                activeTab === 'chemistry' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <BookOpen size={16} /> Chemistry
                        </button>
                        <button 
                             onClick={() => setActiveTab('physics')}
                             className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
                                activeTab === 'physics' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <Atom size={16} /> Physics
                        </button>
                    </div>
                </div>

                {/* MODULE LIST */}
                <div className="space-y-6">
                    {visibleModules.map(module => (
                        <div key={module.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 font-bold text-slate-700">
                                {module.title}
                            </div>
                            <div className="divide-y divide-slate-100">
                                {module.topics.map(topic => (
                                    <div key={topic.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                                {topic.id}
                                            </span>
                                            <span className={`text-sm font-medium ${topic.status === 'complete' ? 'text-green-600 line-through decoration-slate-300' : 'text-slate-700'}`}>
                                                {topic.title}
                                            </span>
                                            {topic.status === 'complete' && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                    <CheckCircle size={10} /> Done
                                                </span>
                                            )}
                                        </div>

                                        {/* ASSIGN TOGGLE BUTTON */}
                                        <button
                                            onClick={() => toggleAssignment(topic.id, topic.is_assigned || false)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                                topic.is_assigned 
                                                ? 'bg-red-500 text-white shadow-md shadow-red-200' 
                                                : 'bg-white border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-400'
                                            }`}
                                        >
                                            <Flag size={14} fill={topic.is_assigned ? "white" : "none"} />
                                            {topic.is_assigned ? 'ASSIGNED' : 'Assign Homework'}
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
                <p>Select a student from the left to start assigning work.</p>
            </div>
        )}

      </main>
    </div>
  );
}