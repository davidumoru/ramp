"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { User02Icon } from "@hugeicons/core-free-icons";

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="toolbar-btn"
        style={{ textDecoration: "none" }}
      >
        <HugeiconsIcon icon={User02Icon} size={16} strokeWidth={1.5} />
        Sign in
      </Link>
    );
  }

  return (
    <Link href="/dashboard" className="flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={session.user.image || `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(session.user.email)}`}
        alt={session.user.name}
        width={32}
        height={32}
        className="rounded-full border border-white/15 transition-opacity hover:opacity-80"
      />
    </Link>
  );
}
