"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, Plus, Trash2, Save, BookOpen, 
  Video, FileQuestion, LayoutList, GripVertical, CheckCircle, HelpCircle, ChevronRight
} from "lucide-react";

// --- TYPES ---
type Topic = {
  id: string;
  module_id: number;
  title: string;
  has_video: boolean;
  has_questions: boolean;
};

type Module = {
  id: number;
  title: string;
  order_index: number;
  topics: Topic[];
};

type Question = {
  id: string;
  topic_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
};

export default function CurriculumManager() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null); // For editing quiz

  // New Data Forms
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newTopicId, setNewTopicId] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  
  // Quiz Builder State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qForm, setQForm] = useState({
      question: "", a: "", b: "", c: "", d: "", correct: "a"
  });

  // --- 1. FETCH CURRICULUM ---
  async function fetchCurriculum() {
    try {
      setLoading(true);
      const { data: modulesData } = await supabase.from('modules').select('*').order('order_index');
      const { data: topicsData } = await supabase.from('topics').select('*');

      if (modulesData && topicsData) {
        const merged = modulesData.map((mod) => ({
            ...mod,
            topics: topicsData
            .filter((t) => t.module_id === mod.id)
            .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
        }));
        setModules(merged);
        if (!activeModuleId && merged.length > 0) setActiveModuleId(merged[0].id);
      }
    } catch (error) {
      console.error("Error fetching curriculum:", error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch questions when a topic is selected
  async function fetchQuestions(topicId: string) {
    const { data } = await supabase.from('quiz_questions').select('*').eq('topic_id', topicId).order('created_at');
    setQuestions(data || []);
  }

  useEffect(() => {
    fetchCurriculum();
  }, []);

  useEffect(() => {
    if (activeTopicId) fetchQuestions(activeTopicId);
  }, [activeTopicId]);


  // --- 2. ACTIONS ---
  
  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    await supabase.from('modules').insert({ title: newModuleTitle, order_index: modules.length + 1 });
    setNewModuleTitle("");
    fetchCurriculum();
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleId || !newTopicId || !newTopicTitle) return;
    await supabase.from('topics').insert({
        id: newTopicId, module_id: activeModuleId, title: newTopicTitle, has_video: true, has_questions: true
    });
    setNewTopicId(""); setNewTopicTitle("");
    fetchCurriculum();
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopicId) return;

    const { error } = await supabase.from('quiz_questions').insert({
        topic_id: activeTopicId,
        question: qForm.question,
        option_a: qForm.a,
        option_b: qForm.b,
        option_c: qForm.c,
        option_d: qForm.d,
        correct_answer: qForm.correct
    });

    if (!error) {
        setQForm({ question: "", a: "", b: "", c: "", d: "", correct: "a" }); // Reset
        fetchQuestions(activeTopicId); // Refresh list
    } else {
        alert("Error saving question");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if(!confirm("Delete this question?")) return;
    await supabase.from('quiz_questions').delete().eq('id', id);
    if (activeTopicId) fetchQuestions(activeTopicId);
  }

  if (loading && modules.length === 0) return <div className="p-12 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
             <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Curriculum & Quiz Manager</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: MODULES (Width 3) */}
        <div className="md:col-span-3 space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <LayoutList size={18} /> Modules
                </h2>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {modules.map(mod => (
                        <button
                            key={mod.id}
                            onClick={() => { setActiveModuleId(mod.id); setActiveTopicId(null); }}
                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex justify-between items-center ${
                                activeModuleId === mod.id 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                                : 'bg-white border-slate-100 hover:border-indigo-200 text-slate-600'
                            }`}
                        >
                            <span>{mod.title}</span>
                        </button>
                    ))}
                </div>
                {/* Add Module */}
                <form onSubmit={handleAddModule} className="mt-4 pt-4 border-t border-slate-100">
                    <input 
                        type="text" 
                        placeholder="New Module..." 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-bold">Add</button>
                </form>
            </div>
        </div>

        {/* MIDDLE COLUMN: TOPICS (Width 4) */}
        <div className="md:col-span-4 space-y-6">
            {activeModuleId && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="font-bold text-lg text-slate-800 mb-4">Topics</h2>
                    
                    <div className="space-y-3 mb-6">
                        {modules.find(m => m.id === activeModuleId)?.topics.map((topic) => (
                            <div 
                                key={topic.id} 
                                onClick={() => setActiveTopicId(topic.id)}
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                    activeTopicId === topic.id 
                                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' 
                                    : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="font-mono text-xs font-bold text-slate-500 w-10">{topic.id}</div>
                                <div className="font-medium text-slate-700 text-sm flex-grow">{topic.title}</div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </div>
                        ))}
                    </div>

                    {/* Add Topic */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Add Topic</h3>
                        <form onSubmit={handleAddTopic} className="space-y-2">
                            <input 
                                type="text" placeholder="ID (e.g. 1.5)" className="w-full px-3 py-2 border rounded text-sm"
                                value={newTopicId} onChange={(e) => setNewTopicId(e.target.value)}
                            />
                            <input 
                                type="text" placeholder="Title..." className="w-full px-3 py-2 border rounded text-sm"
                                value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)}
                            />
                            <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded text-sm font-bold">Save Topic</button>
                        </form>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: QUIZ BUILDER (Width 5) */}
        <div className="md:col-span-5">
             {activeTopicId ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg h-fit sticky top-24">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <FileQuestion size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Quiz Builder</h2>
                            <div className="text-xs text-slate-500 font-mono">Editing: {activeTopicId}</div>
                        </div>
                    </div>

                    {/* NEW QUESTION FORM */}
                    <form onSubmit={handleAddQuestion} className="space-y-3 mb-8 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <textarea 
                            placeholder="Type question here..." 
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={2}
                            value={qForm.question}
                            onChange={e => setQForm({...qForm, question: e.target.value})}
                            required
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {['a','b','c','d'].map((opt) => (
                                <div key={opt} className="flex items-center gap-2">
                                    <input 
                                        type="radio" name="correct" 
                                        checked={qForm.correct === opt}
                                        onChange={() => setQForm({...qForm, correct: opt as any})}
                                        className="accent-blue-600 cursor-pointer"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder={`Option ${opt.toUpperCase()}`}
                                        className={`w-full px-2 py-1.5 border rounded text-sm ${qForm.correct === opt ? 'border-blue-400 bg-white' : 'border-slate-200'}`}
                                        // @ts-ignore
                                        value={qForm[opt]}
                                        // @ts-ignore
                                        onChange={e => setQForm({...qForm, [opt]: e.target.value})}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                            <Plus size={16} /> Add Question
                        </button>
                    </form>

                    {/* EXISTING QUESTIONS LIST */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Existing Questions ({questions.length})</h3>
                        
                        {questions.length === 0 && (
                            <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                No questions yet. Add one above!
                            </div>
                        )}

                        {questions.map((q, idx) => (
                            <div key={q.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 group relative">
                                <button 
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="font-bold text-slate-800 text-sm mb-2 pr-6">
                                    <span className="text-slate-400 mr-2">Q{idx+1}.</span>{q.question}
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <div className={q.correct_answer === 'a' ? 'text-green-600 font-bold' : 'text-slate-500'}>A: {q.option_a}</div>
                                    <div className={q.correct_answer === 'b' ? 'text-green-600 font-bold' : 'text-slate-500'}>B: {q.option_b}</div>
                                    <div className={q.correct_answer === 'c' ? 'text-green-600 font-bold' : 'text-slate-500'}>C: {q.option_c}</div>
                                    <div className={q.correct_answer === 'd' ? 'text-green-600 font-bold' : 'text-slate-500'}>D: {q.option_d}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
             ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <HelpCircle size={48} className="mb-4 text-slate-300" />
                    <p className="font-medium">Select a Topic from the middle column</p>
                    <p className="text-sm">to add or edit quiz questions.</p>
                 </div>
             )}
        </div>

      </div>
    </div>
  );
}