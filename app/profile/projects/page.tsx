"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit01Icon,
  Tick01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  Delete01Icon,
  Copy01Icon,
  Download01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  thumbnail?: string | null;
  createdAt: string;
  updatedAt: string;
}

function ProjectRow({
  project,
  onRename,
  onDelete,
  onDuplicate,
  onExport,
}: {
  project: Project;
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onExport: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [exporting, setExporting] = useState(false);
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
      {project.thumbnail && (
        <div className="mb-3 overflow-hidden rounded-md border border-neutral-800/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full object-cover"
            style={{ maxHeight: "160px" }}
          />
        </div>
      )}
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
            <button
              onClick={async () => {
                setDuplicating(true);
                await onDuplicate(project.id);
                setDuplicating(false);
              }}
              disabled={duplicating}
              className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-300 disabled:opacity-50"
              title="Duplicate project"
            >
              <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={async () => {
                setExporting(true);
                await onExport(project.id);
                setExporting(false);
              }}
              disabled={exporting}
              className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-300 disabled:opacity-50"
              title="Export project"
            >
              <HugeiconsIcon icon={Download01Icon} size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={async () => {
                setDeleting(true);
                await onDelete(project.id);
              }}
              disabled={deleting}
              className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-red-400"
              title="Delete project"
            >
              <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={1.5} />
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
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    try {
      const res = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // silently fail
    }
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

  const handleDuplicate = useCallback(async (id: string): Promise<void> => {
    try {
      const fetchRes = await fetch(`/api/projects/${id}`);
      if (!fetchRes.ok) return;
      const original = await fetchRes.json();

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${original.name} (copy)`,
          data: original.data,
          thumbnail: original.thumbnail || null,
        }),
      });
      if (!res.ok) return;
      const { id: newId } = await res.json();
      setProjects((prev) => [
        {
          id: newId,
          name: `${original.name} (copy)`,
          thumbnail: original.thumbnail || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      // silently fail
    }
  }, []);

  const handleExport = useCallback(async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) return;
      const project = await res.json();

      const exportData = {
        name: project.name,
        data: project.data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    }
  }, []);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImporting(true);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.data || !Array.isArray(parsed.data)) {
        setImportError("Invalid project file: missing or invalid 'data' array");
        setImporting(false);
        return;
      }

      // Validate each surface has required fields
      for (const surface of parsed.data) {
        if (!surface.corners || !Array.isArray(surface.corners)) {
          setImportError("Invalid project file: surfaces must have 'corners' array");
          setImporting(false);
          return;
        }
      }

      const name = parsed.name ? `${parsed.name} (imported)` : "Imported Project";
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, data: parsed.data }),
      });

      if (!res.ok) {
        setImportError("Failed to import project");
        setImporting(false);
        return;
      }

      const { id } = await res.json();
      setProjects((prev) => [
        {
          id,
          name,
          thumbnail: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      setImportError("Failed to parse project file. Ensure it is valid JSON.");
    } finally {
      setImporting(false);
      // Reset file input so the same file can be re-imported
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-white">Projects</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            {projects.length} saved project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
          >
            <HugeiconsIcon icon={Upload01Icon} size={16} strokeWidth={1.5} />
            {importing ? "Importing..." : "Import"}
          </button>
        </div>
      </div>

      {importError && (
        <div className="mt-4 rounded-lg border border-red-900/40 bg-red-950/20 p-4">
          <p className="text-[13px] text-red-400">{importError}</p>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[15px] text-neutral-400">No saved projects yet.</p>
          <p className="mt-1 text-[13px] text-neutral-600">
            Add surfaces in the editor and click Save to create your first project.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onRename={handleRename}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onExport={handleExport}
            />
          ))}
        </div>
      )}
    </>
  );
}
