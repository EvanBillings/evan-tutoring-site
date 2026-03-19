"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, Check, Video, FileQuestion, 
  ShieldAlert, User, BarChart3
} from "lucide-react";

// --- TYPES ---
type Topic = {
  id: string;
  module_id: number;
  title: string;
  has_video: boolean;
  has_questions: boolean;
  status: 'todo' | 'complete';
};

type Module = {
  id: number;
  title: string;
  topics: Topic[];
};

export default function StudentDetail({ params }: { params: Promise<{ email: string }> }) {
  // Unwrapping params for Next.js 15
  const resolvedParams = use(params);
  const targetEmail = decodeURIComponent(resolvedParams.email);
  
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!targetEmail) return;
      try {
        setLoading(true);
        // A. Get curriculum
        const { data: mods } = await supabase.from('modules').select('*').order('order_index');
        const { data: tops } = await supabase.from('topics').select('*');
        // B. Get student progress
        const { data: prog } = await supabase.from('progress').select('*').eq('student_email', targetEmail);

        const merged = (mods || []).map(m => ({
          ...m,
          topics: (tops || []).filter(t => t.module_id === m.id).map(t => ({
            ...t,
            status: prog?.find(p => p.topic_id === t.id)?.status || 'todo'
          }))
        }));
        setModules(merged);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [targetEmail]);

  const toggleStatus = async (topicId: string, current: string) => {
    const next = current === 'complete' ? 'todo' : 'complete';
    
    // Optimistic UI Update
    setModules(prev => prev.map(m => ({
      ...m,
      topics: m.topics.map(t => t.id === topicId ? { ...t, status: next as 'todo' | 'complete' } : t)
    })));

    // Sync to Database
    await supabase.from('progress').upsert({ 
      student_email: targetEmail, 
      topic_id: topicId, 
      status: next 
    }, { onConflict: 'student_email, topic_id' });
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300">Syncing Student Data...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* ADMIN OVERLAY HEADER */}
      <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-widest">
          <ShieldAlert size={16} /> EB Admin • Editing Mode • {targetEmail}
        </div>
        <Link href="/admin" className="text-amber-700 font-black text-xs no-underline flex items-center gap-2 hover:opacity-70">
          <ArrowLeft size={16} /> Exit Editor
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-10">
        {/* STUDENT HEADER */}
        <div className="flex items-center gap-6 mb-12">
            <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl italic font-black text-3xl">
                {targetEmail[0].toUpperCase()}
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight m-0">
                  {targetEmail.split('@')[0]}
                </h1>
                <p className="text-slate-400 font-bold m-0 mt-1 uppercase text-xs tracking-widest">Mastery Tracker</p>
            </div>
        </div>

        {/* TRACKER LIST */}
        <div className="space-y-8">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-black text-xl text-slate-900 m-0 tracking-tight">{mod.title}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {Math.round((mod.topics.filter(t => t.status === 'complete').length / mod.topics.length) * 100)}%
                  </span>
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-700" 
                      style={{ width: `${(mod.topics.filter(t => t.status === 'complete').length / mod.topics.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {mod.topics.map((topic) => (
                  <div key={topic.id} className="px-8 py-5 flex items-center gap-6 group hover:bg-slate-50 transition-colors">
                    {/* MASTER TOGGLE */}
                    <button 
                      onClick={() => toggleStatus(topic.id, topic.status)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                        topic.status === 'complete' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border-slate-200'
                      }`}
                    >
                      <Check size={16} strokeWidth={4} />
                    </button>
                    
                    <span className={`flex-grow font-bold text-lg transition-all ${topic.status === 'complete' ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                      {topic.title}
                    </span>

                    <div className="flex gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                      {topic.has_video && <Video size={18} className="text-slate-400" />}
                      {topic.has_questions && <FileQuestion size={18} className="text-slate-400" />}
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