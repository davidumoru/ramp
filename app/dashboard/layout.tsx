"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Layers01Icon,
  DashboardSquare01Icon,
  Folder01Icon,
  PaintBrush01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Overview", href: "/dashboard/overview", icon: DashboardSquare01Icon },
  { label: "Projects", href: "/dashboard/projects", icon: Folder01Icon },
  { label: "Preferences", href: "/dashboard/preferences", icon: PaintBrush01Icon },
  { label: "Settings", href: "/dashboard/settings", icon: Settings01Icon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">You&apos;re not signed in.</p>
          <Button asChild className="mt-4">
            <Link href="/sign-in">
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const user = session.user;
  const avatarUrl =
    user.image ||
    `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.email)}`;

  return (
    <div className="relative flex h-screen w-full flex-col bg-background md:flex-row md:p-2">
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-background">
        <div className="flex flex-col gap-6 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground"
          >
            <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={1.5} />
            ramp
          </Link>
          <Button variant="outline" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
              </svg>
              Back to editor
            </Link>
          </Button>
        </div>

        <nav className="flex-1 px-2 py-2">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <HugeiconsIcon
                      icon={link.icon}
                      size={18}
                      strokeWidth={1.5}
                    />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={user.name}
              className="h-8 w-8 shrink-0 rounded-full border border-border"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full text-muted-foreground hover:text-destructive hover:border-destructive/30"
          >
            Sign out
          </Button>
        </div>
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur-sm md:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground"
        >
          <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={1.5} />
          ramp
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-muted-foreground hover:text-foreground"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="20" y2="16" />
              </>
            )}
          </svg>
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
                    <div className="absolute inset-0 bg-black/70"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-15 bottom-0 w-64 border-r border-border bg-background p-4">
                      <Button variant="outline" size="sm" asChild className="mb-3 w-full gap-2 text-muted-foreground hover:text-foreground">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                </svg>
                Back to editor
              </Link>
            </Button>
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <HugeiconsIcon
                      icon={link.icon}
                      size={18}
                      strokeWidth={1.5}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 shrink-0 rounded-full border border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full text-muted-foreground hover:text-destructive hover:border-destructive/30"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-0 pt-15 md:pt-0">
        <div className="relative h-full min-w-0 overflow-y-auto rounded-none border-border bg-background px-4 md:rounded-2xl md:border md:bg-card md:px-8 md:shadow-xs">
          <div className="mx-auto flex w-full flex-col gap-8 pt-12 pb-16 max-w-5xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
