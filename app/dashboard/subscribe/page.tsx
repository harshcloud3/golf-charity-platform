"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

// Replace with your actual Stripe price IDs from Stripe dashboard
const MONTHLY_PRICE_ID = "price_1TFYVeGhCDgQkjxssNQ7lPUi"; // ← REPLACE with your actual price ID
const YEARLY_PRICE_ID = "price_1TFYWOGhCDgQkjxsPipzzOKq";   // ← REPLACE with your actual price ID

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoading(planName);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      });

      const { url, error } = await response.json();
      
      if (error) {
        console.error("Error:", error);
        alert("Failed to create checkout session. Please try again.");
      } else if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Monthly Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Monthly Plan</h2>
            <p className="text-4xl font-bold text-green-600 mb-4">$10<span className="text-lg text-gray-500">/month</span></p>
            <ul className="text-left mb-6 space-y-2">
              <li>✓ Enter unlimited scores</li>
              <li>✓ Participate in monthly draws</li>
              <li>✓ Support your chosen charity</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <button
              onClick={() => handleSubscribe(MONTHLY_PRICE_ID, "Monthly")}
              disabled={loading !== null}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading === "Monthly" ? "Processing..." : "Subscribe Monthly"}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-green-500">
            <div className="bg-green-500 text-white text-sm px-3 py-1 rounded-full inline-block mb-4">Best Value</div>
            <h2 className="text-2xl font-bold mb-4">Yearly Plan</h2>
            <p className="text-4xl font-bold text-green-600 mb-4">$100<span className="text-lg text-gray-500">/year</span></p>
            <p className="text-sm text-gray-500 mb-4">Save $20 compared to monthly</p>
            <ul className="text-left mb-6 space-y-2">
              <li>✓ Everything in Monthly</li>
              <li>✓ 2 months free</li>
              <li>✓ Priority support</li>
              <li>✓ Exclusive tournament access</li>
            </ul>
            <button
              onClick={() => handleSubscribe(YEARLY_PRICE_ID, "Yearly")}
              disabled={loading !== null}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading === "Yearly" ? "Processing..." : "Subscribe Yearly"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}