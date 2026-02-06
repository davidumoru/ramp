"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers01Icon } from "@hugeicons/core-free-icons";

export default function Profile() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

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

  const user = session.user;
  const avatarUrl = user.image || `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.email)}`;
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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

      {/* Profile content */}
      <div className="mx-auto max-w-2xl px-8 py-12">
        {/* Avatar + name */}
        <div className="flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt={user.name}
            className="h-20 w-20 rounded-full border border-neutral-800"
          />
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-white">{user.name}</h1>
            <p className="mt-0.5 text-[14px] text-neutral-500">Joined {joinDate}</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-10 space-y-4">
          <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-5">
            <h2 className="text-[13px] font-medium text-neutral-400">Email</h2>
            <p className="mt-1 text-[15px] text-white">{user.email}</p>
          </div>

          <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-5">
            <h2 className="text-[13px] font-medium text-neutral-400">Name</h2>
            <p className="mt-1 text-[15px] text-white">{user.name}</p>
          </div>

          <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-5">
            <h2 className="text-[13px] font-medium text-neutral-400">Avatar</h2>
            <div className="mt-3 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt=""
                className="h-12 w-12 rounded-full"
              />
              <span className="truncate rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-[12px] text-neutral-500">
                {avatarUrl}
              </span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="mt-10 rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-5">
          <h2 className="text-[14px] font-medium text-white">Sign out</h2>
          <p className="mt-1 text-[13px] text-neutral-500">
            End your current session on this device.
          </p>
          <button
            onClick={handleSignOut}
            className="mt-4 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-[13px] font-medium text-[#ff977d] transition-colors hover:bg-neutral-700 hover:text-[#fbd3cb]"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
