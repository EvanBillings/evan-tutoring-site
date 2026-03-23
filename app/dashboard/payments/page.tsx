"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { CreditCard, Calendar, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PaymentHistory() {
  const { user } = useUser();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPayments();
  }, [user]);

  async function fetchPayments() {
    const email = user?.primaryEmailAddress?.emailAddress;
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("student_email", email)
      .order("created_at", { ascending: false });

    if (data) setPayments(data);
    setLoading(false);
  }

  return (
    // Added bg-slate-50 and min-h-screen to ensure the whole page stays light
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto p-8 font-sans">
        
        {/* Back Link */}
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8 group w-fit">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
        </Link>

        {/* Title Section - Ensured text-slate-900 */}
        <div className="mb-10">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            Payment History
          </h1>
          <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest mt-2">
            Receipts & Transactions
          </p>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4">Lessons</th>
                <th className="px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading transactions...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center">
                    <p className="text-slate-400 font-bold text-sm">No payments found.</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                          <Calendar size={14}/>
                        </div>
                        <span className="font-bold text-slate-700 text-sm">
                          {new Date(p.created_at).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-slate-900 text-lg tracking-tighter">
                        £{Number(p.amount_paid).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-slate-500 text-sm">
                        +{p.lessons_added} Session
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle size={12} /> Success
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
          Secure Stripe Processing • EB Tutors Billing 
        </p>
      </main>
    </div>
  );
}