/**
 * Local single-user stand-in for the WorkOS AuthKit session.
 *
 * The app no longer authenticates: there is exactly one implicit local user
 * and every server call resolves to it. The shape matches what the call sites
 * already read off an AuthKit user (id, email, names, avatar), so the quota,
 * account and social features keep working against a stable owner id.
 */

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
};

export const LOCAL_USER: AuthUser = {
  id: "local-user",
  email: "local@localhost",
  firstName: "Local",
  lastName: "User",
  profilePictureUrl: null,
};

/**
 * Mirrors the old `withAuth()` signature so call sites did not have to change.
 * `ensureSignedIn` is accepted and ignored — the local user is always present,
 * so the signed-out branches below it are simply never taken.
 */
export async function withAuth(_options?: {
  ensureSignedIn?: boolean;
}): Promise<{ user: AuthUser }> {
  return { user: LOCAL_USER };
}
