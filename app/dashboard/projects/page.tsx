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
  Folder01Icon,
  FolderAddIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  thumbnail?: string | null;
  folderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Folder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

function ProjectCard({
  project,
  folders,
  onRename,
  onDelete,
  onDuplicate,
  onExport,
  onMoveToFolder,
}: {
  project: Project;
  folders: Folder[];
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onExport: (id: string) => Promise<void>;
  onMoveToFolder: (projectId: string, folderId: string | null) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!showFolderMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (folderMenuRef.current && !folderMenuRef.current.contains(e.target as Node)) {
        setShowFolderMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showFolderMenu]);

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
    <div className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-border/80 shadow-sm">
      {project.thumbnail && (
        <div className="border-b border-border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full object-cover aspect-video"
            style={{ maxHeight: "160px" }}
          />
        </div>
      )}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={saving}
                className="h-8 flex-1"
              />
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handleSave}
                disabled={saving}
                className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
              >
                <HugeiconsIcon icon={Tick01Icon} size={16} strokeWidth={1.5} />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handleCancel}
                disabled={saving}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.5} />
              </Button>
            </>
          ) : (
            <>
              <h3 className="flex-1 truncate text-sm font-medium text-foreground">{project.name}</h3>
              <Button size="icon-xs" variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                <Link href={`/?project=${project.id}`}>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
                </Link>
              </Button>
            </>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {new Date(project.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        {!editing && (
          <div className="mt-3 flex items-center gap-0.5 border-t border-border pt-3">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => setEditing(true)}
              className="text-muted-foreground hover:text-foreground"
              title="Rename project"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={15} strokeWidth={1.5} />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={async () => {
                setDuplicating(true);
                await onDuplicate(project.id);
                setDuplicating(false);
              }}
              disabled={duplicating}
              className="text-muted-foreground hover:text-foreground"
              title="Duplicate project"
            >
              <HugeiconsIcon icon={Copy01Icon} size={15} strokeWidth={1.5} />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={async () => {
                setExporting(true);
                await onExport(project.id);
                setExporting(false);
              }}
              disabled={exporting}
              className="text-muted-foreground hover:text-foreground"
              title="Export project"
            >
              <HugeiconsIcon icon={Download01Icon} size={15} strokeWidth={1.5} />
            </Button>
            <div className="relative" ref={folderMenuRef}>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => setShowFolderMenu(!showFolderMenu)}
                className={cn("text-muted-foreground hover:text-foreground", showFolderMenu && "bg-muted text-foreground")}
                title="Move to folder"
              >
                <HugeiconsIcon icon={Folder01Icon} size={15} strokeWidth={1.5} />
              </Button>
              {showFolderMenu && (
                <div className="absolute bottom-full left-0 z-10 mb-1 w-44 rounded-xl border border-border bg-card py-1 shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      onMoveToFolder(project.id, null);
                      setShowFolderMenu(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-muted",
                      !project.folderId ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    No folder
                  </button>
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onMoveToFolder(project.id, f.id);
                        setShowFolderMenu(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-muted",
                        project.folderId === f.id ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={async () => {
                if (confirm("Delete this project?")) {
                  await onDelete(project.id);
                }
              }}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-auto"
              title="Delete project"
            >
              <HugeiconsIcon icon={Delete01Icon} size={15} strokeWidth={1.5} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

type FilterMode = "all" | "unfiled" | string;

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderDraft, setFolderDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(async (res) => {
        if (!res.ok) throw new Error("Failed to load projects");
        return res.json();
      }),
      fetch("/api/folders").then(async (res) => {
        if (!res.ok) return [];
        return res.json();
      }),
    ])
      .then(([projectsData, foldersData]) => {
        setProjects(projectsData);
        setFolders(foldersData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editingFolderId) folderInputRef.current?.focus();
  }, [editingFolderId]);

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
          action: "duplicated",
        }),
      });
      if (!res.ok) return;
      const { id: newId } = await res.json();
      setProjects((prev) => [
        {
          id: newId,
          name: `${original.name} (copy)`,
          thumbnail: original.thumbnail || null,
          folderId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
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

      const name = parsed.name ? `${parsed.name} (imported)` : "Imported Project";
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, data: parsed.data, action: "imported" }),
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
          folderId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      setImportError("Failed to parse project file. Ensure it is valid JSON.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const handleMoveToFolder = useCallback(
    async (projectId: string, folderId: string | null): Promise<void> => {
      try {
        const res = await fetch("/api/projects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: projectId, folderId }),
        });
        if (res.ok) {
          setProjects((prev) =>
            prev.map((p) => (p.id === projectId ? { ...p, folderId } : p))
          );
        }
      } catch {
        }
    },
    []
  );

  const handleCreateFolder = useCallback(async () => {
    const name = "New Folder";
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setFolders((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      setEditingFolderId(data.id);
      setFolderDraft(data.name);
    } catch {
    }
  }, []);

  const handleRenameFolder = useCallback(
    async (id: string, name: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/folders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, name }),
        });
        if (!res.ok) return false;
        setFolders((prev) =>
          prev.map((f) => (f.id === id ? { ...f, name } : f))
        );
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const handleDeleteFolder = useCallback(async (id: string): Promise<void> => {
    try {
      const res = await fetch("/api/folders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setFolders((prev) => prev.filter((f) => f.id !== id));
        setProjects((prev) =>
          prev.map((p) => (p.folderId === id ? { ...p, folderId: null } : p))
        );
        if (filter === id) setFilter("all");
      }
    } catch {
    }
  }, [filter]);

  const toggleFolderCollapse = (folderId: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const filteredProjects =
    filter === "all"
      ? projects
      : filter === "unfiled"
      ? projects.filter((p) => !p.folderId)
      : projects.filter((p) => p.folderId === filter);

  const unfiledProjects = projects.filter((p) => !p.folderId);
  const projectsByFolder = folders.map((f) => ({
    folder: f,
    projects: projects.filter((p) => p.folderId === f.id),
  }));

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
        <span className="text-sm text-muted-foreground">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-5 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground whitespace-nowrap">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} saved project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCreateFolder} className="gap-2">
            <HugeiconsIcon icon={FolderAddIcon} size={16} strokeWidth={1.5} />
            New Folder
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="gap-2"
          >
            <HugeiconsIcon icon={Upload01Icon} size={16} strokeWidth={1.5} />
            {importing ? "Importing..." : "Import"}
          </Button>
        </div>
      </div>

      {folders.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="xs"
            variant={filter === "all" ? "secondary" : "ghost"}
            onClick={() => setFilter("all")}
            className="rounded-full px-3"
          >
            All
          </Button>
          <Button
            size="xs"
            variant={filter === "unfiled" ? "secondary" : "ghost"}
            onClick={() => setFilter("unfiled")}
            className="rounded-full px-3"
          >
            Unfiled
          </Button>
          {folders.map((f) => (
            <Button
              key={f.id}
              size="xs"
              variant={filter === f.id ? "secondary" : "ghost"}
              onClick={() => setFilter(f.id)}
              className="rounded-full px-3"
            >
              {f.name}
            </Button>
          ))}
        </div>
      )}

      {importError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-5 shadow-sm">
          <p className="text-sm text-destructive">{importError}</p>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-border p-24 text-center bg-muted/10 shadow-sm">
          <p className="text-lg font-medium text-muted-foreground">No saved projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Add surfaces in the editor and click Save to create your first project.
          </p>
        </div>
      ) : filter !== "all" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              folders={folders}
              onRename={handleRename}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onExport={handleExport}
              onMoveToFolder={handleMoveToFolder}
            />
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full rounded-2xl border border-border p-16 text-center bg-muted/10">
              <p className="text-sm text-muted-foreground">No projects in this view.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {projectsByFolder.map(({ folder: f, projects: folderProjects }) => (
            <div key={f.id}>
              <div className="mb-4 flex items-center gap-2">
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => toggleFolderCollapse(f.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon
                    icon={collapsedFolders.has(f.id) ? ArrowRight01Icon : ArrowDown01Icon}
                    size={14}
                    strokeWidth={1.5}
                  />
                </Button>
                <HugeiconsIcon
                  icon={Folder01Icon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-primary"
                />
                {editingFolderId === f.id ? (
                  <Input
                    ref={folderInputRef}
                    type="text"
                    value={folderDraft}
                    onChange={(e) => setFolderDraft(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        const trimmed = folderDraft.trim();
                        if (trimmed && trimmed !== f.name) {
                          await handleRenameFolder(f.id, trimmed);
                        }
                        setEditingFolderId(null);
                      }
                      if (e.key === "Escape") setEditingFolderId(null);
                    }}
                    onBlur={async () => {
                      const trimmed = folderDraft.trim();
                      if (trimmed && trimmed !== f.name) {
                        await handleRenameFolder(f.id, trimmed);
                      }
                      setEditingFolderId(null);
                    }}
                    className="h-8 max-w-[200px]"
                  />
                ) : (
                  <span
                    className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onDoubleClick={() => {
                      setEditingFolderId(f.id);
                      setFolderDraft(f.name);
                    }}
                  >
                    {f.name}
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-mono">
                  ({folderProjects.length})
                </span>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => {
                    setEditingFolderId(f.id);
                    setFolderDraft(f.name);
                  }}
                  className="text-muted-foreground hover:text-foreground ml-1"
                  title="Rename folder"
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} size={13} strokeWidth={1.5} />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={async () => {
                    if (confirm("Delete this folder? Projects will become unfiled.")) {
                      await handleDeleteFolder(f.id);
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Delete folder"
                >
                  <HugeiconsIcon icon={Delete01Icon} size={13} strokeWidth={1.5} />
                </Button>
              </div>
              {!collapsedFolders.has(f.id) && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ml-10">
                  {folderProjects.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 col-span-full py-2 italic">
                      No projects in this folder.
                    </p>
                  ) : (
                    folderProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        folders={folders}
                        onRename={handleRename}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onExport={handleExport}
                        onMoveToFolder={handleMoveToFolder}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

          {unfiledProjects.length > 0 && (
            <div>
              {folders.length > 0 && (
                <div className="mb-4 flex items-center gap-2 ml-10">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Unfiled
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ({unfiledProjects.length})
                  </span>
                </div>
              )}
              <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${folders.length > 0 ? "ml-10" : ""}`}>
                {unfiledProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    folders={folders}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onExport={handleExport}
                    onMoveToFolder={handleMoveToFolder}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
