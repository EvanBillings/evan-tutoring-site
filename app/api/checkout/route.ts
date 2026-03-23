import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your Secret Key from .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any, 
});

export async function POST(req: Request) {
  try {
    const { email, rate, lessonDate } = await req.json();

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "1-to-1 Tutoring Session (EB Tutors)",
              description: `Lesson scheduled for: ${lessonDate}`,
            },
            unit_amount: rate * 100, // Stripe handles currency in pence (e.g., £40 = 4000)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Redirect back to your dashboard on success
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book`,
      customer_email: email,
      metadata: {
        student_email: email,
        lesson_date: lessonDate,
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}