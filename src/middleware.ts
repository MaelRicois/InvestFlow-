import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Routes publiques. Tout le reste est protégé (mais on laisse /login et /sign-up
 * publics pour éviter une boucle de redirection).
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/discover(.*)",
  "/calculateur(.*)",
  "/login(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth().protect({
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
