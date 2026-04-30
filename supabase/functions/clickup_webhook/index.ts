import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const eventType = payload.event;

    if (!eventType?.includes("task")) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Extract task data from ClickUp webhook
    const task = payload.task || {};
    const taskId = task.id || payload.id || "";
    const taskName = task.name || payload.name || "";
    const taskStatus = task.status?.status || payload.status?.status || "";
    const customFields = task.custom_fields || [];

    // Look for session_id custom field
    let sessionId = null;
    for (const field of customFields) {
      if ((field.id === "session_id" || field.label === "session_id") && field.value) {
        sessionId = field.value;
        break;
      }
    }

    if (!sessionId) {
      console.log("No session_id found in ClickUp task");
      return new Response(JSON.stringify({ success: true, message: "No session_id found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ClickUp webhook for session: ${sessionId}, task: ${taskName}`);

    // First, verify the session exists
    const sessionCheckRes = await fetch(
      `${supabaseUrl}/rest/v1/sessions?id=eq.${sessionId}&select=id`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const sessionCheck = await sessionCheckRes.json();
    if (!sessionCheck || sessionCheck.length === 0) {
      console.log(`Session ${sessionId} not found in database`);
      return new Response(
        JSON.stringify({ success: false, message: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update session with latest ClickUp data
    const updateData: Record<string, string> = {};

    // Update topic if task name changed
    if (taskName) {
      updateData.topic = taskName;
    }

    // If session has any updates, apply them
    if (Object.keys(updateData).length > 0) {
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/sessions?id=eq.${sessionId}`,
        {
          method: "PATCH",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!updateRes.ok) {
        console.error("Failed to update session:", await updateRes.text());
      } else {
        console.log(`Successfully updated session ${sessionId}`);
      }
    }

    // Log webhook event for audit trail
    await fetch(
      `${supabaseUrl}/rest/v1/webhook_logs`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "clickup_webhook",
          task_id: taskId,
          task_name: taskName,
          session_id: sessionId,
          status: taskStatus,
          payload: payload,
          created_at: new Date().toISOString(),
        }),
      }
    ).catch(() => null);

    // Broadcast update through Supabase Realtime to trigger client refresh
    console.log(`Webhook processed successfully for session ${sessionId}`);
    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed", sessionId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
