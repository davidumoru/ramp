"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, Tick01Icon, Cancel01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

function ProjectRow({
  project,
  onRename,
}: {
  project: Project;
  onRename: (id: string, name: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === project.name) {
      setEditing(false);
      setDraft(project.name);
      return;
    }
    setSaving(true);
    const ok = await onRename(project.id, trimmed);
    setSaving(false);
    if (ok) {
      setEditing(false);
    } else {
      setDraft(project.name);
      setEditing(false);
    }
  }, [draft, project.id, project.name, onRename]);

  const handleCancel = () => {
    setDraft(project.name);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-5 transition-colors hover:border-neutral-700/60">
      <div className="flex items-center gap-3">
        {editing ? (
          <>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={saving}
              className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-[15px] font-medium text-white outline-none focus:border-neutral-500"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-green-400"
              title="Save name"
            >
              <HugeiconsIcon icon={Tick01Icon} size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-red-400"
              title="Cancel"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.5} />
            </button>
          </>
        ) : (
          <>
            <h2 className="flex-1 text-[15px] font-medium text-white">{project.name}</h2>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
              title="Rename project"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={16} strokeWidth={1.5} />
            </button>
            <Link
              href={`/?project=${project.id}`}
              className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-white"
              title="Open in editor"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
            </Link>
          </>
        )}
      </div>
      <p className="mt-1.5 text-[12px] text-neutral-500">
        Created {new Date(project.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load projects");
        return res.json();
      })
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRename = useCallback(async (id: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      if (!res.ok) return false;
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name } : p))
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
        <span className="text-[13px] text-neutral-500">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-5 text-center">
        <p className="text-[13px] text-red-400">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[15px] text-neutral-400">No saved projects yet.</p>
        <p className="mt-1 text-[13px] text-neutral-600">
          Add surfaces in the editor and click Save to create your first project.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight text-white">Projects</h1>
      <p className="mt-1 text-[13px] text-neutral-500">
        {projects.length} saved project{projects.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-8 space-y-3">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} onRename={handleRename} />
        ))}
      </div>
    </>
  );
}
