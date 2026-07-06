import { withAuth } from "@workos-inc/authkit-nextjs";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { UsageCard } from "@/components/usage-card";
import { getSubscription } from "@/lib/account";

/**
 * Shared application shell: the collapsible sidebar plus the inset content
 * area with a sticky header. Used by every signed-in surface (dashboard,
 * account, …) so they share one layout instead of duplicating it. Signed-out
 * visitors are sent to sign-in (the route handler owns the PKCE cookie).
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = await withAuth();
  if (!user) redirect("/api/auth/signin");

  const subscription = await getSubscription(user.id);

  return (
    <SidebarProvider>
      <AppSidebar
        footer={subscription ? <UsageCard usage={subscription} /> : null}
      />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 min-w-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
