import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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

    if (!profile) throw new Error("Profile not found");

    // Handle Free Lessons (£0) - Skip Stripe to avoid 0.00 error
    if (profile.hourly_rate === 0) {
      return NextResponse.json({ 
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&free=true` 
      });
    }

    // Handle Paid Lessons (£1 - £100)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "gbp",
          product_data: {
            name: "EB Tutors - 1-Hour Session",
            description: "Physics & Maths Mentorship • St John's College, Cambridge",
          },
          unit_amount: profile.hourly_rate * 100, 
        },
        quantity: 1,
      }],
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