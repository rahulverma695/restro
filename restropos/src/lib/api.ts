import { auth } from "./auth";

type Session = NonNullable<Awaited<ReturnType<typeof auth>>>;
type AuthenticatedSession = Session & { user: Session["user"] & { restaurantId: string } };

type AuthenticatedHandler = (
  request: Request,
  session: AuthenticatedSession
) => Promise<Response>;

/**
 * Wraps an API route handler with session authentication.
 * Returns 401 if no valid session exists.
 * Passes the verified session (with guaranteed restaurantId) to the handler.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: Request, context?: unknown): Promise<Response> => {
    const session = await auth();
    if (!session?.user?.restaurantId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request, session as AuthenticatedSession);
  };
}
