"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  ArrowLeft, BarChart3, Search, Filter, 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock
} from "lucide-react";

type Result = {
  student_email: string;
  topic_id: string;
  score: number;
  status: string;
  updated_at: string;
  // We join topics to get the title
  topics: {
    title: string;
    subject: string;
  }
};

export default function Gradebook() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'high'>('all');
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Fetch progress and join with topics to get the title
    const { data, error } = await supabase
      .from('progress')
      .select(`
        student_email,
        topic_id,
        score,
        status,
        updated_at,
        topics (
            title,
            subject
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(50); // Get last 50 results

    if (data) {
        // @ts-ignore
        setResults(data);
    }
    setLoading(false);
  }

  // Filter Logic
  const filteredResults = results.filter(r => {
    const matchesSearch = r.student_email.toLowerCase().includes(search.toLowerCase()) || 
                          r.topic_id.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'low') return matchesSearch && r.score < 50;
    if (filter === 'high') return matchesSearch && r.score >= 80;
    return matchesSearch;
  });

  // Calculate Average of visible results
  const currentAvg = filteredResults.length > 0 
    ? Math.round(filteredResults.reduce((acc, curr) => acc + curr.score, 0) / filteredResults.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="text-emerald-600" /> Student Gradebook
                    </h1>
                    <p className="text-slate-500 text-sm">Live feed of student quiz submissions.</p>
                </div>
            </div>
            
            {/* Quick Stat */}
            <div className="hidden md:block text-right">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Avg</div>
                <div className={`text-3xl font-black ${currentAvg >= 70 ? 'text-emerald-600' : currentAvg >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {currentAvg}%
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        
        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by email or topic ID..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilter('low')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filter === 'low' ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:text-red-600'}`}
                >
                    <AlertCircle size={14} /> Struggling
                </button>
                <button 
                    onClick={() => setFilter('high')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filter === 'high' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                    <TrendingUp size={14} /> High Achievers
                </button>
            </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Topic</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading && (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading data...</td></tr>
                    )}
                    
                    {!loading && filteredResults.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No results found matching your filters.</td></tr>
                    )}

                    {filteredResults.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-700 text-sm">{row.student_email}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                                        {row.topic_id}
                                    </span>
                                    <span className="text-sm font-medium text-slate-600 truncate max-w-[200px]">
                                        {row.topics?.title || "Unknown Topic"}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${
                                    row.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                    row.score >= 50 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {row.score}%
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {row.status === 'complete' ? (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                        <CheckCircle size={14} /> Passed
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                                        <Clock size={14} /> Review
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">
                                {new Date(row.updated_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
}