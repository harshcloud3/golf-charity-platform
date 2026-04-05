"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [newScore, setNewScore] = useState("");
  const [newScoreDate, setNewScoreDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Ensure profile exists
  const ensureProfile = async (userId: string, email: string) => {
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError || !existingProfile) {
      console.log("Profile not found, creating...");
      const { error: createError } = await supabase.from("profiles").insert([
        {
          id: userId,
          email: email,
          full_name: user?.user_metadata?.full_name || email.split('@')[0],
          subscription_status: "inactive",
          charity_percentage: 10,
        },
      ]);
      
      if (createError) {
        console.error("Failed to create profile:", createError);
        return false;
      }
      console.log("Profile created successfully");
      return true;
    }
    return true;
  };

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    setUser(user);
    await ensureProfile(user.id, user.email || "");
    await fetchProfile(user.id);
    await fetchScores(user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (data) setProfile(data);
  };

  const fetchScores = async (userId: string) => {
    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("score_date", { ascending: false });
    
    if (data) setScores(data);
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!newScore) {
      setMessage("Please enter a score");
      return;
    }
    
    const scoreValue = parseInt(newScore);
    if (scoreValue < 1 || scoreValue > 45) {
      setMessage("Score must be between 1 and 45");
      return;
    }
    
    // Use today's date if no date provided
    const today = new Date().toISOString().split('T')[0];
    const scoreDate = newScoreDate || today;
    
    // Make sure we have the current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      setMessage("You must be logged in to add scores");
      return;
    }
    
    const { error } = await supabase.from("scores").insert([
      {
        user_id: currentUser.id,
        score: scoreValue,
        score_date: scoreDate,
      },
    ]);
    
    if (!error) {
      setNewScore("");
      setNewScoreDate("");
      fetchScores(currentUser.id);
      setMessage("✅ Score added successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      console.error("Error:", error);
      setMessage("Error adding score: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.full_name || user?.email?.split('@')[0] || 'Golfer'}!</h1>
            <p className="text-gray-600 mt-2">Track your scores and see your impact</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-4 p-3 rounded-lg text-center" className={`${message.includes('✅') ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}>
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Score Entry Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Log a Score</h2>
            <p className="text-gray-600 text-sm mb-4">
              Enter your latest Stableford score (1-45 points). Only your 5 most recent scores will be kept.
            </p>
            <form onSubmit={handleAddScore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score (1-45)</label>
                <input
                  type="number"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  min="1"
                  max="45"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your score"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date (optional)</label>
                <input
                  type="date"
                  value={newScoreDate}
                  onChange={(e) => setNewScoreDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use today's date</p>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Log Score
              </button>
            </form>

            {/* Recent Scores */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Your Recent Scores</h3>
              {scores.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active scores yet. Get out on the course!</p>
              ) : (
                <div className="space-y-2">
                  {scores.slice(0, 5).map((score) => (
                    <div key={score.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-semibold text-lg">{score.score}</span>
                        <span className="text-gray-600 ml-2">Stableford points</span>
                      </div>
                      <div className="text-gray-500">{new Date(score.score_date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Status:{" "}
                <span className={`font-semibold ${profile?.subscription_status === "active" ? "text-green-600" : "text-red-600"}`}>
                  {profile?.subscription_status === "active" ? "Active ✅" : "Inactive ❌"}
                </span>
              </p>
              {profile?.subscription_status !== "active" && (
                <Link href="/dashboard/subscribe">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    Activate Subscription
                  </button>
                </Link>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-3">Your Impact</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  Selected Charity: <span className="font-semibold">Golf for Good</span>
                </p>
                <p className="text-gray-700">
                  Contribution Rate: <span className="font-semibold">{profile?.charity_percentage || 10}%</span>
                </p>
                <p className="text-gray-700">
                  Total Draws Entered: <span className="font-semibold">{scores.length > 0 ? scores.length : "0"}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-2">Upcoming Draw</h3>
              <p className="text-gray-600">The next official monthly draw occurs soon. Keep logging scores!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
