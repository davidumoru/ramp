"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers01Icon } from "@hugeicons/core-free-icons";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message ?? "Sign up failed");
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <div className="flex min-h-screen" style={{ overflow: "auto" }}>
      {/* Left — form */}
      <div className="relative flex w-full flex-col justify-between lg:w-1/2">
        <div className="p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white">
            <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={1.5} />
            ramp
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-8">
          <div className="w-full max-w-[320px]">
            <h1 className="text-[22px] font-semibold tracking-tight text-white">Create an account</h1>
            <p className="mt-1 text-[14px] text-neutral-500">Get started with Ramp</p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-md border border-neutral-800 bg-transparent px-4 py-2.5 text-[13px] font-medium text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
                <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"/>
                <path d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" fill="#FBBC05"/>
                <path d="M8.98 3.58c1.16 0 2.2.4 3.02 1.2l2.27-2.27A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.9z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-neutral-950 px-3 text-[12px] text-neutral-600">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-neutral-400">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2.5 text-[13px] text-white placeholder-neutral-600 outline-none transition-colors focus:border-[#ac4d39] focus:ring-1 focus:ring-[#ac4d39]/30"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-neutral-400">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2.5 text-[13px] text-white placeholder-neutral-600 outline-none transition-colors focus:border-[#ac4d39] focus:ring-1 focus:ring-[#ac4d39]/30"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-neutral-400">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2.5 text-[13px] text-white placeholder-neutral-600 outline-none transition-colors focus:border-[#ac4d39] focus:ring-1 focus:ring-[#ac4d39]/30"
                />
              </div>

              {error && (
                <p className="text-[13px] text-[#ff977d]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#e54d2e] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#ec6142] disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-[13px] text-neutral-600">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-white underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="p-8" />
      </div>

      {/* Right — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:border-l lg:border-neutral-800/60 lg:bg-neutral-950/50">
        <div className="max-w-md px-12">
          <div className="mb-8 text-[64px] font-light leading-none text-neutral-800">&ldquo;</div>
          <p className="text-[20px] leading-relaxed text-neutral-300">
            Ramp makes projection mapping intuitive. Map surfaces, upload textures, and warp visuals in real-time — all from your browser.
          </p>
          <div className="mt-8 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/9.x/glass/svg?seed=ramp-team"
              alt=""
              className="h-9 w-9 rounded-full"
            />
            <div>
              <p className="text-[13px] font-medium text-neutral-300">Projection Mapping</p>
              <p className="text-[12px] text-neutral-600">Browser-based tool</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
