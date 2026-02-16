import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "list_users") {
      const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;

      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, access_until");
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      const result = users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        display_name: profileMap.get(u.id)?.display_name || null,
        access_until: profileMap.get(u.id)?.access_until || null,
        role: roleMap.get(u.id) || "user",
      }));

      return new Response(JSON.stringify({ users: result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_user") {
      const updates: Record<string, unknown> = {};
      if (body.access_until !== undefined) updates.access_until = body.access_until;
      if (body.display_name !== undefined) updates.display_name = body.display_name;

      const { error } = await supabase.from("profiles").update(updates).eq("user_id", body.user_id);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get_stats") {
      const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const totalUsers = users?.length || 0;

      const { data: profiles } = await supabase.from("profiles").select("access_until");
      const activeUsers = profiles?.filter(p => p.access_until && new Date(p.access_until) > new Date()).length || 0;

      const { count: totalVideos } = await supabase.from("videos").select("*", { count: "exact", head: true }).eq("is_published", true);
      const { count: totalProgress } = await supabase.from("video_progress").select("*", { count: "exact", head: true });

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const recentUsers = users?.filter(u => u.created_at && u.created_at > thirtyDaysAgo).length || 0;

      return new Response(JSON.stringify({
        stats: { totalUsers, activeUsers, recentUsers, totalVideos: totalVideos || 0, totalVideoViews: totalProgress || 0 }
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
