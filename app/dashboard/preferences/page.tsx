"use client";

import { useEffect, useState } from "react";
import { ToggleSwitch } from "@/components/ToggleSwitch";

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
    type: "success" | "error";
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

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
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

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-800 border-t-white" />
        <span className="text-sm text-neutral-500">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-12">
      <h1 className="text-2xl font-medium text-white whitespace-nowrap">Editor Preferences</h1>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-white">Defaults</h2>
          <p className="text-sm text-neutral-500">
            Configure default settings for new surfaces and auto-save behavior
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 divide-y divide-neutral-800">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-medium text-white">Default Segments</p>
              <p className="mt-0.5 text-sm text-neutral-500">
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
              className="w-32 accent-[#e54d2e]"
            />
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-medium text-white">Default Wireframe</p>
              <p className="mt-0.5 text-sm text-neutral-500">
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
              <p className="text-sm font-medium text-white">Default Bezier</p>
              <p className="mt-0.5 text-sm text-neutral-500">
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
              <p className="text-sm font-medium text-white">Auto-Save</p>
              <p className="mt-0.5 text-sm text-neutral-500">
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
                <p className="text-sm font-medium text-white">
                  Auto-Save Interval
                </p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  Seconds between auto-saves (5–300)
                </p>
              </div>
              <input
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
                className="h-9 w-20 rounded-md border border-neutral-700 bg-neutral-800/30 px-3 py-1 text-sm text-white text-center outline-none transition-[color,box-shadow] placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-[3px] focus-visible:ring-neutral-500/20"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-9 items-center rounded-md bg-[#e54d2e] px-4 text-sm font-medium text-white transition-all hover:bg-[#e54d2e]/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
