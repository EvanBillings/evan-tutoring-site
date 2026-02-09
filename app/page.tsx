import Link from "next/link";
import Image from "next/image";
import { 
  CheckCircle, Quote, Star, ArrowRight, Trophy, GraduationCap, 
  ChevronDown, Sparkles, Award, Zap, Check, 
  Calculator, Atom, FlaskConical, BookOpen, LayoutDashboard
} from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      
      {/* --- HERO SECTION --- */}
      <section className="px-6 pt-4 pb-12 md:pt-12 md:pb-20 max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16">
        
        {/* LEFT: TEXT CONTENT */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-blue-100">
            <Star size={14} className="fill-blue-800" />
            <span>Cambridge University Undergraduate</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Personalised Tuition for <br/>
            <span className="text-blue-700">GCSE & A-level</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-lg mx-auto md:mx-0 leading-relaxed">
            Specialising in Physics, Chemistry, and Maths. I help students achieve grade jumps they didn't think were possible.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
            
            {/* If Logged OUT: Book + Enquire */}
            <SignedOut>
                <Link 
                  href="/book" 
                  className="bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                >
                  Book a Lesson <ArrowRight size={20} />
                </Link>
                <Link 
                    href="/contact" 
                    className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-50 transition"
                >
                    Make an Inquiry
                </Link>
            </SignedOut>

            {/* If Logged IN: Dashboard + Book */}
            <SignedIn>
                <Link 
                  href="/dashboard" 
                  className="bg-slate-900 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-800 transition shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                >
                   <LayoutDashboard size={20} /> Go to Dashboard
                </Link>
                <Link 
                  href="/book" 
                  className="bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                >
                  Book a Lesson <ArrowRight size={20} />
                </Link>
            </SignedIn>

          </div>
        </div>

        {/* RIGHT: PHOTO */}
        <div className="flex-1 w-full flex justify-center md:justify-end">
          <div className="relative w-full max-w-md">
            
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl shadow-2xl overflow-hidden bg-slate-100">
               {/* Replace with your actual image path */}
               <Image 
                 src="/evan-cambridge.png" 
                 alt="Evan Billings Cambridge Tutor" 
                 width={800} 
                 height={1000}
                 className="w-full h-full object-cover object-bottom" 
                 priority
                 unoptimized={true} 
               />
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS GRID --- */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 text-center">
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-slate-900">20+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Students Supported</div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-slate-900">200+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hours Experience</div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-slate-900">100%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recommend Rate</div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-slate-900">1st</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Predicted Class</div>
          </div>
        </div>
      </section>

      {/* --- METHOD SECTION --- */}
      <section id="method" className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
              The Evan Billings Method
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
              Organised success with a bespoke student portal.
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              I don't just teach content; I structure your revision. Every student gets a custom dashboard with resources embedded directly into it, ensuring you never lose track of what to study next.
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-center gap-3 text-lg text-slate-700">
                <CheckCircle className="text-blue-600 shrink-0" size={20} /> <span>Real-time syllabus tracking</span>
              </li>
              <li className="flex items-center gap-3 text-lg text-slate-700">
                <CheckCircle className="text-blue-600 shrink-0" size={20} /> <span>Curated revision quizzes embedded</span>
              </li>
              <li className="flex items-center gap-3 text-lg text-slate-700">
                <CheckCircle className="text-blue-600 shrink-0" size={20} /> <span>Instant performance feedback</span>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full">
            <div className="w-full relative group">
              
              <div className="absolute -top-4 -right-2 z-10 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-slate-700">
                <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Live Updated</span>
              </div>

              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              
              <Image 
                src="/gcse-chemistry-tracker.png" 
                alt="GCSE Chemistry Revision Tracker" 
                width={1920}
                height={1080}
                className="relative rounded-2xl shadow-xl border border-slate-200 w-full h-auto object-cover"
                unoptimized={true}
              />
            </div>
          </div>

        </div>
      </section>

      {/* --- ACADEMIC EXCELLENCE (The Favorite Part) --- */}
      <section id="about" className="py-16 px-6 bg-slate-50 border-t border-slate-200 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Academic Excellence</h2>
          <p className="text-xl text-slate-700 leading-relaxed mb-8 max-w-3xl mx-auto">
            I am a <span className="font-bold text-slate-900">Natural Sciences Undergraduate at St John's College, University of Cambridge</span>. I taught myself two of my GCSEs and use those same self-discipline techniques to help my students excel.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-cyan-400 w-12 h-12 flex items-center justify-center rounded-bl-2xl">
                    <Sparkles size={20} className="text-white" />
                </div>
                <div className="text-4xl font-black text-blue-700 mb-1">13</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Grade 9s (GCSE)</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Included 2 Self-Taught</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-400 w-12 h-12 flex items-center justify-center rounded-bl-2xl">
                    <Trophy size={20} className="text-white" />
                </div>
                <div className="text-4xl font-black text-blue-700 mb-1">4 A*s</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">A-Level</div>
                <div className="text-xs text-slate-400 mt-1 font-medium px-4">Maths, Further Maths, Physics, Chemistry</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-500 w-12 h-12 flex items-center justify-center rounded-bl-2xl">
                    <Award size={20} className="text-white" />
                </div>
                <GraduationCap size={40} className="text-blue-700 mb-2 mt-2" />
                <div className="text-xl font-black text-slate-900 mb-1">Predicted 1st</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cambridge University</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">On track for highest honours</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- REVIEWS SECTION --- */}
      <section id="reviews" className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Student Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col hover:border-blue-200 transition relative">
              <Quote className="absolute top-6 right-6 text-slate-200 fill-slate-200" size={40} />
              
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-700 mb-6 italic leading-relaxed flex-grow font-medium">
                "Evan really helped me feel more motivated. My GCSE Chemistry grade improved from a 1 to a 7 in just 3 months."
              </p>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  Poppy <Check size={16} className="text-green-500" strokeWidth={3} />
                </div>
                <div className="text-sm text-slate-500">Year 11 Student</div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col hover:border-blue-200 transition relative">
              <Quote className="absolute top-6 right-6 text-slate-200 fill-slate-200" size={40} />
              
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-700 mb-6 italic leading-relaxed flex-grow font-medium">
                "Truly exceptional tutor, definitely worked for me! With tuition from Evan, I achieved a grade 9 in my Spanish, Chemistry and Maths."
              </p>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  Jack Hunter <Check size={16} className="text-green-500" strokeWidth={3} />
                </div>
                <div className="text-sm text-slate-500">Year 11 Student</div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col hover:border-blue-200 transition relative">
              <Quote className="absolute top-6 right-6 text-slate-200 fill-slate-200" size={40} />
              
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-700 mb-6 italic leading-relaxed flex-grow font-medium">
                "I was very happy with overall tuition and the way Evan took an approach to my learning. Highly recommend!"
              </p>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  Holly <Check size={16} className="text-green-500" strokeWidth={3} />
                </div>
                <div className="text-sm text-slate-500">Year 11 Student</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CURRICULUM ROADMAP --- */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
            
            <h2 className="text-3xl font-bold mb-0 relative z-10 inline-block bg-slate-50 px-4">Curriculum Roadmap</h2>
            
            <div className="flex flex-col items-center">
                
                {/* Root connector line */}
                <div className="w-0.5 h-12 bg-slate-300"></div>

                {/* Level 2: Splitter Bar */}
                <div className="w-full max-w-2xl h-0.5 bg-slate-300 mb-6 relative">
                    <div className="absolute top-0 left-[25%] -translate-x-1/2 w-0.5 h-6 bg-slate-300"></div>
                    <div className="absolute top-0 right-[25%] translate-x-1/2 w-0.5 h-6 bg-slate-300"></div>
                </div>

                {/* Level 3: Two Visually Consistent Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 w-full max-w-4xl">
                    
                    {/* GCSE Side */}
                    <div className="flex flex-col items-center relative">
                        <div className="bg-white border-2 border-blue-600 text-blue-800 px-8 py-3 rounded-xl font-bold text-lg shadow-sm z-10 flex items-center gap-2">
                            <BookOpen size={20} /> GCSE
                        </div>
                        <div className="w-0.5 h-8 bg-slate-300"></div>
                        
                        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm w-full text-left relative h-full flex flex-col">
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase border border-slate-200">
                                Subjects
                             </div>
                            <ul className="space-y-4 flex-grow mt-2">
                                <li className="flex items-start gap-3">
                                    <Atom className="text-blue-500 shrink-0 mt-1" size={18} />
                                    <span><span className="font-bold text-slate-900">All Sciences</span><br/><span className="text-sm text-slate-500">Physics, Chemistry, Biology</span></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Calculator className="text-blue-500 shrink-0 mt-1" size={18} />
                                    <span><span className="font-bold text-slate-900">Maths</span><br/><span className="text-sm text-slate-500">Foundation & Higher</span></span>
                                </li>
                            </ul>
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-600 text-sm font-medium bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-xl">
                                <CheckCircle size={16} className="text-green-500" /> All Exam Boards
                            </div>
                        </div>
                    </div>

                    {/* A-Level Side */}
                    <div className="flex flex-col items-center relative">
                        <div className="bg-white border-2 border-indigo-600 text-indigo-800 px-8 py-3 rounded-xl font-bold text-lg shadow-sm z-10 flex items-center gap-2">
                            <Trophy size={20} /> A-Level
                        </div>
                        <div className="w-0.5 h-8 bg-slate-300"></div>

                        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm w-full text-left relative h-full flex flex-col">
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase border border-slate-200">
                                Subjects
                             </div>
                            <ul className="space-y-4 flex-grow mt-2">
                                <li className="flex items-start gap-3">
                                    <FlaskConical className="text-indigo-500 shrink-0 mt-1" size={18} />
                                    <div className="w-full">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-slate-900">Physics & Chemistry</span>
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">OCR A Only</span>
                                        </div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Calculator className="text-indigo-500 shrink-0 mt-1" size={18} />
                                    <div className="w-full">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-slate-900">Maths & Further</span>
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Edexcel Only</span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-600 text-sm font-medium bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-xl">
                                <CheckCircle size={16} className="text-green-500" /> Specialist Boards
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            
            <details className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden cursor-pointer open:ring-2 open:ring-blue-100 open:border-blue-400 transition-all">
              <summary className="flex items-center justify-between p-6 font-bold text-lg text-slate-900 select-none">
                What exam boards do you cover?
                <ChevronDown className="group-open:rotate-180 transition-transform duration-300 text-slate-400" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                <p className="mb-4">Please see the "Curriculum Roadmap" section above for a detailed breakdown. In summary:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><span className="font-bold text-slate-900">GCSE:</span> All major exam boards covered for Maths and Sciences.</li>
                  <li><span className="font-bold text-slate-900">A-Level:</span> I have specific expertise in Edexcel for Maths and OCR A for Sciences to ensure maximum grade potential.</li>
                </ul>
              </div>
            </details>

            <details className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden cursor-pointer open:ring-2 open:ring-blue-100 open:border-blue-400 transition-all">
              <summary className="flex items-center justify-between p-6 font-bold text-lg text-slate-900 select-none">
                Is tuition online or in-person?
                <ChevronDown className="group-open:rotate-180 transition-transform duration-300 text-slate-400" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                I teach exclusively online using Google Meet and an interactive whiteboard.
              </div>
            </details>

            <details className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden cursor-pointer open:ring-2 open:ring-blue-100 open:border-blue-400 transition-all">
              <summary className="flex items-center justify-between p-6 font-bold text-lg text-slate-900 select-none">
                Will my student be set homework?
                <ChevronDown className="group-open:rotate-180 transition-transform duration-300 text-slate-400" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                Yes. Practice questions are essential for mastering a topic. I aim to set approximately 1 hour of independent work for every 1 hour of contact time, which we then review together to identify areas for improvement.
              </div>
            </details>

            <details className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden cursor-pointer open:ring-2 open:ring-blue-100 open:border-blue-400 transition-all">
              <summary className="flex items-center justify-between p-6 font-bold text-lg text-slate-900 select-none">
                What is your cancellation policy?
                <ChevronDown className="group-open:rotate-180 transition-transform duration-300 text-slate-400" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                I ask for 24 hours' notice for cancellations. This gives me enough time to offer the slot to another student. Cancellations made with less than 24 hours' notice may be charged.
              </div>
            </details>

            <details className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden cursor-pointer open:ring-2 open:ring-blue-100 open:border-blue-400 transition-all">
              <summary className="flex items-center justify-between p-6 font-bold text-lg text-slate-900 select-none">
                How do I access the resources tracker?
                <ChevronDown className="group-open:rotate-180 transition-transform duration-300 text-slate-400" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                Once you book your first lesson, I will create your student account. You can simply log in to this website to access your bespoke dashboard, quizzes, and progress tracker.
              </div>
            </details>

          </div>
        </div>
      </section>

      {/* --- FINAL CALL TO ACTION (CTA) --- */}
      <section className="py-20 px-6 bg-blue-700 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Ready to achieve your Grade 9?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Spaces are limited. Book your first lesson today and let's build your personalised revision plan together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link 
                  href="/book" 
                  className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition shadow-xl shadow-blue-900/20"
                >
                  Book Your First Lesson
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition"
                >
                  Contact Me
                </Link>
            </div>
            <div className="pt-4 text-sm font-medium text-blue-200 opacity-80">
                100% Satisfaction Guarantee • No Long-term Contract
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-12 border-t border-slate-100 text-center">
        <p className="text-slate-500 text-sm mb-6">
          &copy; {new Date().getFullYear()} by Evan Billings. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600">
          <Link href="#" className="hover:text-blue-700 transition">Privacy Policy</Link>
          <Link href="#" className="hover:text-blue-700 transition">Terms & Conditions</Link>
          <Link href="mailto:evancbillings@gmail.com" className="hover:text-blue-700 transition">Contact Support</Link>
        </div>
      </footer>
    </main>
  );
}