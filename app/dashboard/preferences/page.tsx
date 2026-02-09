"use client";

import { useEffect, useState } from "react";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Preferences {
  defaultSegments: number;
  defaultWireframe: boolean;
  defaultBezier: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

const DEFAULTS: Preferences = {
  defaultSegments: 32,
  defaultWireframe: false,
  defaultBezier: false,
  autoSave: false,
  autoSaveInterval: 30,
};

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/preferences")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setPrefs({
          defaultSegments: data.defaultSegments ?? 32,
          defaultWireframe: data.defaultWireframe ?? false,
          defaultBezier: data.defaultBezier ?? false,
          autoSave: data.autoSave ?? false,
          autoSaveInterval: data.autoSaveInterval ?? 30,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (updatedPrefs = prefs) => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPrefs),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Preferences saved" });
      } else {
        setMessage({ type: "error", text: "Failed to save preferences" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save preferences" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setPrefs(DEFAULTS);
    await handleSave(DEFAULTS);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
        <span className="text-sm text-muted-foreground">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-12">
      <h1 className="text-2xl font-medium text-foreground whitespace-nowrap">Editor Preferences</h1>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Defaults</h2>
          <p className="text-sm text-muted-foreground">
            Configure default settings for new surfaces and auto-save behavior
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-medium text-foreground">Default Segments</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Mesh resolution for new surfaces ({prefs.defaultSegments})
              </p>
            </div>
            <input
              type="range"
              min={4}
              max={64}
              step={1}
              value={prefs.defaultSegments}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  defaultSegments: parseInt(e.target.value, 10),
                }))
              }
              className="w-32 accent-primary"
            />
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-medium text-foreground">Default Wireframe</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Show wireframe on new surfaces
              </p>
            </div>
            <ToggleSwitch
              enabled={prefs.defaultWireframe}
              onChange={(v) => setPrefs((p) => ({ ...p, defaultWireframe: v }))}
            />
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-medium text-foreground">Default Bezier</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Enable bezier curves on new surfaces
              </p>
            </div>
            <ToggleSwitch
              enabled={prefs.defaultBezier}
              onChange={(v) => setPrefs((p) => ({ ...p, defaultBezier: v }))}
            />
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-Save</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Automatically save when editing existing projects
              </p>
            </div>
            <ToggleSwitch
              enabled={prefs.autoSave}
              onChange={(v) => setPrefs((p) => ({ ...p, autoSave: v }))}
            />
          </div>

          {prefs.autoSave && (
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Auto-Save Interval
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Seconds between auto-saves (5–300)
                </p>
              </div>
              <Input
                type="number"
                min={5}
                max={300}
                value={prefs.autoSaveInterval}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    autoSaveInterval: Math.min(
                      Math.max(parseInt(e.target.value, 10) || 5, 5),
                      300
                    ),
                  }))
                }
                className="w-20 text-center"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => handleSave()}
          disabled={saving}
          className="min-w-35"
        >
          {saving ? "Saving..." : "Save preferences"}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={saving}
          className="text-muted-foreground hover:text-foreground"
        >
          Reset to defaults
        </Button>
        {message && (
          <p
            className={cn(
              "text-sm",
              message.type === "success" && "text-green-400",
              message.type === "error" && "text-red-400",
              message.type === "info" && "text-primary"
            )}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
