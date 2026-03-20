import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ML_API_BASE = "https://forgetting-backend.onrender.com/predict";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { concept, difficulty, time_gap } = await req.json();

    if (!concept || !difficulty || time_gap === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: concept, difficulty, time_gap" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map string difficulty to numeric value for ML API
    const difficultyMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
    const difficultyNum = difficultyMap[difficulty] ?? 2;

    // ML API expects query parameters, not JSON body
    const url = `${ML_API_BASE}?concept=${encodeURIComponent(concept)}&difficulty=${difficultyNum}&time_gap=${encodeURIComponent(time_gap)}`;

    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`ML API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calling ML API:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
