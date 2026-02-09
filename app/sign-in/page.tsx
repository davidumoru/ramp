"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function SignIn() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lastMethod = (authClient as { getLastUsedLoginMethod?: () => string | null }).getLastUsedLoginMethod?.();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
      </div>
    );
  }

  if (session?.user) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message ?? "Sign in failed");
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
      <div className="relative flex w-full flex-col justify-between lg:w-1/2">
        <div className="p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
            <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={1.5} />
            ramp
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-8">
          <div className="w-full max-w-[320px]">
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>

            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-8 w-full relative"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true" className="mr-2">
                <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
                <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"/>
                <path d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" fill="#FBBC05"/>
                <path d="M8.98 3.58c1.16 0 2.2.4 3.02 1.2l2.27-2.27A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.9z" fill="#EA4335"/>
              </svg>
              Continue with Google
              {lastMethod === "google" && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground border-primary shadow-sm px-1.5 py-0.5">Last used</Badge>
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full relative"
              >
                {loading ? "Signing in..." : "Sign in"}
                {lastMethod === "email" && (
                  <Badge className="absolute -top-2 -right-2 bg-foreground text-background border-foreground shadow-sm px-1.5 py-0.5">Last used</Badge>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-foreground underline-offset-4 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="p-8" />
      </div>

      <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:border-l lg:border-border bg-zinc-900/50">
        <div className="max-w-md px-12">
          <div className="mb-2 text-8xl font-serif leading-none text-muted-foreground/20 -ml-4">&ldquo;</div>
          <p className="text-2xl font-medium leading-tight text-foreground tracking-tight">
            Ramp transformed our installation workflow. What used to take hours of calibration now happens in minutes, right in the browser.
          </p>
          <div className="mt-10 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/9.x/glass/svg?seed=marcus"
              alt="Marcus Thorne"
              className="h-11 w-11 rounded-full border border-border bg-background"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">Marcus Thorne</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Creative Director, Neon Studio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
