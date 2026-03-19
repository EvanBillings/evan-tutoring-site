import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia", 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, userEmail } = await req.json();

    // 1. Fetch the CUSTOM RATE from Supabase
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("hourly_rate")
      .eq("id", userId)
      .single();

    if (!profile) throw new Error("Student profile not found");

    // 2. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "1-Hour Tutoring Session",
              description: `Evan Billings Tutoring - Session for ${userEmail}`,
            },
            unit_amount: profile.hourly_rate * 100, // Stripe uses pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/book?canceled=true`,
      customer_email: userEmail,
      metadata: { userId }, 
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}