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

  // Debugging Tag to confirm new code is loaded
  useEffect(() => {
    console.log("Loaded Review Page: VERSION FINAL_V3");
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
    const isCorrect = selectedOption === currentQ.correct_answer;

    if (isCorrect) {
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
      // We don't save immediately here to avoid race conditions. 
      // We trigger the save effect below or call it directly with current state.
      await saveQuizResultStrict();
    }
  };

  // 5. Save to Supabase (FIXED: No Double Counting)
  const saveQuizResultStrict = async () => {
    if (!user) return;

    try {
      console.log("Saving to table 'quiz_results'...");

      // FIX: We trust the 'score' state because the user ALREADY clicked Submit 
      // for the last question to get here.
      const payload = {
        student_email: String(user.primaryEmailAddress?.emailAddress),
        topic_id: String(topicId),
        score: Number(score), // Uses the actual score state, no manual +1
        total_questions: Number(questions.length),
      };

      console.log("Final Payload:", payload);

      const { data, error } = await supabase
        .from("quiz_results") // <--- This MUST be 'quiz_results'
        .insert([payload] as any)
        .select();

      if (error) {
        console.error("Supabase Error:", error.message);
        alert("Error: " + error.message);
      } else {
        console.log("Success:", data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  if (loading) return <div className="p-10">Loading quiz...</div>;

  if (quizFinished) {
    const finalPercentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
        <div className="text-6xl font-black text-blue-600 mb-4">
          {finalPercentage}%
        </div>
        <p className="text-gray-600 text-lg mb-8">
          You got {score} out of {questions.length} correct.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-8">
        <div className="flex justify-between items-center mb-8">
          <span className="text-sm font-semibold text-gray-400">
            Question {currentQIndex + 1} of {questions.length}
          </span>
          <UserButton />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          <Latex>{currentQ.question_text}</Latex>
        </h2>

        <div className="space-y-3 mb-8">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correct_answer;
            
            let buttonStyle = "border-gray-200 hover:border-blue-500 hover:bg-blue-50";
            if (showFeedback) {
              if (isCorrect) buttonStyle = "bg-green-100 border-green-500 text-green-800";
              else if (isSelected && !isCorrect) buttonStyle = "bg-red-100 border-red-500 text-red-800";
              else buttonStyle = "border-gray-200 opacity-50";
            } else if (isSelected) {
              buttonStyle = "border-blue-600 bg-blue-50 ring-1 ring-blue-600";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${buttonStyle}`}
              >
                <Latex>{option}</Latex>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`p-4 rounded-lg mb-6 ${
            selectedOption === currentQ.correct_answer ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            <p className="font-bold mb-1">
              {selectedOption === currentQ.correct_answer ? "Correct!" : "Incorrect"}
            </p>
            <p className="text-sm">
              <Latex>{currentQ.explanation}</Latex>
            </p>
          </div>
        )}

        <button
          onClick={showFeedback ? handleNextQuestion : handleSubmitAnswer}
          disabled={!selectedOption}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
            !selectedOption
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
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