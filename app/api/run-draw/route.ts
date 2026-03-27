import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createClient();

  try {
    // Get all active subscribers with their latest 5 scores
    const { data: users } = await supabase
      .from("profiles")
      .select("id, email, scores(score)")
      .eq("subscription_status", "active");

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No active subscribers" }, { status: 400 });
    }

    // Calculate total prize pool (assuming $10/month subscription, 50% goes to prize pool)
    const activeCount = users.length;
    const totalPrizePool = activeCount * 10 * 0.5; // 50% of $10/month

    // Calculate tier pools
    const fiveMatchPool = totalPrizePool * 0.4;
    const fourMatchPool = totalPrizePool * 0.35;
    const threeMatchPool = totalPrizePool * 0.25;

    // Generate random winning numbers (for demo)
    const winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);

    // Score matching logic (simplified for demo)
    const winners = [];
    for (const user of users) {
      const userScores = user.scores?.map((s: any) => s.score) || [];
      const matchCount = userScores.filter((score: number) => winningNumbers.includes(score)).length;

      if (matchCount >= 3) {
        winners.push({
          user_id: user.id,
          match_type: matchCount === 5 ? "5-number" : matchCount === 4 ? "4-number" : "3-number",
          prize_amount: matchCount === 5 ? fiveMatchPool : matchCount === 4 ? fourMatchPool : threeMatchPool,
          verification_status: "pending",
        });
      }
    }

    // Save winners to database
    if (winners.length > 0) {
      const { error } = await supabase.from("winners").insert(winners);
      if (error) throw error;
    }

    // Save draw results
    await supabase.from("draws").insert([
      {
        month: new Date().toISOString().slice(0, 7),
        draw_type: "random",
        results: { winningNumbers, winners: winners.length },
        published: true,
      },
    ]);

    return NextResponse.json({ success: true, winners: winners.length });
  } catch (error) {
    console.error("Draw error:", error);
    return NextResponse.json({ error: "Failed to run draw" }, { status: 500 });
  }
}