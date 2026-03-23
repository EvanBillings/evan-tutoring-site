import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe. 
// Note: We remove the manual version string and let the SDK handle it,
// which is the recommended approach for Stripe v20.4+
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
              name: "EB Tutors - 1-Hour Lesson Credit",
              description: `Pre-paid session for ${email}.`,
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
      metadata: {
        student_email: email,
        userId: userId || "",
        type: "lesson_topup",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}