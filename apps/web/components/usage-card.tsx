import { withAuth } from "@workos-inc/authkit-nextjs";
import { Progress } from "@workspace/ui/components/progress";
import Link from "next/link";
import { getSubscription } from "@/lib/account";

export type RenderUsage = {
  plan: string;
  rendersUsed: number;
  renderQuota: number;
};

/**
 * Async server component meant to be rendered inside <Suspense> so the
 * subscription query streams in without blocking navigation.
 */
export async function SidebarUsage() {
  const { user } = await withAuth();
  if (!user) return null;

  const subscription = await getSubscription(user.id);
  if (!subscription) return null;

  return <UsageCard usage={subscription} />;
}

export function UsageCard({ usage }: { usage: RenderUsage }) {
  const percentUsed =
    usage.renderQuota > 0
      ? Math.min(100, (usage.rendersUsed / usage.renderQuota) * 100)
      : 0;

  return (
    <div className="rounded-lg border border-sidebar-border bg-card p-3 group-data-[collapsible=icon]:hidden">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium">Renders</span>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {usage.rendersUsed} / {usage.renderQuota}
        </span>
      </div>
      <Progress value={percentUsed} className="mt-2 h-1.5" />
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {usage.plan} plan
        </span>
        {usage.plan === "free" ? (
          <Link
            href="/account"
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Upgrade
          </Link>
        ) : null}
      </div>
    </div>
  );
}
