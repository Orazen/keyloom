"use client";

import {
  ArrowRight01Icon,
  ClosedCaptionIcon,
  Image02Icon,
  LayoutTwoRowIcon,
  LibrariesIcon,
  PencilEdit02Icon,
  VideoReplayIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@workspace/ui/components/button";
import dynamic from "next/dynamic";
import Link from "next/link";
import * as React from "react";
import { listUserComponents, type UserComponent } from "@/lib/user-components";

const ForkPreview = dynamic(
  () =>
    import("@/components/dashboard/fork-preview").then((m) => m.ForkPreview),
  { ssr: false },
);

const QUICK_ACTIONS = [
  {
    label: "Open Studio",
    description: "Compose scenes on the timeline and export a video",
    href: "/studio",
    icon: VideoReplayIcon,
  },
  {
    label: "Caption a Video",
    description: "Whisper transcription with styled, editable captions",
    href: "/captions",
    icon: ClosedCaptionIcon,
  },
  {
    label: "Surf Memes",
    description: "Flip through what's trending and turn it into a post",
    href: "/memes",
    icon: Image02Icon,
  },
  {
    label: "Make a Split Screen",
    description: "Stack your video over a gameplay clip, export 9:16",
    href: "/split",
    icon: LayoutTwoRowIcon,
  },
  {
    label: "Explore Components",
    description: "Fork a composition and make it yours",
    href: "/components",
    icon: LibrariesIcon,
  },
];

function greetingForHour(hour: number) {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeDashboard({ firstName }: { firstName: string | null }) {
  const [greeting, setGreeting] = React.useState("Welcome back");

  React.useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Pick up where you left off, or start something new.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Start creating
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HugeiconsIcon icon={action.icon} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {action.label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {action.description}
                </span>
              </div>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                className="mt-0.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
              />
            </Link>
          ))}
        </div>
      </section>

      <RecentProjects />
    </div>
  );
}

function RecentProjects() {
  const [items, setItems] = React.useState<UserComponent[] | null>(null);

  React.useEffect(() => {
    let active = true;
    listUserComponents().then((rows) => {
      if (active) {
        setItems(
          [...rows]
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            )
            .slice(0, 4),
        );
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (items === null || items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Recent projects
        </h2>
        <Button asChild variant="ghost" size="sm" className="text-xs">
          <Link href="/components/projects">
            View all
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((fork) => (
          <Link
            key={fork.id}
            href={`/component/${encodeURIComponent(fork.id)}/edit`}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
              <ForkPreview fork={fork} />
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {fork.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {new Date(fork.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <HugeiconsIcon
                icon={PencilEdit02Icon}
                size={14}
                className="shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
