import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch attendee feedback for this session
    const feedbackRes = await fetch(
      `${supabaseUrl}/rest/v1/attendee_feedback?session_id=eq.${session_id}&select=attendee_name,rating,what_liked,what_improve,key_takeaway,would_recommend`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const feedbackItems = await feedbackRes.json();

    if (!feedbackItems || feedbackItems.length === 0) {
      return new Response(
        JSON.stringify({ summary: "No attendee feedback has been submitted for this session yet.", feedback_count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also fetch session info
    const sessionRes = await fetch(
      `${supabaseUrl}/rest/v1/sessions?id=eq.${session_id}&select=topic,date,trainer_id,trainers(name)`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );
    const sessionData = await sessionRes.json();
    const session = sessionData?.[0];

    // Build the prompt for Gemini
    const avgRating = (feedbackItems.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbackItems.length).toFixed(1);
    const recommendCount = feedbackItems.filter((f: any) => f.would_recommend).length;

    const feedbackText = feedbackItems.map((f: any, i: number) => {
      const name = f.attendee_name || "Anonymous";
      return `[${i + 1}] ${name} (Rating: ${f.rating}/5${f.would_recommend ? ", recommends" : ""})
  Liked: ${f.what_liked || "N/A"}
  Improve: ${f.what_improve || "N/A"}
  Takeaway: ${f.key_takeaway || "N/A"}`;
    }).join("\n\n");

    const prompt = `You are an expert session evaluator. Summarize the following attendee feedback for a tech talk session.

Session: "${session?.topic || "Unknown"}" by ${session?.trainers?.name || "Unknown"}
Date: ${session?.date || "Unknown"}
Total Feedback: ${feedbackItems.length}
Average Rating: ${avgRating}/5
Recommendation Rate: ${recommendCount}/${feedbackItems.length}

Attendee Feedback:
${feedbackText}

Provide a concise summary (3-5 sentences) covering:
1. Overall sentiment and key strengths
2. Most common improvement suggestions
3. Top takeaways mentioned by attendees
4. A brief recommendation for the presenter

Keep it professional, constructive, and actionable.`;

    // Call Gemini API
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      // Fallback: generate a basic summary without Gemini
      const fallbackSummary = `Based on ${feedbackItems.length} feedback responses with an average rating of ${avgRating}/5 and ${recommendCount} recommendations out of ${feedbackItems.length}: The session received ${Number(avgRating) >= 4 ? "positive" : Number(avgRating) >= 3 ? "mixed" : "critical"} feedback overall. ${feedbackItems.filter((f: any) => f.what_liked).length} attendees shared what they liked, and ${feedbackItems.filter((f: any) => f.what_improve).length} provided improvement suggestions.`;

      // Save the fallback summary
      await fetch(
        `${supabaseUrl}/rest/v1/sessions?id=eq.${session_id}`,
        {
          method: "PATCH",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            summarized_feedback: fallbackSummary,
            feedback_summary_updated_at: new Date().toISOString(),
          }),
        }
      );

      return new Response(
        JSON.stringify({ summary: fallbackSummary, feedback_count: feedbackItems.length, source: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const summary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate summary.";

    // Save the summary to the session
    await fetch(
      `${supabaseUrl}/rest/v1/sessions?id=eq.${session_id}`,
      {
        method: "PATCH",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          summarized_feedback: summary,
          feedback_summary_updated_at: new Date().toISOString(),
        }),
      }
    );

    return new Response(
      JSON.stringify({ summary, feedback_count: feedbackItems.length, source: "gemini" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
