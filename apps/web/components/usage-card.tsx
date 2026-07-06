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
    <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm group-data-[collapsible=icon]:hidden">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold">Renders</span>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {usage.rendersUsed}
          <span className="mx-0.5 text-muted-foreground/50">/</span>
          {usage.renderQuota}
        </span>
      </div>
      <Progress
        value={percentUsed}
        className="mt-2.5 h-1.5 [&>div]:rounded-full [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-violet-500"
      />
      <p className="mt-2.5 text-[11px] text-muted-foreground">
        <span className="capitalize">{usage.plan}</span> plan
        {usage.plan === "free" ? (
          <>
            {" · "}
            <Link
              href="/account"
              className="font-medium text-primary hover:underline"
            >
              Upgrade
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
