import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;
    
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const supabase = await createClient();
      
      const userId = session.metadata?.user_id;
      
      if (userId) {
        await supabase
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("id", userId);
        
        console.log("✅ Subscription activated for user:", userId);
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
