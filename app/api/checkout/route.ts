import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with the Secret Key from environment variables
// Using the 2026-02-25.clover version string to match your SDK version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as any,
});

export async function POST(req: Request) {
  try {
    const { email, rate, userId } = await req.json();

    // 1. Validation check
    if (!email || !rate) {
      return NextResponse.json({ error: "Missing email or rate" }, { status: 400 });
    }

    // 2. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "EB Tutors - 1-Hour Lesson Credit",
              description: `Pre-paid tutoring session for ${email}. Rate: £${rate}/hr`,
            },
            unit_amount: rate * 100, // Stripe expects amount in pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Redirect back to your dashboard with a success flag
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book`,
      customer_email: email,
      // Metadata is crucial for your Webhook to update the student's credits in Supabase
      metadata: {
        student_email: email,
        type: "lesson_topup",
        userId: userId || "",
      },
    });

    // 3. Return the session URL so the frontend can redirect the user
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}