"use client";

import { useCallback, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Upload01Icon,
  Delete01Icon,
  Copy01Icon,
  GridIcon,
  EaseCurveControlPointsIcon,
  GridViewIcon,
  RefreshIcon,
  FullScreenIcon,
  FloppyDiskIcon,
} from "@hugeicons/core-free-icons";
import { AuthButton } from "./AuthButton";

interface ToolbarProps {
  onAddSurface: () => void;
  onDeleteSurface: () => void;
  onDuplicateSurface: () => void;
  onImageUpload: (image: HTMLImageElement) => void;
  onToggleHandles: () => void;
  onToggleWireframe: () => void;
  onToggleBezier: () => void;
  onSegmentsChange: (segments: number) => void;
  onSave: () => Promise<boolean>;
  onReset: () => void;
  onFullscreen: () => void;
  isLoggedIn: boolean;
  surfaceCount: number;
  hasSelection: boolean;
  handlesVisible: boolean;
  wireframe: boolean;
  bezierEnabled: boolean;
  selectedSegments: number;
}

export function Toolbar({
  onAddSurface,
  onDeleteSurface,
  onDuplicateSurface,
  onImageUpload,
  onToggleHandles,
  onToggleWireframe,
  onToggleBezier,
  onSegmentsChange,
  onSave,
  onReset,
  onFullscreen,
  isLoggedIn,
  surfaceCount,
  hasSelection,
  handlesVisible,
  wireframe,
  bezierEnabled,
  selectedSegments,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    const ok = await onSave();
    setSaveStatus(ok ? "saved" : "error");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [onSave]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const img = new Image();
      img.onload = () => onImageUpload(img);
      img.src = URL.createObjectURL(file);

      e.target.value = "";
    },
    [onImageUpload]
  );

  return (
    <div
      className="toolbar"
      role="toolbar"
      aria-label="Projection mapping controls"
    >
      <button
        className="toolbar-btn toolbar-btn-primary"
        onClick={onAddSurface}
        aria-label="Add a new surface"
        title="Add a new quad surface"
      >
        <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} />
        Surface
      </button>

      <div className="toolbar-divider" aria-hidden="true" />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Upload image texture"
        id="texture-upload"
      />
      <button
        className="toolbar-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={!hasSelection}
        aria-label="Upload image to selected surface"
        title={
          hasSelection
            ? "Upload image to selected surface"
            : "Select a surface first"
        }
      >
        <HugeiconsIcon icon={Upload01Icon} size={16} strokeWidth={1.5} />
        Upload
      </button>

      <button
        className="toolbar-btn"
        onClick={onDeleteSurface}
        disabled={!hasSelection}
        aria-label="Delete selected surface"
        title={hasSelection ? "Delete selected surface" : "Select a surface first"}
      >
        <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={1.5} />
        Delete
      </button>

      <button
        className="toolbar-btn"
        onClick={onDuplicateSurface}
        disabled={!hasSelection}
        aria-label="Duplicate selected surface"
        title={hasSelection ? "Duplicate selected surface" : "Select a surface first"}
      >
        <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={1.5} />
        Duplicate
      </button>

      <div className="toolbar-divider" aria-hidden="true" />

      <div className="toolbar-segment-group">
        <span className="toolbar-label">Segments</span>
        <input
          type="range"
          className="toolbar-slider"
          min={4}
          max={64}
          step={1}
          value={selectedSegments}
          onChange={(e) => onSegmentsChange(Number(e.target.value))}
          disabled={!hasSelection}
          aria-label="Surface segment count"
          title={hasSelection ? `Segments: ${selectedSegments}` : "Select a surface first"}
        />
        <span className="toolbar-value">{selectedSegments}</span>
      </div>

      <div className="toolbar-divider" aria-hidden="true" />

      <button
        className={`toolbar-btn ${handlesVisible ? "toolbar-btn-active" : ""}`}
        onClick={onToggleHandles}
        aria-label={handlesVisible ? "Hide handles" : "Show handles"}
        aria-pressed={handlesVisible}
        title={handlesVisible ? "Hide corner handles" : "Show corner handles"}
      >
        <HugeiconsIcon icon={GridIcon} size={16} strokeWidth={1.5} />
        Handles
      </button>

      <button
        className={`toolbar-btn ${bezierEnabled ? "toolbar-btn-active" : ""}`}
        onClick={onToggleBezier}
        disabled={!hasSelection}
        aria-label={bezierEnabled ? "Disable bezier edges" : "Enable bezier edges"}
        aria-pressed={bezierEnabled}
        title={
          hasSelection
            ? bezierEnabled
              ? "Disable bezier curved edges"
              : "Enable bezier curved edges"
            : "Select a surface first"
        }
      >
        <HugeiconsIcon icon={EaseCurveControlPointsIcon} size={16} strokeWidth={1.5} />
        Bezier
      </button>

      <button
        className={`toolbar-btn ${wireframe ? "toolbar-btn-active" : ""}`}
        onClick={onToggleWireframe}
        aria-label={wireframe ? "Hide wireframe" : "Show wireframe"}
        aria-pressed={wireframe}
        title={wireframe ? "Hide wireframe overlay" : "Show wireframe overlay"}
      >
        <HugeiconsIcon icon={GridViewIcon} size={16} strokeWidth={1.5} />
        Wire
      </button>

      <div className="toolbar-divider" aria-hidden="true" />

      <button
        className="toolbar-btn"
        onClick={onReset}
        disabled={surfaceCount === 0}
        aria-label="Reset all surfaces"
        title="Remove all surfaces"
      >
        <HugeiconsIcon icon={RefreshIcon} size={16} strokeWidth={1.5} />
        Reset
      </button>

      <button
        className="toolbar-btn"
        onClick={onFullscreen}
        aria-label="Toggle fullscreen"
        title="Toggle fullscreen for projection"
      >
        <HugeiconsIcon icon={FullScreenIcon} size={16} strokeWidth={1.5} />
        Fullscreen
      </button>

      {isLoggedIn && (
        <>
          <div className="toolbar-divider" aria-hidden="true" />

          <button
            className={`toolbar-btn ${saveStatus === "saved" ? "toolbar-btn-success" : saveStatus === "error" ? "toolbar-btn-error" : ""}`}
            onClick={handleSave}
            disabled={surfaceCount === 0 || saveStatus === "saving"}
            aria-label="Save project"
            title="Save current configuration"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} size={16} strokeWidth={1.5} />
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Failed" : "Save"}
          </button>
        </>
      )}

      <div className="toolbar-divider" aria-hidden="true" />

      <AuthButton />
    </div>
  );
}
