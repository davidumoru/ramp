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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  projectName: string | null;
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
  projectName,
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
      className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-xl bg-black/75 backdrop-blur-xl border border-white/10 z-50 select-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 duration-200"
      role="toolbar"
      aria-label="Projection mapping controls"
    >
      {projectName && (
        <>
          <span className="text-sm font-medium text-muted-foreground px-1">{projectName}</span>
          <div className="w-px h-5 bg-white/10 shrink-0" aria-hidden="true" />
        </>
      )}

      <Button
        variant="toolbar"
        className="border-primary/40 text-primary hover:bg-primary/15 hover:text-primary hover:border-primary/50"
        onClick={onAddSurface}
        aria-label="Add a new surface"
        title="Add a new quad surface"
      >
        <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} />
        Surface
      </Button>

      <div className="w-px h-5 bg-white/10 shrink-0" aria-hidden="true" />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Upload image texture"
        id="texture-upload"
      />
      <Button
        variant="toolbar"
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
      </Button>

      <Button
        variant="toolbar"
        onClick={onDeleteSurface}
        disabled={!hasSelection}
        aria-label="Delete selected surface"
        title={hasSelection ? "Delete selected surface" : "Select a surface first"}
      >
        <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={1.5} />
        Delete
      </Button>

      <Button
        variant="toolbar"
        onClick={onDuplicateSurface}
        disabled={!hasSelection}
        aria-label="Duplicate selected surface"
        title={hasSelection ? "Duplicate selected surface" : "Select a surface first"}
      >
        <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={1.5} />
        Duplicate
      </Button>

      <div className="w-px h-5 bg-white/10 shrink-0" aria-hidden="true" />

      <div className="flex items-center gap-1.5">
        <span className="text-white/50 text-xs font-sans pl-1">Segments</span>
        <input
          type="range"
          className="w-20 h-1 accent-primary cursor-pointer appearance-none bg-white/20 rounded-full"
          min={4}
          max={64}
          step={1}
          value={selectedSegments}
          onChange={(e) => onSegmentsChange(Number(e.target.value))}
          disabled={!hasSelection}
          aria-label="Surface segment count"
          title={hasSelection ? `Segments: ${selectedSegments}` : "Select a surface first"}
        />
        <span className="text-white/50 text-xs font-mono min-w-6 text-right">{selectedSegments}</span>
      </div>

      <div className="w-px h-5 bg-white/10 shrink-0" aria-hidden="true" />

      <Button
        variant="toolbar"
        className={cn(handlesVisible && "bg-white/10 text-white border-white/25")}
        onClick={onToggleHandles}
        aria-label={handlesVisible ? "Hide handles" : "Show handles"}
        aria-pressed={handlesVisible}
        title={handlesVisible ? "Hide corner handles" : "Show corner handles"}
      >
        <HugeiconsIcon icon={GridIcon} size={16} strokeWidth={1.5} />
        Handles
      </Button>

      <Button
        variant="toolbar"
        className={cn(bezierEnabled && "bg-white/10 text-white border-white/25")}
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
      </Button>

      <Button
        variant="toolbar"
        className={cn(wireframe && "bg-white/10 text-white border-white/25")}
        onClick={onToggleWireframe}
        aria-label={wireframe ? "Hide wireframe" : "Show wireframe"}
        aria-pressed={wireframe}
        title={wireframe ? "Hide wireframe overlay" : "Show wireframe overlay"}
      >
        <HugeiconsIcon icon={GridViewIcon} size={16} strokeWidth={1.5} />
        Wire
      </Button>

      <div className="w-px h-5 bg-white/10 shrink-0" aria-hidden="true" />

      <Button
        variant="toolbar"
        onClick={onReset}
        disabled={surfaceCount === 0}
        aria-label="Reset all surfaces"
        title="Remove all surfaces"
      >
        <HugeiconsIcon icon={RefreshIcon} size={16} strokeWidth={1.5} />
        Reset
      </Button>

      <Button
        variant="toolbar"
        onClick={onFullscreen}
        aria-label="Toggle fullscreen"
        title="Toggle fullscreen for projection"
      >
        <HugeiconsIcon icon={FullScreenIcon} size={16} strokeWidth={1.5} />
        Fullscreen
      </Button>

      {isLoggedIn && (
        <>
          <div className="w-px h-5 bg-white/10 shrink-0" aria-hidden="true" />

          <Button
            variant="toolbar"
            className={cn(
              saveStatus === "saved" && "text-green-400 border-green-400/40",
              saveStatus === "error" && "text-red-400 border-red-400/40"
            )}
            onClick={handleSave}
            disabled={surfaceCount === 0 || saveStatus === "saving"}
            aria-label="Save project"
            title="Save current configuration"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} size={16} strokeWidth={1.5} />
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Failed" : "Save"}
          </Button>
        </>
      )}

      <div className="w-px h-5 bg-white/10 shrink-0" aria-hidden="true" />

      <AuthButton />
    </div>
  );
}
