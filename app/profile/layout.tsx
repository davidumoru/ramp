"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers01Icon } from "@hugeicons/core-free-icons";

const tabs = [
  { label: "Profile", href: "/profile" },
  { label: "Projects", href: "/profile/projects" },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] text-neutral-500">You&apos;re not signed in.</p>
          <Link
            href="/sign-in"
            className="mt-4 inline-block rounded-md bg-[#e54d2e] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#ec6142]"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ overflow: "auto" }}>
      {/* Header */}
      <div className="border-b border-neutral-800/60 px-8 py-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white">
            <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={1.5} />
            ramp
          </Link>
          <Link
            href="/"
            className="rounded-md border border-neutral-800 px-3 py-1.5 text-[13px] text-neutral-400 transition-colors hover:border-neutral-700 hover:text-white"
          >
            Back to editor
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800/60 px-8">
        <div className="mx-auto flex max-w-2xl gap-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative py-3 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-px h-px bg-white" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page content */}
      <div className="mx-auto max-w-2xl px-8 py-12">
        {children}
      </div>
    </div>
  );
}
