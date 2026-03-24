import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe. For v20+, it is best to let the SDK handle 
// the versioning unless you have a specific requirement.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any, 
});

export async function POST(req: Request) {
  try {
    const { email, rate, userId } = await req.json();

    // Use the environment variable for the base URL to avoid 'localhost' errors
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.evanbillings.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "EB Tutors - 1-Hour Lesson Credit",
              description: `Tutoring for ${email}`,
            },
            unit_amount: rate * 100, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/book`,
      customer_email: email,
      // SUGGESTED CHANGE: Explicitly setting student_email in metadata for the webhook
      metadata: { 
        userId, 
        email, 
        student_email: email, 
        type: "lesson_topup" 
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}