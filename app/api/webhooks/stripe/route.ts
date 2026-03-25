import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  // Initialize inside function so env vars are available at runtime
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
    console.error("Webhook signature error:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const studentEmail = session.metadata?.student_email;

    console.log("📧 Student email from metadata:", studentEmail);

    if (studentEmail) {
      // 1. Get current balance
      const { data: profile, error: fetchError } = await supabase
        .from("student_profiles")
        .select("lessons_balance")
        .eq("email", studentEmail)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching profile:", fetchError.message);
        return NextResponse.json({ error: "Profile fetch failed" }, { status: 500 });
      }

      const currentBalance = profile?.lessons_balance || 0;
      console.log(`📊 Current balance for ${studentEmail}: ${currentBalance}`);

      // 2. Update balance AND log the payment record
      const [updateResult, insertResult] = await Promise.all([
        supabase
          .from("student_profiles")
          .update({ lessons_balance: currentBalance + 1 })
          .eq("email", studentEmail),

        supabase
          .from("payments")
          .insert({
            student_email: studentEmail,
            amount_paid: session.amount_total ? session.amount_total / 100 : 0,
            lessons_added: 1,
            stripe_session_id: session.id,
          } as any)
      ]);

      if (updateResult.error) {
        console.error("❌ Error updating balance:", updateResult.error.message);
      } else {
        console.log(`✅ Success: Added 1 lesson to ${studentEmail}. New balance: ${currentBalance + 1}`);
      }

      if (insertResult.error) {
        console.error("❌ Error logging payment:", insertResult.error.message);
      }
    } else {
      console.error("❌ No student_email in session metadata");
    }
  }

  return NextResponse.json({ received: true });
}