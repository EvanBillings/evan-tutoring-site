"use client";

import Link from "next/link";
import { LayoutDashboard, ShieldCheck, Calendar } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  
  // REPLACE THIS WITH YOUR EMAIL
  const adminEmail = "evancbillings@gmail.com"; 
  const isAdmin = isLoaded && user?.primaryEmailAddress?.emailAddress === adminEmail;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 font-sans">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        
        {/* 1. LOGO (Bigger Text) */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 100 100" fill="none" stroke="#9F97E4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M38 8 L18 58 L25 82 L62 88 L81 70 L83 59 L77 47 L66 30 Z" />
                <path d="M38 8 L35 45 L18 58" />
                <path d="M38 8 L56 44 L66 30" />
                <path d="M35 45 L25 82 L41 66 Z" />
                <path d="M41 66 L62 88 L67 64 L41 66" />
                <path d="M67 64 L81 70" />
                <path d="M67 64 L83 59" />
                <path d="M67 64 L77 47" />
                <path d="M77 47 L56 44" />
                <path d="M56 44 L35 45 L67 64 L56 44" />
                <path d="M35 45 L67 64" />
            </svg>
          </div>
          <div className="font-bold text-2xl tracking-tight text-slate-900 leading-none">
            Evan Billings Tutoring
          </div>
        </Link>

        {/* 2. CENTER LINKS (Bigger Text) */}
        <div className="hidden md:flex items-center space-x-8 text-base font-medium text-slate-600">
          <Link href="/#about" className="hover:text-blue-700 transition-colors">About</Link>
          <Link href="/#method" className="hover:text-blue-700 transition-colors">Method</Link>
          <Link href="/#reviews" className="hover:text-blue-700 transition-colors">Reviews</Link>
        </div>

        {/* 3. RIGHT ACTIONS (Bigger Buttons) */}
        <div className="flex items-center gap-5">
           
           <SignedOut>
              <SignInButton mode="modal">
                  <button className="text-base font-bold text-slate-600 hover:text-slate-900 transition px-3 py-2">
                      Log In
                  </button>
              </SignInButton>
              <Link 
                  href="/book"
                  className="bg-slate-900 text-white px-6 py-3 rounded-full text-base font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2"
                >
                  Book Now <Calendar size={18} />
               </Link>
           </SignedOut>

           <SignedIn>
              <div className="flex items-center gap-5">
                
                {/* Dashboard Link */}
                <Link 
                    href="/dashboard"
                    className="hidden md:flex items-center gap-2 text-base font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                    <LayoutDashboard size={18} /> Dashboard
                </Link>

                {/* Primary Action Button */}
                {isAdmin ? (
                    <Link 
                        href="/admin"
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-base font-bold hover:bg-slate-800 transition shadow-md flex items-center gap-2"
                    >
                        <ShieldCheck size={18} /> Portal
                    </Link>
                ) : (
                    <Link 
                        href="/book"
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-base font-bold hover:bg-blue-700 transition shadow-md flex items-center gap-2"
                    >
                        Book <Calendar size={18} />
                    </Link>
                )}

                {/* Profile Pic */}
                <div className="pl-1">
                    <UserButton afterSignOutUrl="/" appearance={{
                        elements: {
                            avatarBox: "w-10 h-10 border-2 border-white shadow-sm"
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