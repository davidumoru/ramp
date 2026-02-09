"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalProjects: number;
  totalSurfaces: number;
  storageEstimate: number;
}

interface ActivityEvent {
  id: string;
  action: string;
  projectId: string | null;
  projectName: string;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const actionLabels: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  duplicated: "Duplicated",
  imported: "Imported",
};

const actionColors: Record<string, string> = {
  created: "bg-green-950 text-green-400",
  updated: "bg-blue-950 text-blue-400",
  deleted: "bg-red-950 text-red-400",
  duplicated: "bg-purple-950 text-purple-400",
  imported: "bg-amber-950 text-amber-400",
};

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/overview").then((r) => r.json()),
      fetch("/api/activity?limit=20").then((r) => r.json()),
    ])
      .then(([statsData, activityData]) => {
        setStats(statsData);
        setActivity(activityData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
        <span className="text-sm text-muted-foreground">Loading overview...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-12">
      <h1 className="text-2xl font-medium text-foreground whitespace-nowrap">Overview</h1>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Stats</h2>
          <p className="text-sm text-muted-foreground">Your workspace at a glance</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
            <p className="mt-2 text-4xl font-light text-foreground">
              {stats?.totalProjects ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Surfaces</p>
            <p className="mt-2 text-4xl font-light text-foreground">
              {stats?.totalSurfaces ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
            <p className="mt-2 text-4xl font-light text-foreground">
              {formatBytes(stats?.storageEstimate ?? 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">Your latest actions</p>
        </div>

        {activity.length === 0 ? (
          <div className="rounded-2xl border border-border p-24 text-center">
            <p className="text-lg font-medium text-muted-foreground">No activity yet</p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Activity will appear here as you create and modify projects.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card divide-y divide-border shadow-sm">
            {activity.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 px-6 py-3.5"
              >
                <span
                  className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                    actionColors[event.action] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {actionLabels[event.action] ?? event.action}
                </span>
                <span className="flex-1 truncate text-sm text-foreground">
                  {event.projectName}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(event.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
