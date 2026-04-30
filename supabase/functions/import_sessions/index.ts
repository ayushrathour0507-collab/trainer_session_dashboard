import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SessionData {
  topic: string;
  presenter: string;
  date: string;
  attendeeCount: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Sessions data from the CSV
    const sessions: SessionData[] = [
      { topic: "Vibe Coding", presenter: "Shaik Abdul Cader B", date: "2025-05-18", attendeeCount: 2 },
      { topic: "Vibe Coding 2", presenter: "Shaik Abdul Cader B", date: "2025-05-20", attendeeCount: 3 },
      { topic: "Automation using n8n", presenter: "Srinath S", date: "2025-05-26", attendeeCount: 5 },
      { topic: "Beyond the Chatbots", presenter: "Devisree K", date: "2025-06-02", attendeeCount: 5 },
      {
        topic: "End-to-End workflow of a data analysis and machine learning project",
        presenter: "Bindhiya J",
        date: "2025-06-09",
        attendeeCount: 5,
      },
      { topic: "GCP", presenter: "Mahajan Sharma", date: "2025-06-16", attendeeCount: 4 },
      {
        topic: "From Data Preparation to Interactive Insights: A Complete Power BI Dashboard Development Journey",
        presenter: "Kamatchi U",
        date: "2025-06-23",
        attendeeCount: 3,
      },
      { topic: "System Design", presenter: "Siva Prasanna", date: "2025-06-30", attendeeCount: 4 },
      { topic: "Vector DB (Chroma DB - Live Demo)", presenter: "Rahini C", date: "2025-07-07", attendeeCount: 6 },
      { topic: "GenAI in Testing", presenter: "nikhil", date: "2025-07-14", attendeeCount: 5 },
      { topic: "Session 11", presenter: "Anthony Sahaya Michael", date: "2025-07-21", attendeeCount: 3 },
      { topic: "Session 12", presenter: "Navaneethakrishnan P", date: "2025-07-28", attendeeCount: 4 },
      { topic: "Session 13", presenter: "Aravindhan S", date: "2025-08-04", attendeeCount: 2 },
      { topic: "Session 14", presenter: "Kumar Raghuveer Royal Amara", date: "2025-08-11", attendeeCount: 2 },
      { topic: "Session 15", presenter: "Arcchana V", date: "2025-08-18", attendeeCount: 1 },
      { topic: "Session 16", presenter: "Karunya Mohan", date: "2025-08-25", attendeeCount: 2 },
      { topic: "Session 17", presenter: "Ajin Roch", date: "2025-09-01", attendeeCount: 3 },
      { topic: "Session 18", presenter: "Vasudevan Badri", date: "2025-09-08", attendeeCount: 2 },
    ];

    // Create or get trainers
    const trainerMap = new Map<string, string>();
    const uniqueTrainers = [...new Set(sessions.map((s) => s.presenter))];

    for (const trainerName of uniqueTrainers) {
      const { data: existing } = await supabase
        .from("trainers")
        .select("id")
        .eq("name", trainerName)
        .maybeSingle();

      if (existing) {
        trainerMap.set(trainerName, existing.id);
      } else {
        const { data: newTrainer } = await supabase
          .from("trainers")
          .insert([{ name: trainerName }])
          .select("id")
          .single();

        if (newTrainer) {
          trainerMap.set(trainerName, newTrainer.id);
        }
      }
    }

    // Create sessions
    const createdSessions = [];
    for (const session of sessions) {
      const trainerId = trainerMap.get(session.presenter);
      if (!trainerId) continue;

      const sessionDate = new Date(session.date);
      const monthStart = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), 1);

      const { data: existingSession } = await supabase
        .from("sessions")
        .select("id")
        .eq("trainer_id", trainerId)
        .eq("date", session.date)
        .maybeSingle();

      if (!existingSession) {
        const { data: newSession } = await supabase
          .from("sessions")
          .insert([
            {
              trainer_id: trainerId,
              date: session.date,
              month: monthStart.toISOString().split("T")[0],
              topic: session.topic,
            },
          ])
          .select();

        if (newSession) {
          createdSessions.push(...newSession);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Imported ${createdSessions.length} sessions and ${trainerMap.size} trainers`,
        trainersCreated: trainerMap.size,
        sessionsCreated: createdSessions.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
