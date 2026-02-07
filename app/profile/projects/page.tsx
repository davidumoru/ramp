"use client";

import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
          <div
            key={project.id}
            className="rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-5 transition-colors hover:border-neutral-700/60"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-medium text-white">{project.name}</h2>
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
        ))}
      </div>
    </>
  );
}
