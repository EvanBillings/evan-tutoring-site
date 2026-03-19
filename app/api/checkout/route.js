import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // This must match your package.json version exactly to pass the Vercel build
  apiVersion: "2026-02-25.clover", 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, userEmail } = await req.json();

    const { data: profile } = await supabase
      .from("student_profiles")
      .select("hourly_rate")
      .eq("id", userId)
      .single();

    if (!profile) throw new Error("Student profile not found");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "EB Tutors - 1-Hour Session",
              description: `Physics & Maths Tutoring for ${userEmail}`,
            },
            unit_amount: profile.hourly_rate * 100,
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