"use client";

import Link from "next/link";
import { LayoutDashboard, Calendar, ShieldCheck, Zap } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  
  const adminEmail = "evancbillings@gmail.com"; 
  const isAdmin = isLoaded && user?.primaryEmailAddress?.emailAddress === adminEmail;

  // Unified Blue Styling
  const blueBtnClass = "flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black no-underline hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 font-sans">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        
        {/* BRANDING: EB Tutors */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline group">
          <div className="flex items-center justify-center w-10 h-10 font-black text-white bg-slate-900 rounded-xl shadow-lg group-hover:bg-blue-600 transition-colors italic">
            EB
          </div>
          <div className="font-black text-xl tracking-tight text-slate-900 leading-none">
            EB Tutors
          </div>
        </Link>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
           <SignedOut>
              <SignInButton mode="modal">
                  <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer px-2">
                      Log In
                  </button>
              </SignInButton>
              <Link href="/dashboard/book" className={blueBtnClass}>
                  Book Session <Zap size={16} fill="currentColor" />
               </Link>
           </SignedOut>

           <SignedIn>
              <div className="flex items-center gap-4">
                {/* Cohesive Dashboard Button */}
                <Link href="/dashboard" className={blueBtnClass}>
                    <LayoutDashboard size={16} /> Dashboard
                </Link>

                {isAdmin ? (
                    <Link href="/admin" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black no-underline hover:bg-slate-800 transition-all shadow-md">
                        <ShieldCheck size={16} /> Admin
                    </Link>
                ) : (
                    <Link href="/dashboard/book" className={blueBtnClass}>
                        <Calendar size={16} /> Book
                    </Link>
                )}

                <div className="pl-2 border-l border-slate-100">
                  <UserButton afterSignOutUrl="/" appearance={{
                      elements: {
                          avatarBox: "w-9 h-9 border border-slate-100 shadow-sm"
                      }
                  }}/>
                </div>
              </div>
           </SignedIn>
        </div>
      </div>
    </nav>
  );
}