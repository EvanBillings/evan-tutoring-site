"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, ChevronRight } from "lucide-react";

// --- MATH & STYLE IMPORTS ---
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
  correct_answer: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
};

export default function QuizPage() {
  const { topicId } = useParams();
  const { user } = useUser();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [finalPercentage, setFinalPercentage] = useState(0);
  
  // NEW: Track User History
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // 1. Fetch Questions
  useEffect(() => {
    async function fetchQuiz() {
      const { data } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('topic_id', topicId);
      
      if (data && data.length > 0) {
        setQuestions(data.sort(() => Math.random() - 0.5));
      }
      setLoading(false);
    }
    fetchQuiz();
  }, [topicId]);

  // 2. Handle Answer Click
  const handleAnswer = (option: string) => {
    if (isAnswered) return; // Prevent double clicking
    
    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    
    // Safety check inside handler
    if (currentQ) {
        // Update Score
        if (option === currentQ.correct_answer) {
            setScore(prev => prev + 1);
        }
        // Save Answer to History
        setUserAnswers(prev => ({...prev, [currentQ.id]: option}));
    }
  };

  // 3. Next Question
  const handleNext = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // End of Quiz
      finishQuiz();
    }
  };

  // 4. Finish & Save (FIXED ACCURACY + HISTORY)
  const finishQuiz = async () => {
    if (!user?.primaryEmailAddress) return;

    const currentQ = questions[currentIndex];
    
    // Safety check: if currentQ is missing, just use current score
    const isLastCorrect = currentQ && selectedOption === currentQ.correct_answer;
    
    // Calculate Final Score
    const finalRawScore = score + (isLastCorrect ? 1 : 0);
    const percentage = questions.length > 0 ? Math.round((finalRawScore / questions.length) * 100) : 0;

    setFinalPercentage(percentage);
    setShowResults(true);
    
    const newStatus = percentage >= 70 ? 'complete' : 'review';

    // SAVE TO DB (Including History)
    await supabase.from('progress').upsert({
      student_email: user.primaryEmailAddress.emailAddress,
      topic_id: topicId as string,
      status: newStatus,
      score: percentage, 
      history: userAnswers, // <--- SAVING HISTORY
      is_assigned: percentage >= 70 ? false : undefined 
    }, { onConflict: 'student_email, topic_id' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Quiz...</div>;

  if (questions.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <h2 className="text-xl font-bold text-slate-700">No questions found for this topic yet!</h2>
      <Link href="/dashboard" className="text-blue-600 hover:underline">Return to Dashboard</Link>
    </div>
  );

  // --- RESULTS SCREEN ---
  if (showResults) {
    const passed = finalPercentage >= 70;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
            {passed ? <CheckCircle size={40} /> : <RefreshCw size={40} />}
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-2">{passed ? "Great Job!" : "Keep Practicing"}</h1>
          <p className="text-slate-500 mb-6">You scored {finalPercentage}% on this topic.</p>
          
          <div className="text-4xl font-black text-slate-800 mb-8">
            {finalPercentage}% <span className="text-base text-slate-400 font-medium font-sans">Score</span>
          </div>

          <div className="space-y-3">
             {/* NEW: Review Button */}
             <Link href={`/dashboard/review/${topicId}`}>
                <button className="w-full py-3 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition mb-3">
                    Review Answers
                </button>
            </Link>

            <button onClick={() => window.location.reload()} className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition">
              Try Again
            </button>
            <Link href="/dashboard" className="block w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- QUIZ INTERFACE ---
  const currentQ = questions[currentIndex];

  if (!currentQ) return <div className="min-h-screen flex items-center justify-center">Loading Question...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans text-slate-900">
      
      {/* Top Bar */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition">
          <ArrowLeft />
        </Link>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Topic {topicId} • Q{currentIndex + 1}/{questions.length}
        </div>
        <div className="w-6"></div> 
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
        <div 
            className="h-full bg-blue-600 transition-all duration-500" 
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">
        
        {/* IMAGE */}
        {currentQ.image_url && (
            <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex justify-center">
                <img 
                    src={currentQ.image_url} 
                    alt="Question Diagram" 
                    className="w-full h-auto max-h-64 object-contain"
                />
            </div>
        )}

        {/* QUESTION TEXT */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-8 leading-relaxed">
          <Latex>{currentQ.question}</Latex>
        </h2>

        <div className="space-y-3">
          {['a', 'b', 'c', 'd'].map((optKey) => {
            const isSelected = selectedOption === optKey;
            const isCorrect = currentQ.correct_answer === optKey;
            
            let styleClass = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300"; 
            
            if (isAnswered) {
                if (isCorrect) styleClass = "bg-green-50 border-green-500 text-green-800 font-bold";
                else if (isSelected && !isCorrect) styleClass = "bg-red-50 border-red-500 text-red-800";
                else styleClass = "bg-white border-slate-100 text-slate-300 opacity-50"; 
            } else if (isSelected) {
                styleClass = "bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500";
            }

            return (
              <button
                key={optKey}
                onClick={() => handleAnswer(optKey)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 text-base transition-all duration-200 flex justify-between items-center ${styleClass}`}
              >
                <span className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold uppercase shrink-0 ${
                        isAnswered && isCorrect ? 'bg-green-200 text-green-700' : 
                        isSelected ? 'bg-blue-200 text-blue-700' :
                        'bg-slate-100 text-slate-500'
                    }`}>
                        {optKey}
                    </span>
                    {/* Render Option with Latex too */}
                    {/* @ts-ignore */}
                    <span><Latex>{currentQ[`option_${optKey}`]}</Latex></span>
                </span>
                
                {isAnswered && isCorrect && <CheckCircle size={20} className="text-green-600 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle size={20} className="text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>
        
        {/* Next Button */}
        {isAnswered && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end animate-in fade-in slide-in-from-bottom-2">
                <button 
                    onClick={handleNext}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-200"
                >
                    {currentIndex + 1 === questions.length ? "Finish Quiz" : "Next Question"} <ChevronRight size={18} />
                </button>
            </div>
        )}

      </div>
    </div>
  );
}