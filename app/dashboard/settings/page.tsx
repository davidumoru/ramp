"use client";

import { useState, useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon } from "@hugeicons/core-free-icons";

export default function Settings() {
  const { data: session } = authClient.useSession();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [googleImage, setGoogleImage] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/avatar")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setGoogleImage(data.googleImage || null);
      })
      .catch(() => {});
  }, []);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const handleNameSave = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === session?.user?.name) {
      setEditingName(false);
      return;
    }
    setNameSaving(true);
    setNameError(null);
    const { error } = await authClient.updateUser({ name: trimmed });
    setNameSaving(false);
    if (error) {
      setNameError(error.message || "Failed to update name");
    } else {
      setEditingName(false);
    }
  };

  const handleAvatarSwitch = async (useGoogle: boolean) => {
    if (!session?.user) return;
    setAvatarSaving(true);
    setAvatarError(null);
    const newImage = useGoogle
      ? googleImage!
      : `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(session.user.email)}`;
    const { error } = await authClient.updateUser({ image: newImage });
    setAvatarSaving(false);
    if (error) {
      setAvatarError(error.message || "Failed to update avatar");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters" });
      return;
    }

    setPasswordSaving(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    });
    setPasswordSaving(false);

    if (error) {
      setPasswordMessage({ type: "error", text: error.message || "Failed to change password" });
    } else {
      setPasswordMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    const { error } = await authClient.deleteUser({ password: deletePassword });
    setDeleting(false);

    if (error) {
      setDeleteError(error.message || "Failed to delete account");
    }
  };

  if (!session?.user) return null;

  const user = session.user;
  const avatarUrl = user.image || `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.email)}`;
  const isUsingDicebear = avatarUrl.includes("api.dicebear.com");
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-y-12">
      <h1 className="text-2xl font-medium text-foreground whitespace-nowrap">Settings</h1>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your profile information</p>
        </div>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border shadow-sm">
          <div className="px-6 py-5">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={user.name}
                className="h-14 w-14 rounded-full border border-border"
              />
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      ref={nameInputRef}
                      type="text"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNameSave();
                        if (e.key === "Escape") setEditingName(false);
                      }}
                      disabled={nameSaving}
                      className="max-w-xs"
                    />
                    <Button onClick={handleNameSave} disabled={nameSaving} size="sm">
                      {nameSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={() => setEditingName(false)} disabled={nameSaving} variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-foreground">{user.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => {
                        setNameDraft(user.name);
                        setEditingName(true);
                        setNameError(null);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                      title="Edit name"
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={14} strokeWidth={1.5} />
                    </Button>
                  </div>
                )}
                {nameError && <p className="mt-1 text-sm text-destructive">{nameError}</p>}
                <p className="mt-0.5 text-sm text-muted-foreground">Joined {joinDate}</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <Label className="text-muted-foreground mb-1 block">Email</Label>
            <p className="text-sm text-foreground font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      {googleImage && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">Avatar</h2>
            <p className="text-sm text-muted-foreground">Switch between Google and generated avatar</p>
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="px-6 py-5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleAvatarSwitch(false)}
                  disabled={avatarSaving}
                  className={cn(
                    "flex w-24 flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                    isUsingDicebear
                      ? "border-primary bg-primary/5"
                      : "border-border bg-transparent hover:border-border/80"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.email)}`}
                    alt="Dicebear"
                    className="h-10 w-10 rounded-full"
                  />
                  <span className={cn("text-[11px] font-bold uppercase tracking-wider", isUsingDicebear ? "text-primary" : "text-muted-foreground")}>Generated</span>
                </button>
                <button
                  onClick={() => handleAvatarSwitch(true)}
                  disabled={avatarSaving}
                  className={cn(
                    "flex w-24 flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                    !isUsingDicebear
                      ? "border-primary bg-primary/5"
                      : "border-border bg-transparent hover:border-border/80"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={googleImage}
                    alt="Google"
                    className="h-10 w-10 rounded-full"
                  />
                  <span className={cn("text-[11px] font-bold uppercase tracking-wider", !isUsingDicebear ? "text-primary" : "text-muted-foreground")}>Google</span>
                </button>
                {avatarSaving && <span className="text-sm text-muted-foreground animate-pulse">Saving...</span>}
              </div>
              {avatarError && <p className="mt-2 text-sm text-destructive">{avatarError}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Security</h2>
          <p className="text-sm text-muted-foreground">Manage your password</p>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 max-w-sm">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {passwordMessage && (
                <p className={cn("text-sm", passwordMessage.type === "success" ? "text-green-500" : "text-destructive")}>
                  {passwordMessage.text}
                </p>
              )}
              <div className="pt-2">
                <Button type="submit" disabled={passwordSaving}>
                  {passwordSaving ? "Changing..." : "Change password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-8">
        <div>
          <h2 className="text-lg font-medium text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">Irreversible actions</p>
        </div>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5">
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <div className="mt-4">
                <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive">
                  Delete account
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4 max-w-sm">
                <p className="text-sm font-medium text-destructive">Enter your password to confirm deletion:</p>
                <Input
                  type="password"
                  placeholder="Password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="border-destructive/30 focus-visible:ring-destructive/20"
                />
                {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                <div className="flex gap-2">
                  <Button onClick={handleDeleteAccount} disabled={deleting || !deletePassword} variant="destructive">
                    {deleting ? "Deleting..." : "Confirm delete"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword("");
                      setDeleteError(null);
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
