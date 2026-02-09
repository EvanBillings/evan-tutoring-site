"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, Check, Video, FileQuestion, BookOpen, 
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
  // Unwrap params using React.use() for Next.js 15 compatibility, or await if async component
  // For client components in older Next.js, params are props. 
  // We'll handle the email decoding safely inside the effect or using the hook pattern.
  const [targetEmail, setTargetEmail] = useState<string>("");
  
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize email from params
  useEffect(() => {
    params.then(p => setTargetEmail(decodeURIComponent(p.email)));
  }, [params]);

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

        // C. Merge
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
    return <div className="p-12 text-center text-slate-500">Loading student profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* TEACHER HEADER */}
      <div className="bg-amber-100 border-b border-amber-200 px-8 py-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3 text-amber-900 font-bold text-sm uppercase tracking-wide">
            <ShieldAlert size={18} /> Teacher View • Editing Mode
        </div>
        <Link href="/admin" className="text-amber-800 hover:text-amber-950 font-bold text-sm flex items-center gap-1">
            <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        
        {/* STUDENT HEADER */}
        <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border-4 border-white shadow-lg">
                <User size={40} />
            </div>
            <div>
                <h1 className="text-4xl font-bold text-slate-900">{targetEmail.split('@')[0]}</h1>
                <div className="text-slate-500 font-mono text-sm mt-1">{targetEmail}</div>
            </div>
        </div>

        {/* TRACKER LIST */}
        <div className="space-y-6">
          {modules.map((module) => (
            <div key={module.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">{module.title}</h3>
                {/* Visual completion bar for this module */}
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${(module.topics.filter(t => t.status === 'complete').length / module.topics.length) * 100}%` }}
                    ></div>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {module.topics.map((topic) => (
                  <div key={topic.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 group">
                    
                    {/* TEACHER CHECKBOX */}
                    <button 
                        onClick={() => toggleTopicStatus(topic.id, topic.status || 'todo')}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            topic.status === 'complete' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 group-hover:border-indigo-300'
                        }`}
                        title="Mark as complete for student"
                    >
                      <Check size={14} strokeWidth={4} />
                    </button>

                    <div className="flex-grow">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400 font-bold">{topic.id}</span>
                            <span className={`font-medium ${topic.status === 'complete' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                {topic.title}
                            </span>
                        </div>
                    </div>

                    {/* Resources Icons (Read Only) */}
                    <div className="flex items-center gap-2 opacity-50">
                        {topic.has_video && <Video size={16} className="text-slate-400" />}
                        {topic.has_questions && <FileQuestion size={16} className="text-slate-400" />}
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