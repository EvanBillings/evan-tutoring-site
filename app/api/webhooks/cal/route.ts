import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase with the SERVICE ROLE KEY to bypass RLS (Server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = body.payload;
    
    // 1. Identify the student and their choice
    const attendeeEmail = payload.attendees[0].email;
    const triggerEvent = body.triggerEvent; // e.g. "BOOKING_CREATED" or "BOOKING_CANCELLED"

    // 2. Extract custom questions (Subject & Level)
    const responses = payload.responses;
    const chosenSubject = responses?.subject?.value || "Unspecified";
    const chosenLevel = responses?.level?.value || "Unspecified";

    console.log(`🔔 Webhook Received: ${triggerEvent} for ${attendeeEmail}`);

    // --- CASE 1: NEW BOOKING (Deduct 1 Credit) ---
    if (triggerEvent === "BOOKING_CREATED") {
      // Get current balance
      const { data: profile, error: fetchError } = await supabase
        .from("student_profiles")
        .select("lessons_balance")
        .eq("email", attendeeEmail)
        .single();

      if (fetchError || !profile) {
        console.error("❌ Student not found:", attendeeEmail);
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

      const newBalance = Math.max(0, (profile.lessons_balance || 0) - 1);

      const { error: updateError } = await supabase
        .from("student_profiles")
        .update({ lessons_balance: newBalance })
        .eq("email", attendeeEmail);

      if (updateError) throw updateError;
      
      console.log(`✅ Deducted 1 credit. ${attendeeEmail} now has ${newBalance}. Topic: ${chosenSubject}`);
    }

    // --- CASE 2: CANCELLATION (Refund 1 Credit) ---
    if (triggerEvent === "BOOKING_CANCELLED") {
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("lessons_balance")
        .eq("email", attendeeEmail)
        .single();

      if (profile) {
        const refundedBalance = (profile.lessons_balance || 0) + 1;
        await supabase
          .from("student_profiles")
          .update({ lessons_balance: refundedBalance })
          .eq("email", attendeeEmail);
          
        console.log(`↺ Refunded 1 credit. ${attendeeEmail} now has ${refundedBalance}.`);
      }
    }

    return NextResponse.json({ received: true });

  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}