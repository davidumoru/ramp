"use client";

import { useState, useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Avatar (Google users only)
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

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

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
    } else {
      router.push("/");
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
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave();
                  if (e.key === "Escape") setEditingName(false);
                }}
                disabled={nameSaving}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-[18px] font-semibold text-white outline-none focus:border-neutral-500"
              />
              <button
                onClick={handleNameSave}
                disabled={nameSaving}
                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-white bg-neutral-700 hover:bg-neutral-600 transition-colors"
              >
                {nameSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditingName(false)}
                disabled={nameSaving}
                className="rounded-md px-3 py-1.5 text-[13px] text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-tight text-white">{user.name}</h1>
              <button
                onClick={() => {
                  setNameDraft(user.name);
                  setEditingName(true);
                  setNameError(null);
                }}
                className="rounded-md p-1 text-neutral-600 hover:text-neutral-300 transition-colors"
                title="Edit name"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
            </div>
          )}
          {nameError && <p className="mt-1 text-[13px] text-red-400">{nameError}</p>}
          <p className="mt-0.5 text-[14px] text-neutral-500">Joined {joinDate}</p>
        </div>
      </div>

      {/* Email */}
      <div className="mt-10 space-y-4">
        <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-5">
          <h2 className="text-[13px] font-medium text-neutral-400">Email</h2>
          <p className="mt-1 text-[15px] text-white">{user.email}</p>
        </div>
      </div>

      {/* Avatar — only show toggle for Google users */}
      {googleImage && (
        <div className="mt-6 rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-5">
          <h2 className="text-[13px] font-medium text-neutral-400">Avatar</h2>
          <p className="mt-1 text-[13px] text-neutral-500">
            Switch between your Google profile picture and a generated avatar.
          </p>
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => handleAvatarSwitch(false)}
              disabled={avatarSaving}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors ${
                isUsingDicebear
                  ? "border-neutral-500 bg-neutral-800"
                  : "border-neutral-800/60 hover:border-neutral-700"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.email)}`}
                alt="Dicebear"
                className="h-10 w-10 rounded-full"
              />
              <span className="text-[11px] text-neutral-400">Generated</span>
            </button>
            <button
              onClick={() => handleAvatarSwitch(true)}
              disabled={avatarSaving}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors ${
                !isUsingDicebear
                  ? "border-neutral-500 bg-neutral-800"
                  : "border-neutral-800/60 hover:border-neutral-700"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={googleImage}
                alt="Google"
                className="h-10 w-10 rounded-full"
              />
              <span className="text-[11px] text-neutral-400">Google</span>
            </button>
            {avatarSaving && <span className="text-[12px] text-neutral-500">Saving...</span>}
          </div>
          {avatarError && <p className="mt-2 text-[13px] text-red-400">{avatarError}</p>}
        </div>
      )}

      {/* Change password */}
      <div className="mt-6 rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-5">
        <h2 className="text-[14px] font-medium text-white">Change password</h2>
        <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-[14px] text-white outline-none placeholder:text-neutral-600 focus:border-neutral-500"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-[14px] text-white outline-none placeholder:text-neutral-600 focus:border-neutral-500"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-[14px] text-white outline-none placeholder:text-neutral-600 focus:border-neutral-500"
          />
          {passwordMessage && (
            <p className={`text-[13px] ${passwordMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {passwordMessage.text}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-neutral-700"
          >
            {passwordSaving ? "Changing..." : "Change password"}
          </button>
        </form>
      </div>

      {/* Sign out */}
      <div className="mt-6 rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-5">
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

      {/* Danger zone */}
      <div className="mt-6 rounded-lg border border-red-900/40 bg-red-950/10 p-5">
        <h2 className="text-[14px] font-medium text-red-400">Danger zone</h2>
        <p className="mt-1 text-[13px] text-neutral-500">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-4 rounded-md border border-red-900/60 bg-red-950/30 px-4 py-2 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-950/50"
          >
            Delete account
          </button>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-[13px] text-red-300">Enter your password to confirm deletion:</p>
            <input
              type="password"
              placeholder="Password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full rounded-md border border-red-900/40 bg-neutral-800 px-3 py-2 text-[14px] text-white outline-none placeholder:text-neutral-600 focus:border-red-700"
            />
            {deleteError && <p className="text-[13px] text-red-400">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
                className="rounded-md border border-red-900/60 bg-red-950/30 px-4 py-2 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-900/40 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setDeleteError(null);
                }}
                className="rounded-md px-4 py-2 text-[13px] text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
