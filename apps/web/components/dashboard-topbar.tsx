"use client";

import { ArrowRight02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@workspace/ui/components/button";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import Link from "next/link";
import * as React from "react";
import { DocsSearch } from "@/components/docs-search";

export function DashboardTopbar({ label }: { label?: string }) {
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-dashed border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4">
        <SidebarTrigger />
        {label ? (
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:block">
            {label}
          </p>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            className="sm:hidden"
            onClick={() => setSearchOpen(true)}
            aria-label="Search scenes"
          >
            <HugeiconsIcon icon={Search01Icon} size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden w-44 justify-start gap-2 text-muted-foreground sm:flex"
            onClick={() => setSearchOpen(true)}
          >
            <HugeiconsIcon icon={Search01Icon} size={13} />
            <span className="flex-1 text-left text-[13px]">
              Search scenes...
            </span>
            <kbd className="font-mono text-[11px] text-muted-foreground/60">
              ⌘K
            </kbd>
          </Button>
          <Button asChild size="sm">
            <Link href="/studio">
              Open Studio
              <HugeiconsIcon icon={ArrowRight02Icon} data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </header>

      <DocsSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
