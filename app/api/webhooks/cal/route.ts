import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const payload = body.payload;

    // Guard against ping tests or malformed payloads
    if (!payload?.attendees?.[0]?.email) {
      console.log("⚠️ No attendee email found - likely a ping test");
      return NextResponse.json({ received: true });
    }
    
    const attendeeEmail = payload.attendees[0].email;
    const triggerEvent = body.triggerEvent;

    const responses = payload.responses;
    const chosenSubject = responses?.subject?.value || "Unspecified";

    console.log(`🔔 Webhook Received: ${triggerEvent} for ${attendeeEmail}`);

    if (triggerEvent === "BOOKING_CREATED") {
      const { data: profile, error: fetchError } = await supabase
        .from("student_profiles")
        .select("lessons_balance")
        .eq("email", attendeeEmail)
        .single();

      if (fetchError || !profile) {
        console.error("❌ Student not found:", attendeeEmail);
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

      const newBalance = Math.max(0, ((profile as any).lessons_balance || 0) - 1);

      const { error: updateError } = await supabase
        .from("student_profiles")
        .update({ lessons_balance: newBalance } as any)
        .eq("email", attendeeEmail);

      if (updateError) throw updateError;
      
      console.log(`✅ Deducted 1 credit. ${attendeeEmail} now has ${newBalance}. Topic: ${chosenSubject}`);
    }

    if (triggerEvent === "BOOKING_CANCELLED") {
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("lessons_balance")
        .eq("email", attendeeEmail)
        .single();

      if (profile) {
        const refundedBalance = ((profile as any).lessons_balance || 0) + 1;
        await supabase
          .from("student_profiles")
          .update({ lessons_balance: refundedBalance } as any)
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