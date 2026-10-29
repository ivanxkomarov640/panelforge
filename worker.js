/**
 * Cloudflare Worker starter for PanelForge.
 * This intentionally provides health/status only. Add your own authenticated,
 * allow-listed actions before using it for anything beyond status checks.
 *
 * Required environment variables if you later add authentication:
 *   PANEL_USERNAME, PANEL_PASSWORD_HASH or a proper identity provider.
 *
 * Never expose API tokens or passwords in CodePen/client-side JavaScript.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json; charset=utf-8",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method === "GET" && url.pathname === "/") {
      return json({
        ok: true,
        service: "PanelForge Worker",
        status: "online",
        version: "1.0.0",
      });
    }
    if (request.method === "GET" && url.pathname === "/session") {
      return json({ ok: true, authenticated: false, message: "Session route is a placeholder." });
    }
    if (url.pathname === "/login" || url.pathname === "/command" || url.pathname === "/logout") {
      return json({
        ok: false,
        error: "This endpoint is not configured in the starter Worker. Implement authentication and an explicit allowlist first.",
      }, 501);
    }
    return json({ ok: false, error: "Not found" }, 404);
  },
};