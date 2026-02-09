"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; 
import { 
  BookOpen, Video, FileQuestion, CheckCircle, 
  ChevronRight, ChevronDown, LogOut, LayoutDashboard, Settings, Search, Check, Atom, Sparkles, Flag, BarChart3, TrendingUp, History
} from "lucide-react";

// --- TYPES ---
type Topic = {
  id: string;
  module_id: number;
  title: string;
  has_video: boolean;
  has_questions: boolean;
  learning_objectives: string[] | null;
  status?: 'todo' | 'review' | 'complete' | 'locked';
  confidence?: number;
  is_assigned?: boolean; 
  score?: number; 
};

type Module = {
  id: number;
  title: string;
  order_index: number;
  subject: string;
  topics: Topic[];
};

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("chemistry");
  const [view, setView] = useState<'tracker' | 'grades'>('tracker'); // NEW: View State
  
  const [modules, setModules] = useState<Module[]>([]);
  const [homework, setHomework] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    if (!isLoaded || !user) return; 

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) return;

    async function fetchData() {
      try {
        setLoading(true);

        const { data: modulesData } = await supabase.from('modules').select('*').order('order_index');
        const { data: topicsData } = await supabase.from('topics').select('*');
        const { data: progressData } = await supabase.from('progress').select('*').eq('student_email', userEmail);

        if (!modulesData || !topicsData) return;

        // A. Merge for Main List
        const mergedData = modulesData.map((mod) => {
          const modTopics = topicsData
            .filter((t) => t.module_id === mod.id)
            .map((topic) => {
              const prog = progressData?.find((p) => p.topic_id === topic.id);
              return {
                ...topic,
                status: prog ? prog.status : 'todo',
                confidence: prog ? prog.confidence : 0,
                is_assigned: prog ? prog.is_assigned : false,
                score: prog ? prog.score : 0, 
              };
            });
            
            // Numeric sort for IDs (e.g. 1.2 before 1.10)
            modTopics.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
          return { ...mod, topics: modTopics };
        });

        setModules(mergedData);

        // B. Calculate Homework (Assigned AND Not Complete)
        const allTopics = mergedData.flatMap(m => m.topics);
        const activeHomework = allTopics.filter(t => t.is_assigned === true && t.status !== 'complete');
        setHomework(activeHomework);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoaded, user]);


  // --- 2. ACTIONS ---

  const toggleTopicStatus = async (topicId: string, currentStatus: string) => {
    if (!user?.primaryEmailAddress) return;
    const userEmail = user.primaryEmailAddress.emailAddress;
    const newStatus = currentStatus === 'complete' ? 'todo' : 'complete';

    // Optimistic Update
    setModules((prev) => 
      prev.map((mod) => ({
        ...mod,
        topics: mod.topics.map((t) => 
          t.id === topicId ? { ...t, status: newStatus } : t
        )
      }))
    );
    
    if (newStatus === 'complete') {
        setHomework(prev => prev.filter(t => t.id !== topicId));
    }

    await supabase.from('progress').upsert({ 
       student_email: userEmail, topic_id: topicId, status: newStatus 
    }, { onConflict: 'student_email, topic_id' });
  };

  const updateConfidence = async (topicId: string, level: number) => {
    if (!user?.primaryEmailAddress) return;
    const userEmail = user.primaryEmailAddress.emailAddress;

    setModules((prev) => 
      prev.map((mod) => ({
        ...mod,
        topics: mod.topics.map((t) => 
          t.id === topicId ? { ...t, confidence: level } : t
        )
      }))
    );

    const currentModule = modules.find(m => m.topics.some(t => t.id === topicId));
    const currentTopic = currentModule?.topics.find(t => t.id === topicId);
    const safeStatus = currentTopic?.status || 'todo';

    await supabase.from('progress').upsert({ 
       student_email: userEmail, 
       topic_id: topicId, 
       confidence: level,
       status: safeStatus 
    }, { onConflict: 'student_email, topic_id' });
  };


  // --- 3. HELPER VARS ---
  const visibleModules = modules.filter(m => m.subject === activeTab);
  const currentTotal = visibleModules.reduce((acc, m) => acc + m.topics.length, 0);
  const currentCompleted = visibleModules.reduce((acc, m) => acc + m.topics.filter(t => t.status === 'complete').length, 0);
  const totalPercent = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;

  // --- 4. CALCULATE STATS ---
  const allCompletedQuizzes = modules.flatMap(m => m.topics).filter(t => (t.score || 0) > 0);
  const chemQuizzes = modules.filter(m => m.subject === 'chemistry').flatMap(m => m.topics).filter(t => (t.score || 0) > 0);
  const physQuizzes = modules.filter(m => m.subject === 'physics').flatMap(m => m.topics).filter(t => (t.score || 0) > 0);

  const avgScore = allCompletedQuizzes.length > 0 
    ? Math.round(allCompletedQuizzes.reduce((acc, t) => acc + (t.score || 0), 0) / allCompletedQuizzes.length) 
    : 0;

  const chemAvg = chemQuizzes.length > 0 
    ? Math.round(chemQuizzes.reduce((acc, t) => acc + (t.score || 0), 0) / chemQuizzes.length) 
    : 0;

  const physAvg = physQuizzes.length > 0 
    ? Math.round(physQuizzes.reduce((acc, t) => acc + (t.score || 0), 0) / physQuizzes.length) 
    : 0;


  if (!isLoaded || loading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
           Loading...
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20 shadow-xl overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <div className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white">
                <Sparkles size={16} fill="white" />
            </div>
            <span>Evan Billings</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-8">
          
          {/* Section 1: Curriculum */}
          <div className="space-y-2">
             <div className="px-4 pb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Curriculum</div>
             
             <button onClick={() => { setActiveTab("chemistry"); setView('tracker'); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${view === 'tracker' && activeTab === 'chemistry' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
                <BookOpen size={20} className={view === 'tracker' && activeTab === 'chemistry' ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} /> 
                <span className="font-semibold">Chemistry</span>
             </button>
             
             <button onClick={() => { setActiveTab("physics"); setView('tracker'); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${view === 'tracker' && activeTab === 'physics' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
                <Atom size={20} className={view === 'tracker' && activeTab === 'physics' ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} /> 
                <span className="font-semibold">Physics</span>
             </button>
          </div>

          {/* Section 2: Analytics */}
          <div className="space-y-2">
             <div className="px-4 pb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Analytics</div>
             
             <button onClick={() => setView('grades')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${view === 'grades' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
                <BarChart3 size={20} className={view === 'grades' ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} /> 
                <span className="font-semibold">My Grades</span>
             </button>
          </div>

        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-400 font-medium">
            <LogOut size={20} /> <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* CONTENT - FULL WIDTH */}
      <main className="flex-1 ml-64 p-8">
        
        {/* --- VIEW: TRACKER (DEFAULT) --- */}
        {view === 'tracker' && (
            <>
                {/* HEADER */}
                <header className="flex justify-between items-end mb-8 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 capitalize tracking-tight flex items-center gap-3">
                        {activeTab === 'chemistry' ? <span className="text-blue-600">Chemistry</span> : <span className="text-indigo-600">Physics</span>} 
                        Tracker
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${activeTab === 'chemistry' ? 'bg-blue-500' : 'bg-indigo-500'}`} 
                                style={{ width: `${totalPercent}%` }}
                            ></div>
                        </div>
                        <span className="font-bold text-slate-600 text-sm">{totalPercent}% Complete</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-sm font-bold text-slate-900">{user?.fullName || 'Student'}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-md overflow-hidden">
                        <UserButton afterSignOutUrl="/"/>
                    </div>
                </div>
                </header>

                {/* --- HOMEWORK BANNER --- */}
                {homework.length > 0 && (
                <div className="mb-10 animate-in slide-in-from-top-4 fade-in duration-500">
                    <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl shadow-red-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 transform translate-x-4 -translate-y-4">
                            <Flag size={140} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Flag size={20} fill="white" /> Homework Due
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {homework.map(task => (
                                    <div key={task.id} className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-lg flex items-center justify-between hover:bg-white/20 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="font-mono text-xs font-bold bg-white/20 px-2 py-1 rounded text-white/90 whitespace-nowrap">{task.id}</span>
                                            <span className="font-medium text-sm truncate">{task.title}</span>
                                        </div>
                                        <Link href={`/dashboard/quiz/${task.id}`}>
                                            <button className="bg-white text-red-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap">
                                                Start Quiz
                                            </button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* MODULES LIST */}
                <div className="space-y-6">
                {visibleModules.map((module) => {
                    const modCompleted = module.topics.filter(t => t.status === 'complete').length;
                    const modTotal = module.topics.length;
                    const modPercent = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
                    const isComplete = modPercent === 100;

                    return (
                        <div key={module.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <div><h3 className="font-bold text-lg text-slate-800">{module.title}</h3></div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-slate-600'}`}>{modPercent}%</span>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isComplete ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-300 text-slate-300'}`}>
                                    {isComplete ? <Check size={14} strokeWidth={4} /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                                </div>
                            </div>
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                            {module.topics.map((topic) => (
                            <div key={topic.id} className="group hover:bg-slate-50 transition-colors duration-200">
                                <div className="px-6 py-4 flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); toggleTopicStatus(topic.id, topic.status || 'todo'); }}
                                    className={`w-6 h-6 shrink-0 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                        topic.status === 'complete' 
                                        ? 'bg-green-500 border-green-500 shadow-sm scale-100' 
                                        : 'border-slate-300 bg-white hover:border-blue-400 scale-100 hover:scale-110'
                                    }`}
                                >
                                    <Check size={12} strokeWidth={4} className={`text-white transition-opacity ${topic.status === 'complete' ? 'opacity-100' : 'opacity-0'}`} />
                                </button>

                                <div className="flex-grow cursor-pointer" onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{topic.id}</span>
                                        <span className={`text-sm font-medium transition-colors ${topic.status === 'complete' ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                            {topic.title}
                                        </span>
                                        {topic.learning_objectives && (
                                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedTopic === topic.id ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {topic.has_video ? (
                                        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 px-2 py-1 rounded transition-all">
                                            <Video size={12} /> Video
                                        </button>
                                    ) : <span className="w-[60px]"></span>}

                                    {topic.has_questions ? (
                                        <Link href={`/dashboard/quiz/${topic.id}`}>
                                            <button className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-all shadow-sm">
                                                <FileQuestion size={12} /> Quiz
                                            </button>
                                        </Link>
                                    ) : <span className="w-[55px]"></span>}
                                </div>

                                <div className="flex items-center gap-1.5 ml-2">
                                    {[1,2,3].map((level) => (
                                        <button 
                                            key={level} 
                                            type="button"
                                            onClick={() => updateConfidence(topic.id, level)}
                                            className={`w-6 h-6 rounded-full transition-all duration-200 border-2 ${
                                                (topic.confidence || 0) >= level 
                                                ? ((topic.confidence || 0) === 3 ? 'bg-green-500 border-green-500' : (topic.confidence || 0) === 2 ? 'bg-amber-400 border-amber-400' : 'bg-red-400 border-red-400')
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                            }`}
                                        ></button>
                                    ))}
                                </div>
                                </div>

                                {expandedTopic === topic.id && topic.learning_objectives && (
                                    <div className="px-6 pb-4 pt-0">
                                        <div className="ml-10 bg-slate-50 border border-slate-200 rounded-lg p-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Learning Objectives</h4>
                                            <ul className="space-y-1">
                                                {topic.learning_objectives.map((obj, i) => (
                                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
                                                        <span>{obj}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                            ))}
                        </div>
                        </div>
                    );
                })}
                </div>
            </>
        )}

        {/* --- VIEW: GRADES (NEW) --- */}
        {view === 'grades' && (
            <div className="max-w-4xl animate-in slide-in-from-bottom-4 fade-in duration-500">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <BarChart3 className="text-emerald-600" size={32} /> My Performance
                    </h1>
                    <p className="text-slate-500 mt-2">Track your quiz scores and progress over time.</p>
                </header>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><TrendingUp size={20} /></div>
                             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Avg</div>
                        </div>
                        <div className={`text-4xl font-black ${avgScore >= 70 ? 'text-emerald-600' : avgScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                            {avgScore}%
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><BookOpen size={20} /></div>
                             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chemistry</div>
                        </div>
                        <div className="text-4xl font-black text-slate-900">{chemAvg}%</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Atom size={20} /></div>
                             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Physics</div>
                        </div>
                        <div className="text-4xl font-black text-slate-900">{physAvg}%</div>
                    </div>
                </div>

                {/* RESULTS LIST */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <History size={16} className="text-slate-400" />
                        <h3 className="font-bold text-slate-700">Recent Results</h3>
                    </div>
                    
                    {allCompletedQuizzes.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No quizzes completed yet. Go to the Tracker and start a quiz!
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {allCompletedQuizzes.map((topic) => (
                                <div key={topic.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg ${
                                            (topic.score || 0) >= 70 ? 'bg-emerald-100 text-emerald-700' : 
                                            (topic.score || 0) >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {topic.score}%
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{topic.title}</div>
                                            <div className="text-xs font-mono text-slate-400">{topic.id}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Link href={`/dashboard/review/${topic.id}`}>
                                            <button className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all">
                                                Review
                                            </button>
                                        </Link>
                                        <Link href={`/dashboard/quiz/${topic.id}`}>
                                            <button className="text-xs font-bold text-blue-600 hover:text-white border border-blue-200 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-all">
                                                Retake
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}