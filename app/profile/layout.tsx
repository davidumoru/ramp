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

const navLinks = [
  { label: "Overview", href: "/profile/overview", icon: DashboardSquare01Icon },
  { label: "Projects", href: "/profile/projects", icon: Folder01Icon },
  { label: "Preferences", href: "/profile/preferences", icon: PaintBrush01Icon },
  { label: "Settings", href: "/profile/settings", icon: Settings01Icon },
];

export default function ProfileLayout({
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
      <div className="flex h-screen items-center justify-center bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950">
        <div className="text-center">
          <p className="text-sm text-neutral-500">You&apos;re not signed in.</p>
          <Link
            href="/sign-in"
            className="mt-4 inline-block rounded-md bg-[#e54d2e] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#ec6142]"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const user = session.user;
  const avatarUrl =
    user.image ||
    `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.email)}`;

  return (
    <div className="flex h-screen bg-neutral-950 p-0 md:p-2">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-neutral-800/60 bg-neutral-950">
        {/* Sidebar Header */}
        <div className="px-5 py-5 space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white"
          >
            <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={1.5} />
            ramp
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-700 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Back to editor
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-neutral-800/60 text-white"
                        : "text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-[#e54d2e]" />
                    )}
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

        {/* Sidebar Footer */}
        <div className="border-t border-neutral-800/60 px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={user.name}
              className="h-8 w-8 shrink-0 rounded-full border border-neutral-700"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full rounded-md border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-700 hover:text-[#ff977d]"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-neutral-800/60 bg-neutral-950/90 px-4 py-3 backdrop-blur-sm md:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white"
        >
          <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={1.5} />
          ramp
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-1.5 text-neutral-400 hover:text-white"
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
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-13.25 bottom-0 w-64 border-r border-neutral-800/60 bg-neutral-950 p-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="mb-3 flex items-center gap-2 rounded-md border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-700 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
              </svg>
              Back to editor
            </Link>
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-neutral-800/60 text-white"
                        : "text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-[#e54d2e]" />
                    )}
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
            <div className="mt-6 border-t border-neutral-800/60 pt-4 space-y-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 shrink-0 rounded-full border border-neutral-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full rounded-md border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-700 hover:text-[#ff977d]"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Panel */}
      <main className="flex-1 overflow-y-auto pt-13.25 md:pt-0">
        <div className="rounded-none md:rounded-2xl md:border md:border-neutral-800 md:bg-neutral-900 md:shadow-sm min-h-full">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
