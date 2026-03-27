import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;
    
    console.log("📨 Webhook received");
    
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    console.log("Event type:", event.type);
    
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const supabase = createClient();
      
      console.log("Processing checkout.session.completed");
      console.log("Customer email:", session.customer_email);
      console.log("Metadata:", session.metadata);
      
      // Method 1: Try to get user from metadata
      let userId = session.metadata?.user_id;
      
      // Method 2: If no userId, find by email
      if (!userId && session.customer_email) {
        console.log("Looking up user by email:", session.customer_email);
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", session.customer_email)
          .single();
        
        if (profile) {
          userId = profile.id;
          console.log("Found user by email:", userId);
        } else {
          console.log("No user found with email:", session.customer_email);
        }
      }
      
      // Method 3: If still no userId, try to get from customer ID
      if (!userId && session.customer) {
        console.log("Looking up user by customer ID:", session.customer);
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", session.customer)
          .single();
        
        if (profile) {
          userId = profile.id;
          console.log("Found user by customer ID:", userId);
        }
      }
      
      // Update subscription status if we found the user
      if (userId) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ 
            subscription_status: "active",
            stripe_customer_id: session.customer || null
          })
          .eq("id", userId);
        
        if (updateError) {
          console.error("❌ Error updating profile:", updateError);
        } else {
          console.log("✅ Subscription activated for user:", userId);
        }
      } else {
        console.log("⚠️ Could not find user for this subscription");
      }
    }
    
    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const supabase = createClient();
      
      console.log("Processing subscription cancellation");
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", subscription.customer)
        .single();
      
      if (profile) {
        await supabase
          .from("profiles")
          .update({ subscription_status: "inactive" })
          .eq("id", profile.id);
        console.log("❌ Subscription cancelled for user:", profile.id);
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}