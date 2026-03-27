"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";  // ← ADD THIS IMPORT

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [newScore, setNewScore] = useState("");
  const [newScoreDate, setNewScoreDate] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // NEW FUNCTION: Ensure profile exists
  const ensureProfile = async (userId: string, email: string) => {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError || !existingProfile) {
      // Create profile if it doesn't exist
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

  // UPDATED checkUser function
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    setUser(user);
    
    // Ensure profile exists (NEW LINE)
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
    
    if (!newScore || !newScoreDate) return;
    
    const scoreValue = parseInt(newScore);
    if (scoreValue < 1 || scoreValue > 45) {
      alert("Score must be between 1 and 45");
      return;
    }
    
    const { error } = await supabase.from("scores").insert([
      {
        user_id: user.id,
        score: scoreValue,
        score_date: newScoreDate,
      },
    ]);
    
    if (!error) {
      setNewScore("");
      setNewScoreDate("");
      fetchScores(user.id);
    } else {
      alert("Error adding score");
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.full_name || user.email}!</h1>
            <p className="text-gray-600 mt-2">Track your scores and see your impact</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Subscription Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                Status:{" "}
                <span className={`font-semibold ${profile?.subscription_status === "active" ? "text-green-600" : "text-red-600"}`}>
                  {profile?.subscription_status === "active" ? "Active" : "Inactive"}
                </span>
              </p>
              {profile?.subscription_status !== "active" && (
                <Link href="/dashboard/subscribe">  {/* ← ADD THIS LINK */}
                  <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    Subscribe Now
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Charity Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your Impact</h2>
            <p className="text-gray-700">
              Supporting: <span className="font-semibold">Golf for Good</span>
            </p>
            <p className="text-gray-700">
              Contribution: <span className="font-semibold">{profile?.charity_percentage || 10}%</span> of subscription
            </p>
          </div>
        </div>

        {/* Score Entry Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Enter Your Latest Score</h2>
          <form onSubmit={handleAddScore} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Score (1-45)</label>
              <input
                type="number"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                min="1"
                max="45"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newScoreDate}
                onChange={(e) => setNewScoreDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Add Score
              </button>
            </div>
          </form>

          {/* Recent Scores */}
          <h3 className="text-lg font-semibold mb-3">Your Recent Scores</h3>
          <div className="space-y-2">
            {scores.length === 0 ? (
              <p className="text-gray-500">No scores yet. Add your first score above!</p>
            ) : (
              scores.slice(0, 5).map((score) => (
                <div key={score.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold text-lg">{score.score}</span>
                    <span className="text-gray-600 ml-2">Stableford points</span>
                  </div>
                  <div className="text-gray-500">{new Date(score.score_date).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}