import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with the version Vercel expects
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as any, 
});

export async function POST(req: Request) {
  try {
    const { email, rate, userId } = await req.json();

    // Create a Stripe Checkout Session for a Lesson Credit
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "EB Tutors - 1-Hour Lesson Credit",
              description: `Pre-paid session for ${email}. Bespoke rate: £${rate}/hr`,
            },
            unit_amount: rate * 100, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Use NEXT_PUBLIC_SITE_URL or BASE_URL depending on your .env
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book`,
      customer_email: email,
      metadata: {
        student_email: email,
        type: "lesson_topup",
      },
    });

    // Return the URL for the frontend to redirect to
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}