"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (!session?.user) return null;

  const user = session.user;
  const avatarUrl = user.image || `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.email)}`;
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
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
    </>
  );
}
