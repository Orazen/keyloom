"use client";

import {
  Copy01Icon,
  Delete02Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { useActionState, useState } from "react";
import {
  createKeyAction,
  refreshBillingAction,
  revokeKeyAction,
  upgradeAction,
} from "./actions";

type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
};

type Props = {
  email: string;
  mcpUrl: string;
  subscription: {
    plan: string;
    status: string;
    rendersUsed: number;
    renderQuota: number;
  } | null;
  keys: KeyRow[];
};

function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      <HugeiconsIcon icon={Copy01Icon} size={14} />
      {copied ? "Copied" : label}
    </Button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </h2>
  );
}

export function AccountClient({ email, mcpUrl, subscription, keys }: Props) {
  const [state, formAction, pending] = useActionState(createKeyAction, {});

  const connectorSnippet = JSON.stringify(
    {
      mcpServers: {
        "keyloom-video": {
          url: mcpUrl,
          headers: { Authorization: "Bearer kl_live_…" },
        },
      },
    },
    null,
    2,
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-10 sm:px-6">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          MCP server
        </p>
        <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Your Keyloom MCP
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Render any scene in the library straight from Claude or Cursor. Signed
          in as <span className="text-foreground">{email}</span>.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>Plan</SectionLabel>
          {subscription ? (
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="capitalize">
                {subscription.plan}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {subscription.status}
              </Badge>
            </div>
          ) : null}
        </div>

        {subscription ? (
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <p className="flex items-baseline gap-1.5">
                <span className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
                  {subscription.rendersUsed}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {subscription.renderQuota} renders used
                </span>
              </p>
              <Progress
                className="mt-3"
                value={Math.min(
                  100,
                  (subscription.rendersUsed /
                    Math.max(1, subscription.renderQuota)) *
                    100,
                )}
              />
            </div>
            {subscription.plan === "free" ? (
              <div className="flex flex-wrap items-center gap-2">
                <form action={upgradeAction}>
                  <Button type="submit" size="sm" className="w-full sm:w-auto">
                    Upgrade to Pro
                  </Button>
                </form>
                <form action={refreshBillingAction}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    Already paid? Refresh status
                  </Button>
                </form>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No subscription yet.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <SectionLabel>Connect in Claude / Cursor</SectionLabel>
        <p className="mt-3 text-sm text-muted-foreground">
          Add this remote MCP server, using one of your API keys as the bearer
          token.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="h-8 flex-1 truncate rounded-md border border-border bg-muted px-2.5 leading-8 font-mono text-xs">
            {mcpUrl}
          </code>
          <CopyButton value={mcpUrl} label="Copy URL" />
        </div>
        <div className="relative mt-2">
          <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 pr-24 font-mono text-[11px] leading-relaxed">
            {connectorSnippet}
          </pre>
          <div className="absolute top-2 right-2">
            <CopyButton value={connectorSnippet} label="Copy" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>API keys</SectionLabel>
          <form action={formAction}>
            <Button type="submit" size="sm" disabled={pending}>
              <HugeiconsIcon icon={PlusSignIcon} size={14} />
              {pending ? "Creating…" : "New key"}
            </Button>
          </form>
        </div>

        {state.error ? (
          <p className="mt-3 text-xs text-destructive">{state.error}</p>
        ) : null}

        {state.fullKey ? (
          <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <p className="mb-1 text-xs font-medium">
              Copy this key now — it won't be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded border border-border bg-background px-2 py-1 font-mono text-xs">
                {state.fullKey}
              </code>
              <CopyButton value={state.fullKey} />
            </div>
          </div>
        ) : null}

        {keys.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            No keys yet. Create one to connect.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
              >
                <div className="flex min-w-0 items-baseline gap-2.5">
                  <code className="truncate font-mono text-xs">
                    {k.prefix}…
                  </code>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <form action={revokeKeyAction}>
                  <input type="hidden" name="keyId" value={k.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                    Revoke
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
