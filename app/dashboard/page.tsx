"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type QuizResult = {
  id: string;
  topic_id: string;
  score: number;
  total_questions: number;
  created_at: string;
  student_email: string;
};

type StudentProfile = {
  hourly_rate: number;
};

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncAndFetch() {
      if (!isLoaded || !user) return;

      const userEmail = user.primaryEmailAddress?.emailAddress;

      // --- SYNC LOGIC START ---
      // 1. Check if a profile exists for this Clerk ID
      const { data: existingById } = await supabase
        .from("student_profiles")
        .select("hourly_rate")
        .eq("id", user.id)
        .maybeSingle();

      if (existingById) {
        setProfile(existingById);
      } else {
        // 2. If not by ID, check if a profile was manually pre-added by EMAIL
        const { data: existingByEmail } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("email", userEmail)
          .maybeSingle();

        if (existingByEmail) {
          // Claim the manual profile by updating it with the Clerk User ID
          const { data: updatedProfile } = await supabase
            .from("student_profiles")
            .update({ id: user.id, full_name: user.fullName })
            .eq("email", userEmail)
            .select()
            .maybeSingle();
          setProfile(updatedProfile);
        } else {
          // 3. Brand new student - create fresh profile
          const { data: newProfile } = await supabase
            .from("student_profiles")
            .insert([{
              id: user.id,
              email: userEmail,
              full_name: user.fullName,
              hourly_rate: 40 // Default rate
            }])
            .select()
            .maybeSingle();
          setProfile(newProfile);
        }
      }
      // --- SYNC LOGIC END ---

      // Fetch Quiz Results
      const { data: quizData } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("student_email", userEmail)
        .order("created_at", { ascending: false });

      setResults(quizData || []);
      setLoading(false);
    }

    syncAndFetch();
  }, [user, isLoaded]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-bold text-lg shadow-sm">
            EB
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Evan Billings Tutoring</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/book" className="hidden md:block text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
            Book a session
          </Link>
          <UserButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        {/* Welcome Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || "Student"}!
            </h2>
            <p className="text-gray-500 mt-2">
              Cambridge Natural Sciences Tutoring Portal.
            </p>
          </div>
          
          {/* Custom Rate Display & Booking */}
          <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Rate</p>
              <p className="text-2xl font-black text-gray-900">£{profile?.hourly_rate || "--"}<span className="text-sm font-normal text-gray-400">/hr</span></p>
            </div>
            <Link 
              href="/dashboard/book"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-100"
            >
              Book Now
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Course Trackers */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  ⚛️ A-Level Physics
                </h3>
                <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                  Exam Board: AQA
                </span>
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/dashboard/quiz/P1.1"
                  className="group block p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all bg-white"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-tighter">Module P1</span>
                      <span className="font-semibold text-gray-700 group-hover:text-blue-700 text-lg">
                        Forces & Motion
                      </span>
                    </div>
                    <span className="bg-gray-50 text-gray-900 border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Review Topic
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/quiz/P1.2"
                  className="group block p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all bg-white"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-tighter">Module P1</span>
                      <span className="font-semibold text-gray-700 group-hover:text-blue-700 text-lg">
                        Energy
                      </span>
                    </div>
                    <span className="bg-gray-50 text-gray-900 border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Review Topic
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Results History */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📊 My Progress
              </h3>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-gray-100 rounded-xl"></div>
                  <div className="h-16 bg-gray-100 rounded-xl"></div>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 px-4">
                  <p className="text-gray-400 font-medium">No activity logged.</p>
                  <p className="text-xs text-gray-400 mt-2">Complete a quiz to see your score history.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-colors"
                    >
                      <div>
                        <p className="font-bold text-gray-800">
                          {result.topic_id}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          {new Date(result.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`block text-xl font-black ${
                          (result.score / result.total_questions) >= 0.7 ? "text-green-500" : "text-amber-500"
                        }`}>
                          {Math.round((result.score / result.total_questions) * 100)}%
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {result.score}/{result.total_questions} Correct
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}