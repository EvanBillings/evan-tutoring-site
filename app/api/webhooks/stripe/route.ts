import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const studentEmail = session.metadata?.student_email;

    if (studentEmail) {
      // 1. Get current balance
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("lessons_balance")
        .eq("email", studentEmail)
        .single();

      const currentBalance = profile?.lessons_balance || 0;

      // 2. Update balance AND log the payment record
      // We use a Promise.all to ensure both database operations happen
      await Promise.all([
        // Increment the balance
        supabase
          .from("student_profiles")
          .update({ lessons_balance: currentBalance + 1 })
          .eq("email", studentEmail),

        // Log the transaction for the Payment History page
        supabase
          .from("payments")
          .insert({
            student_email: studentEmail,
            amount_paid: session.amount_total ? session.amount_total / 100 : 0,
            lessons_added: 1,
            stripe_session_id: session.id,
          })
      ]);
        
      console.log(`✅ Success: Logged payment and added 1 lesson to ${studentEmail}`);
    }
  }

  return NextResponse.json({ received: true });
}