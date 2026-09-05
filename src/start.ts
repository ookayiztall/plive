import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

// Server-side admin authorization middleware.
// Verifies the user's JWT and checks admin role via has_role() with service role client.
export const requireAdmin = createMiddleware().server(async ({ next }) => {
  const { getSupabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = getSupabaseAdmin();

  const authHeader = (globalThis as Record<string, unknown>)['__requestHeaders']
    ?? new Headers();
  const token = authHeader instanceof Headers
    ? authHeader.get("authorization")?.replace("Bearer ", "")
    : undefined;

  if (!token) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const { data: isAdmin } = await admin.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (!isAdmin) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

  return next({ context: { adminUser: user } });
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
