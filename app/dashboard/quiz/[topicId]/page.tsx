"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Question = {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
};

export default function ReviewPage() {
  const { topicId } = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Debugging Tag
  useEffect(() => {
    console.log("Loaded Review Page: VERSION FINAL_V3 (Styled)");
  }, []);

  // 1. Load Questions
  useEffect(() => {
    const mockQuestions = [
      {
        id: 1,
        question_text: "What is the unit of Force?",
        options: ["Joules", "Newtons", "Watts", "Amps"],
        correct_answer: "Newtons",
        explanation: "Force is measured in Newtons (N).",
      },
      {
        id: 2,
        question_text: "Which formula represents Newton's Second Law?",
        options: ["$F = ma$", "$E = mc^2$", "$V = IR$", "$P = IV$"],
        correct_answer: "$F = ma$",
        explanation: "Newton's Second Law states that Force equals mass times acceleration.",
      },
    ];
    setQuestions(mockQuestions);
    setLoading(false);
  }, [topicId]);

  // 2. Handle Answer Selection
  const handleOptionClick = (option: string) => {
    if (showFeedback) return; 
    setSelectedOption(option);
  };

  // 3. Submit Answer
  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    const currentQ = questions[currentQIndex];
    if (selectedOption === currentQ.correct_answer) {
      setScore((prev) => prev + 1);
    }
    setShowFeedback(true);
  };

  // 4. Next Question
  const handleNextQuestion = async () => {
    const nextIndex = currentQIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQIndex(nextIndex);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setQuizFinished(true);
      await saveQuizResultStrict();
    }
  };

  // 5. Save to Supabase
  const saveQuizResultStrict = async () => {
    if (!user) return;
    try {
      console.log("Saving result...");
      const payload = {
        student_email: String(user.primaryEmailAddress?.emailAddress),
        topic_id: String(topicId),
        score: Number(score), 
        total_questions: Number(questions.length),
      };

      const { data, error } = await supabase
        .from("quiz_results")
        .insert([payload])
        .select();

      if (error) console.error("Supabase Error:", error.message);
      else console.log("Success:", data);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading quiz...</div>;

  // ---------------------------------------------------------
  // Render: Quiz Finished
  // ---------------------------------------------------------
  if (quizFinished) {
    const finalPercentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-lg border max-w-lg w-full text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
          <p className="text-gray-500 mb-6">Great effort on this topic.</p>
          
          <div className="text-6xl font-black text-blue-600 mb-6">
            {finalPercentage}%
          </div>
          
          <p className="text-gray-700 text-lg mb-8 bg-gray-100 py-3 rounded-lg">
            You scored <strong>{score}</strong> out of <strong>{questions.length}</strong>
          </p>
          
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gray-900 text-white font-bold px-6 py-4 rounded-xl hover:bg-gray-800 transition transform hover:scale-[1.02]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Render: Question Screen
  // ---------------------------------------------------------
  const currentQ = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Question {currentQIndex + 1} / {questions.length}
          </span>
          <div className="transform scale-90 origin-right">
             <UserButton />
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-snug">
          <Latex>{currentQ.question_text}</Latex>
        </h2>

        {/* Options Grid */}
        <div className="space-y-3 mb-8">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correct_answer;
            
            // --- STYLING LOGIC FIXED HERE ---
            let buttonStyle = "bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:bg-blue-50";
            
            if (showFeedback) {
              if (isCorrect) {
                // Green for correct
                buttonStyle = "bg-green-100 border-green-500 text-green-900 font-bold";
              } else if (isSelected && !isCorrect) {
                // Red for wrong
                buttonStyle = "bg-red-100 border-red-500 text-red-900 font-bold";
              } else {
                // Faded for others
                buttonStyle = "bg-white border-gray-100 text-gray-400 opacity-60";
              }
            } else if (isSelected) {
              // Blue for selected
              buttonStyle = "bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600 font-semibold";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${buttonStyle}`}
              >
                <span className="text-lg"><Latex>{option}</Latex></span>
              </button>
            );
          })}
        </div>

        {/* Feedback Box */}
        {showFeedback && (
          <div className={`p-5 rounded-xl mb-6 flex items-start gap-3 ${
            selectedOption === currentQ.correct_answer 
              ? "bg-green-50 border border-green-200 text-green-900" 
              : "bg-red-50 border border-red-200 text-red-900"
          }`}>
            <div className="text-xl">
              {selectedOption === currentQ.correct_answer ? "✅" : "❌"}
            </div>
            <div>
              <p className="font-bold mb-1">
                {selectedOption === currentQ.correct_answer ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-sm opacity-90 leading-relaxed">
                <Latex>{currentQ.explanation}</Latex>
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={showFeedback ? handleNextQuestion : handleSubmitAnswer}
          disabled={!selectedOption}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-[0.99] ${
            !selectedOption
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
          }`}
        >
          {showFeedback
            ? currentQIndex === questions.length - 1
              ? "Finish Quiz"
              : "Next Question"
            : "Submit Answer"}
        </button>
      </div>
    </div>
  );
}