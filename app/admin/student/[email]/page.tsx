"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, Check, Video, FileQuestion, 
  ShieldAlert, User
} from "lucide-react";

// --- TYPES ---
type ProgressRecord = {
  topic_id: string;
  status: 'todo' | 'review' | 'complete' | 'locked';
  confidence: number;
};

type TopicRow = {
  id: string;
  module_id: number;
  title: string;
  has_video: boolean;
  has_questions: boolean;
};

type ModuleRow = {
  id: number;
  title: string;
  order_index: number;
};

type Topic = TopicRow & {
  status: 'todo' | 'review' | 'complete' | 'locked';
  confidence: number;
};

type Module = ModuleRow & {
  topics: Topic[];
};

export default function StudentDetail({ params }: { params: Promise<{ email: string }> }) {
  // Unwrap params using React.use() for Next.js 15 compatibility
  const resolvedParams = use(params);
  const targetEmail = decodeURIComponent(resolvedParams.email);
  
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH TARGET STUDENT DATA ---
  useEffect(() => {
    if (!targetEmail) return;

    async function fetchData() {
      try {
        setLoading(true);

        // A. Get Modules & Topics (Standard curriculum)
        const { data: modulesData } = await supabase.from('modules').select('*').order('order_index');
        const { data: topicsData } = await supabase.from('topics').select('*');

        // B. Get Progress for TARGET student
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('*')
          .eq('student_email', targetEmail);

        if (progressError) throw progressError;

        // C. Merge curriculum with student progress
        const mergedData = (modulesData as ModuleRow[]).map((mod) => {
          const modTopics = (topicsData as TopicRow[])
            .filter((t) => t.module_id === mod.id)
            .map((topic) => {
              const prog = (progressData as ProgressRecord[]).find((p) => p.topic_id === topic.id);
              return {
                ...topic,
                status: prog ? prog.status : 'todo',
                confidence: prog ? prog.confidence : 0,
              };
            });
            modTopics.sort((a, b) => a.id.localeCompare(b.id));
          return { ...mod, topics: modTopics };
        });

        setModules(mergedData);

      } catch (error) {
        console.error("Error loading student:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [targetEmail]);

  // --- 2. TEACHER OVERRIDE (Save to DB) ---
  const toggleTopicStatus = async (topicId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'complete' ? 'todo' : 'complete';

    // Optimistic UI Update
    setModules((prev) => 
      prev.map((mod) => ({
        ...mod,
        topics: mod.topics.map((t) => 
          t.id === topicId ? { ...t, status: newStatus } : t
        )
      }))
    );

    // Database Update
    await supabase
      .from('progress')
      .upsert({ 
        student_email: targetEmail,
        topic_id: topicId,
        status: newStatus,
      }, { onConflict: 'student_email, topic_id' });
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-sans">Loading student profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* TEACHER HEADER */}
      <div className="bg-amber-100 border-b border-amber-200 px-8 py-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3 text-amber-900 font-bold text-sm uppercase tracking-wide">
            <ShieldAlert size={18} /> Teacher View • Editing Mode
        </div>
        <Link href="/admin" className="text-amber-800 hover:text-amber-950 font-bold text-sm flex items-center gap-1 no-underline">
            <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        
        {/* STUDENT HEADER */}
        <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 italic font-black text-3xl">
                {targetEmail[0].toUpperCase()}
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight m-0">
                  {targetEmail.split('@')[0]}
                </h1>
                <div className="text-slate-400 font-bold text-sm mt-1">{targetEmail}</div>
            </div>
        </div>

        {/* TRACKER LIST */}
        <div className="space-y-6">
          {modules.map((module) => (
            <div key={module.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-black text-xl text-slate-900 m-0">{module.title}</h3>
                {/* Visual completion bar for this module */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {Math.round((module.topics.filter(t => t.status === 'complete').length / module.topics.length) * 100)}%
                  </span>
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                          className="h-full bg-blue-600 transition-all duration-500" 
                          style={{ width: `${(module.topics.filter(t => t.status === 'complete').length / module.topics.length) * 100}%` }}
                      ></div>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-slate-50">
                {module.topics.map((topic) => (
                  <div key={topic.id} className="px-8 py-5 flex items-center gap-6 hover:bg-slate-50 group transition-colors">
                    
                    {/* TEACHER CHECKBOX */}
                    <button 
                        onClick={() => toggleTopicStatus(topic.id, topic.status || 'todo')}
                        className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                            topic.status === 'complete' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 group-hover:border-blue-400'
                        }`}
                        title="Mark as complete for student"
                    >
                      <Check size={16} strokeWidth={4} />
                    </button>

                    <div className="flex-grow">
                        <div className="flex items-center gap-3">
                            <span className="font-black text-xs text-slate-300 uppercase tracking-tighter w-8">{topic.id}</span>
                            <span className={`font-bold text-base transition-all ${topic.status === 'complete' ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                                {topic.title}
                            </span>
                        </div>
                    </div>

                    {/* Resources Icons (Read Only) */}
                    <div className="flex items-center gap-3">
                        {topic.has_video && <Video size={18} className="text-slate-300" />}
                        {topic.has_questions && <FileQuestion size={18} className="text-slate-300" />}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}