import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Routes qui exigent une session. Tout le reste (dont /login, /sign-up) reste
 * public — indispensable avec routing Clerk en path sur /login : sinon
 * auth.protect redirige vers /login, qui se retrouverait à nouveau protégé → boucle.
 */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/calculateur(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/login", request.url).toString(),
    });
  }

  return await updateSession(request);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
