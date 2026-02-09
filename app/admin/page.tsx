"use client";

import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  ArrowRight, 
  Flag, 
  BarChart3, 
  Plus, 
  FileQuestion 
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
                <p className="text-slate-500">Welcome back, Evan.</p>
            </div>
            <Link href="/dashboard" className="text-sm font-bold text-blue-600 hover:underline">
                View Student Portal &rarr;
            </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                    <Users size={24} />
                </div>
                <div>
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-xs text-slate-500 font-bold uppercase">Active Students</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                    <BookOpen size={24} />
                </div>
                <div>
                    <div className="text-2xl font-bold">85%</div>
                    <div className="text-xs text-slate-500 font-bold uppercase">Avg. Completion</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                    <GraduationCap size={24} />
                </div>
                <div>
                    <div className="text-2xl font-bold">4</div>
                    <div className="text-xs text-slate-500 font-bold uppercase">Predicted 9s</div>
                </div>
            </div>
        </div>

        {/* MAIN ACTIONS GRID */}
        <h2 className="text-lg font-bold text-slate-700 mb-4">Management Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* 1. CURRICULUM MANAGER */}
            <Link href="/admin/curriculum" className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BookOpen size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Curriculum</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Manage modules, topics, and structure.
                    </p>
                </div>
                <div className="font-bold text-blue-600 text-sm flex items-center gap-2 group-hover:gap-4 transition-all">
                    Manage Content <ArrowRight size={16} />
                </div>
            </Link>

            {/* 2. ASSIGNMENT MANAGER */}
            <Link href="/admin/assignments" className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between">
                <div>
                    <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Flag size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Assignments</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Set homework and track due dates.
                    </p>
                </div>
                <div className="font-bold text-indigo-600 text-sm flex items-center gap-2 group-hover:gap-4 transition-all">
                    Assign Work <ArrowRight size={16} />
                </div>
            </Link>

            {/* 3. QUESTION FACTORY (NEW) */}
            <Link href="/admin/questions" className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between">
                <div>
                    <div className="bg-amber-50 w-12 h-12 rounded-lg flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Plus size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Question Factory</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Rapidly add new questions to the database.
                    </p>
                </div>
                <div className="font-bold text-amber-600 text-sm flex items-center gap-2 group-hover:gap-4 transition-all">
                    Open Tool <ArrowRight size={16} />
                </div>
            </Link>

            {/* 4. GRADEBOOK */}
            <Link href="/admin/analytics" className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                    <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <BarChart3 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Gradebook</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        View student performance and scores.
                    </p>
                </div>
                <div className="font-bold text-emerald-600 text-sm flex items-center gap-2 group-hover:gap-4 transition-all">
                    View Grades <ArrowRight size={16} />
                </div>
            </Link>

        </div>

      </div>
    </div>
  );
}