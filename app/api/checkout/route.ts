import { NextResponse } from "next/server";
import Stripe from "stripe";

// @ts-ignore: Bypassing version check to fix Vercel build mismatch
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as any,
});

export async function POST(req: Request) {
  try {
    const { email, rate, userId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "EB Tutors - 1-Hour Lesson",
              description: `Tutoring for ${email}`,
            },
            unit_amount: rate * 100, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book`,
      customer_email: email,
      metadata: { userId, email, type: "lesson_topup" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}