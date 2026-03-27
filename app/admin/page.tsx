"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Check if user is admin (email contains admin or specific domain)
    if (user.email !== "admin@example.com" && !user.email?.includes("admin")) {
      router.push("/dashboard");
      return;
    }

    await loadData();
    setLoading(false);
  };

  const loadData = async () => {
    // Load users
    const { data: usersData } = await supabase
      .from("profiles")
      .select("*");
    if (usersData) setUsers(usersData);

    // Load charities
    const { data: charitiesData } = await supabase
      .from("charities")
      .select("*");
    if (charitiesData) setCharities(charitiesData);

    // Load winners
    const { data: winnersData } = await supabase
      .from("winners")
      .select("*, profiles(full_name, email)");
    if (winnersData) setWinners(winnersData);
  };

  const runDraw = async () => {
    const response = await fetch("/api/run-draw", { method: "POST" });
    const result = await response.json();
    if (result.success) {
      alert("Draw completed successfully!");
      loadData();
    } else {
      alert("Error running draw: " + result.error);
    }
  };

  const verifyWinner = async (winnerId: string, status: string) => {
    const { error } = await supabase
      .from("winners")
      .update({ verification_status: status })
      .eq("id", winnerId);

    if (!error) {
      alert(`Winner ${status}`);
      loadData();
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{users.length}</div>
            <div className="text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{charities.length}</div>
            <div className="text-gray-600">Charities</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{winners.length}</div>
            <div className="text-gray-600">Total Winners</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={runDraw}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Run Monthly Draw
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Charity %</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-6 py-3">{user.email}</td>
                    <td className="px-6 py-3">{user.full_name}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${user.subscription_status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-3">{user.charity_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Winners Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Winners</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Match Type</th>
                  <th className="px-6 py-3 text-left">Prize</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((winner) => (
                  <tr key={winner.id} className="border-t">
                    <td className="px-6 py-3">{winner.profiles?.email || "N/A"}</td>
                    <td className="px-6 py-3">{winner.match_type}</td>
                    <td className="px-6 py-3">${winner.prize_amount}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        winner.verification_status === "paid" ? "bg-green-100 text-green-800" :
                        winner.verification_status === "approved" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {winner.verification_status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {winner.verification_status === "pending" && (
                        <>
                          <button
                            onClick={() => verifyWinner(winner.id, "approved")}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => verifyWinner(winner.id, "rejected")}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {winner.verification_status === "approved" && (
                        <button
                          onClick={() => verifyWinner(winner.id, "paid")}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}