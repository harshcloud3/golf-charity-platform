import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { score, score_date } = await request.json();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    if (score < 1 || score > 45) {
      return NextResponse.json({ error: "Score must be between 1 and 45" }, { status: 400 });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const finalDate = score_date || today;
    
    const { data, error } = await supabase
      .from("scores")
      .insert([{ user_id: user.id, score: score, score_date: finalDate }])
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
