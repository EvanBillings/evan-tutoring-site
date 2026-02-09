"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  ArrowLeft, Plus, Save, Trash2, CheckCircle, 
  AlertCircle, BookOpen, Filter, Image as ImageIcon
} from "lucide-react";

type Topic = {
  id: string;
  title: string;
  module_id: number;
};

type Question = {
  id: string;
  topic_id: string;
  question: string;
  image_url?: string; // New field
  created_at: string;
};

export default function QuestionFactory() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Form State
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // New State
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("a");
  const [explanation, setExplanation] = useState("");

  // 1. Fetch Data
  useEffect(() => {
    fetchTopics();
    fetchRecentQuestions();
  }, []);

  async function fetchTopics() {
    const { data } = await supabase.from('topics').select('id, title, module_id').order('id');
    if (data) setTopics(data);
    setLoading(false);
  }

  async function fetchRecentQuestions() {
    const { data } = await supabase
      .from('quiz_questions')
      .select('id, topic_id, question, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setRecentQuestions(data);
  }

  // 2. Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    if (!selectedTopic) {
        setMsg({ type: 'error', text: 'Please select a topic first.' });
        setSaving(false);
        return;
    }

    const { error } = await supabase.from('quiz_questions').insert({
      topic_id: selectedTopic,
      question: questionText,
      image_url: imageUrl || null, // Save URL or null
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer,
      explanation: explanation
    });

    if (error) {
        setMsg({ type: 'error', text: error.message });
    } else {
        setMsg({ type: 'success', text: 'Question added successfully!' });
        // Clear form (keep topic selected for speed)
        setQuestionText("");
        setImageUrl(""); // Clear image
        setOptionA("");
        setOptionB("");
        setOptionC("");
        setOptionD("");
        setExplanation("");
        setCorrectAnswer("a");
        // Refresh list
        fetchRecentQuestions();
    }
    setSaving(false);
  }

  // 3. Delete Handler
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    await supabase.from('quiz_questions').delete().eq('id', id);
    fetchRecentQuestions();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Plus className="text-blue-600" /> Question Factory
                    </h1>
                    <p className="text-slate-500 text-sm">Add questions to the database.</p>
                </div>
            </div>
            
            {msg && (
                <div className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
                    msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {msg.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                    {msg.text}
                </div>
            )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: THE FORM */}
        <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                
                {/* Topic Selector */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Topic</label>
                    <div className="relative">
                        <select 
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        >
                            <option value="">-- Choose a Topic --</option>
                            {topics.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.id} - {t.title}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Filter size={16} />
                        </div>
                    </div>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Question</label>
                    <textarea 
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="e.g. What is the unit for Force?"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                        required
                    />
                </div>

                {/* Image URL (Optional) - NEW */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Image URL (Optional)</label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-grow">
                            <input 
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://imgur.com/example.png"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Paste a direct link to an image (ending in .png, .jpg)</p>
                        </div>
                        {/* Tiny Preview */}
                        <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {imageUrl ? (
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={16} className="text-slate-300" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {['a', 'b', 'c', 'd'].map((opt) => (
                        <div key={opt} className={`relative group ${correctAnswer === opt ? 'ring-2 ring-green-500 rounded-xl' : ''}`}>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs font-bold uppercase flex items-center justify-center">
                                {opt}
                            </div>
                            <input 
                                type="text"
                                // @ts-ignore
                                value={opt === 'a' ? optionA : opt === 'b' ? optionB : opt === 'c' ? optionC : optionD}
                                // @ts-ignore
                                onChange={(e) => {
                                    if(opt==='a') setOptionA(e.target.value);
                                    if(opt==='b') setOptionB(e.target.value);
                                    if(opt==='c') setOptionC(e.target.value);
                                    if(opt==='d') setOptionD(e.target.value);
                                }}
                                placeholder={`Option ${opt.toUpperCase()}`}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                            {/* Correct Answer Radio */}
                            <button
                                type="button"
                                onClick={() => setCorrectAnswer(opt)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    correctAnswer === opt 
                                    ? 'border-green-500 bg-green-500 text-white' 
                                    : 'border-slate-300 text-transparent hover:border-green-400'
                                }`}
                                title="Mark as Correct Answer"
                            >
                                <CheckCircle size={12} fill="currentColor" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Explanation */}
                <div className="mb-8">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Explanation (Optional)</label>
                    <input 
                        type="text"
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="Why is the answer correct?"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? "Saving..." : <><Save size={20} /> Add Question to Database</>}
                </button>

            </form>
        </div>

        {/* RIGHT COLUMN: RECENT HISTORY */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BookOpen size={16} /> Recently Added
                </h3>
                
                <div className="space-y-3">
                    {loading && <div className="text-sm text-slate-400">Loading history...</div>}
                    
                    {!loading && recentQuestions.length === 0 && (
                        <div className="text-sm text-slate-400 italic">No questions added yet.</div>
                    )}

                    {recentQuestions.map((q) => (
                        <div key={q.id} className="group p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-default">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{q.topic_id}</span>
                                <button 
                                    onClick={() => handleDelete(q.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                    title="Delete Question"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {q.image_url && (
                                    <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden">
                                         <img src={q.image_url} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="text-sm font-medium text-slate-700 line-clamp-2 leading-snug">
                                    {q.question}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}