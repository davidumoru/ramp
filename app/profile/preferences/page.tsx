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
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
        <span className="text-sm text-neutral-500">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-white">Editor Preferences</h2>
        <p className="text-sm text-neutral-500">
          Configure default settings for new surfaces and auto-save behavior
        </p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 divide-y divide-neutral-800">
        {/* Default Segments */}
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-white">Default Segments</p>
            <p className="mt-0.5 text-xs text-neutral-500">
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

        {/* Default Wireframe */}
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-white">Default Wireframe</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Show wireframe on new surfaces
            </p>
          </div>
          <ToggleSwitch
            enabled={prefs.defaultWireframe}
            onChange={(v) => setPrefs((p) => ({ ...p, defaultWireframe: v }))}
          />
        </div>

        {/* Default Bezier */}
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-white">Default Bezier</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Enable bezier curves on new surfaces
            </p>
          </div>
          <ToggleSwitch
            enabled={prefs.defaultBezier}
            onChange={(v) => setPrefs((p) => ({ ...p, defaultBezier: v }))}
          />
        </div>

        {/* Auto-Save */}
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-white">Auto-Save</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Automatically save when editing existing projects
            </p>
          </div>
          <ToggleSwitch
            enabled={prefs.autoSave}
            onChange={(v) => setPrefs((p) => ({ ...p, autoSave: v }))}
          />
        </div>

        {/* Auto-Save Interval */}
        {prefs.autoSave && (
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-white">
                Auto-Save Interval
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Seconds between auto-saves (5-300)
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
              className="w-20 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-white outline-none focus:border-neutral-500 text-center"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-[#e54d2e] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#ec6142] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
        {message && (
          <p
            className={`text-xs ${
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
