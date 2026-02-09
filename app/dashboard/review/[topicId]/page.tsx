"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import { useUser, UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

type Question = {
  id: string;
  question: string;
  image_url?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
};

export default function ReviewPage() {
  const { topicId } = useParams();
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userHistory, setUserHistory] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!user?.primaryEmailAddress) return;

    async function fetchData() {
      // 1. Fetch Questions
      const { data: qData } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('topic_id', topicId);
      
      // 2. Fetch User's Answers
      const { data: pData } = await supabase
        .from('progress')
        .select('history')
        .eq('student_email', user?.primaryEmailAddress?.emailAddress)
        .eq('topic_id', topicId)
        .single();

      if (qData) setQuestions(qData);
      if (pData?.history) setUserHistory(pData.history);
      
      setLoading(false);
    }
    fetchData();
  }, [topicId, user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading Review...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
       
       {/* HEADER */}
       <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="font-bold text-lg text-slate-900">Review: {topicId}</h1>
                    <p className="text-xs text-slate-500">Review your answers and explanations.</p>
                </div>
            </div>
            <Link href={`/dashboard/quiz/${topicId}`}>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition">
                    Retake Quiz
                </button>
            </Link>
       </div>

       <div className="max-w-3xl mx-auto p-6 space-y-8">
            {questions.map((q, index) => {
                const selected = userHistory[q.id];
                const isCorrect = selected === q.correct_answer;
                const skipped = !selected;

                return (
                    <div key={q.id} className={`bg-white rounded-xl border-2 overflow-hidden ${
                        isCorrect ? 'border-green-100' : 'border-red-100'
                    }`}>
                        {/* Status Bar */}
                        <div className={`px-6 py-2 text-xs font-bold uppercase flex items-center gap-2 ${
                            isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {isCorrect ? 'Correct' : 'Incorrect'}
                        </div>

                        <div className="p-8">
                            {/* Image */}
                            {q.image_url && (
                                <div className="mb-6 flex justify-center">
                                    <img src={q.image_url} className="max-h-64 rounded-lg border border-slate-100 object-contain" />
                                </div>
                            )}

                            {/* Question */}
                            <h3 className="text-xl font-bold text-slate-900 mb-6">
                                <span className="text-slate-300 mr-2">Q{index+1}.</span>
                                <Latex>{q.question}</Latex>
                            </h3>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {['a', 'b', 'c', 'd'].map(opt => {
                                    // Logic for styling the boxes
                                    const isSelected = selected === opt;
                                    const isTheRightAnswer = q.correct_answer === opt;
                                    
                                    let style = "border-slate-200 bg-white text-slate-500 opacity-60"; // Default dim
                                    
                                    if (isTheRightAnswer) {
                                        style = "border-green-500 bg-green-50 text-green-900 font-bold opacity-100 ring-1 ring-green-500";
                                    } else if (isSelected && !isTheRightAnswer) {
                                        style = "border-red-500 bg-red-50 text-red-900 font-bold opacity-100";
                                    }

                                    return (
                                        <div key={opt} className={`p-3 rounded-lg border-2 text-sm flex items-center gap-3 ${style}`}>
                                            <div className="uppercase text-xs font-bold">{opt}</div>
                                            {/* @ts-ignore */}
                                            <div><Latex>{q[`option_${opt}`]}</Latex></div>
                                            
                                            {isTheRightAnswer && <CheckCircle className="ml-auto text-green-600" size={16} />}
                                            {isSelected && !isTheRightAnswer && <XCircle className="ml-auto text-red-500" size={16} />}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Explanation Box */}
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> Explanation
                                </div>
                                <div className="text-sm text-slate-700 leading-relaxed">
                                    {q.explanation ? <Latex>{q.explanation}</Latex> : "No explanation provided."}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
       </div>
    </div>
  );
}