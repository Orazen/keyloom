import { handleAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

// WorkOS redirects here after sign-in (NEXT_PUBLIC_WORKOS_REDIRECT_URI).
// Exchanges the code for a session, then lands the user on /account.
export const GET = handleAuth({
  returnPathname: "/account",
  onError: ({ error, request }) => {
    console.error("WorkOS sign-in failed:", error);
    return NextResponse.redirect(new URL("/?error=signin_failed", request.url));
  },
});
