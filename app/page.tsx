import Link from "next/link";
import Image from "next/image";
import { 
  CheckCircle, Quote, Star, ArrowRight, Trophy, GraduationCap, 
  ChevronDown, Sparkles, Award, Zap, Check, 
  Calculator, Atom, FlaskConical, BookOpen, LayoutDashboard, ShieldCheck, Clock
} from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      
      
      <section className="max-w-4xl mx-auto text-center pt-16 pb-24 px-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-100">
          <ShieldCheck size={14} /> Elite Chemistry & Physics Tutoring
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.85] text-slate-900">
          Master your subjects.<br/>
          <span className="text-blue-600">Elevate your grades.</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Bespoke 1-to-1 tutoring with Evan Billings. Sign up today to join the placement waitlist and receive your custom tuition rate.
        </p>

        <div className="flex justify-center">
          {userId ? (
             <Link href="/dashboard" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-2xl shadow-slate-200">
                Enter Student Portal <ArrowRight size={20} />
             </Link>
          ) : (
            <SignUpButton mode="modal">
                <button className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-2xl shadow-slate-200">
                Apply for Tuition <ArrowRight size={20} />
                </button>
            </SignUpButton>
          )}
        </div>

        {/* ONBOARDING STEPS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-left p-6 rounded-3xl bg-slate-50 border border-slate-100">
            <Zap className="text-amber-500 mb-4" size={24} />
            <h3 className="font-black text-slate-900 mb-1">1. Sign Up</h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">Join the EB Tutors portal.</p>
          </div>
          <div className="text-left p-6 rounded-3xl bg-slate-50 border border-slate-100">
            <Clock className="text-blue-600 mb-4" size={24} />
            <h3 className="font-black text-slate-900 mb-1">2. Rate Approval</h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">Evan sets your bespoke rate.</p>
          </div>
          <div className="text-left p-6 rounded-3xl bg-slate-50 border border-slate-100">
            <CheckCircle className="text-emerald-500 mb-4" size={24} />
            <h3 className="font-black text-slate-900 mb-1">3. Pay & Book</h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">Secure your slot instantly.</p>
          </div>
        </div>
      </section>

      {/* --- STATS GRID (From Old Page) --- */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 text-center">
          <StatBox val="20+" label="Students Supported" />
          <StatBox val="200+" label="Hours Experience" />
          <StatBox val="100%" label="Recommend Rate" />
          <StatBox val="1st" label="Predicted Class" />
        </div>
      </section>

      {/* --- METHOD SECTION (The Tracker Showcase) --- */}
      <section id="method" className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
              The Evan Billings Method
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-[0.9] text-slate-900 tracking-tighter">
              Organised success with a bespoke student portal.
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              I don't just teach content; I structure your revision. Every student gets a custom dashboard with resources embedded directly into it, ensuring you never lose track.
            </p>
            <ul className="space-y-4 pt-2">
              <MethodItem text="Real-time syllabus tracking" />
              <MethodItem text="Curated revision quizzes embedded" />
              <MethodItem text="Instant performance feedback" />
            </ul>
          </div>
          
          <div className="flex-1 w-full relative group">
              <div className="absolute -top-4 -right-2 z-10 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-slate-700">
                <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Updated</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                <Image 
                    src="/gcse-chemistry-tracker.png" 
                    alt="GCSE Chemistry Revision Tracker" 
                    width={1920} height={1080}
                    className="w-full h-auto object-cover"
                    unoptimized={true}
                />
              </div>
          </div>
        </div>
      </section>

      {/* --- ACADEMIC EXCELLENCE (The Grid) --- */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-black tracking-tighter mb-12">Academic Excellence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HighlightCard icon={<Sparkles/>} num="13" label="Grade 9s (GCSE)" sub="Included 2 Self-Taught" color="bg-cyan-400" />
            <HighlightCard icon={<Trophy/>} num="4 A*s" label="A-Level" sub="Maths, FM, Physics, Chem" color="bg-yellow-400" />
            <HighlightCard icon={<GraduationCap/>} customIcon={true} label="Predicted 1st" sub="Cambridge University" color="bg-indigo-500" />
          </div>
        </div>
      </section>

      {/* --- REVIEWS --- */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center tracking-tighter mb-16">Student Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Review name="Poppy" text="Evan really helped me feel more motivated. My GCSE Chemistry grade improved from a 1 to a 7 in just 3 months." />
            <Review name="Jack Hunter" text="Truly exceptional tutor! I achieved a grade 9 in my Spanish, Chemistry and Maths." />
            <Review name="Holly" text="I was very happy with overall tuition and the way Evan took an approach to my learning. Highly recommend!" />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-20 border-t border-slate-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-slate-900 text-white p-1 rounded-lg"><Star size={14} fill="currentColor"/></div>
            <span className="text-sm font-black tracking-tighter">EB Tutors</span>
        </div>
        <p className="text-slate-400 text-xs font-bold mb-6">
          &copy; {new Date().getFullYear()} Evan Billings. Cambridge, UK.
        </p>
        <div className="flex justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Link href="#" className="hover:text-blue-600 transition">Privacy</Link>
          <Link href="#" className="hover:text-blue-600 transition">Terms</Link>
          <Link href="mailto:evancbillings@gmail.com" className="hover:text-blue-600 transition">Contact</Link>
        </div>
      </footer>
    </main>
  );
}

// --- HELPER COMPONENTS ---

function StatBox({ val, label }: { val: string, label: string }) {
  return (
    <div className="space-y-1">
      <div className="text-5xl font-black text-slate-900 tracking-tighter">{val}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function MethodItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-lg font-bold text-slate-700">
      <CheckCircle className="text-blue-600 shrink-0" size={20} /> <span>{text}</span>
    </li>
  );
}

function HighlightCard({ icon, num, label, sub, color, customIcon }: any) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
        <div className={`absolute top-0 right-0 ${color} w-12 h-12 flex items-center justify-center rounded-bl-2xl shadow-sm`}>
            {icon}
        </div>
        {customIcon ? <GraduationCap size={48} className="text-blue-600 mb-4" /> : <div className="text-5xl font-black text-blue-600 mb-2 tracking-tighter">{num}</div>}
        <div className="text-xs font-black text-slate-900 uppercase tracking-widest">{label}</div>
        <div className="text-[10px] text-slate-400 mt-2 font-bold uppercase">{sub}</div>
    </div>
  );
}

function Review({ name, text }: { name: string, text: string }) {
  return (
    <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex flex-col relative group hover:border-blue-200 transition-all">
      <Quote className="absolute top-8 right-8 text-slate-200 fill-slate-200 group-hover:text-blue-100 transition-colors" size={48} />
      <div className="flex gap-1 mb-6">
        {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
      </div>
      <p className="text-slate-600 mb-8 italic font-medium leading-relaxed flex-grow text-sm">"{text}"</p>
      <div>
        <div className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-tight">
          {name} <Check size={14} className="text-emerald-500" strokeWidth={4} />
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Student</div>
      </div>
    </div>
  );
}