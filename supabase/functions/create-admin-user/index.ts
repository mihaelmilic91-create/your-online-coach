import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Create user with admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName || email.split("@")[0],
      },
    });

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    if (!userData.user) {
      throw new Error("User creation returned no user");
    }

    // Add admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userData.user.id,
        role: "admin",
      });

    if (roleError) {
      console.error("Role insert error:", roleError);
      // Try to delete the user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw new Error(`Failed to assign admin role: ${roleError.message}`);
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: userData.user.id,
        display_name: displayName || email.split("@")[0],
        access_until: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100 years
      });

    if (profileError) {
      console.error("Profile insert error:", profileError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Admin user ${email} created successfully`,
      userId: userData.user.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    console.error("Error creating admin user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
