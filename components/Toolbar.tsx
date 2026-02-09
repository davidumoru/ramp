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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  
function ToolbarButton({
  children,
  tooltip,
  variant = "toolbar",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button> & { tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} size={size} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={12}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
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
      className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 select-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4 duration-300"
      role="toolbar"
      aria-label="Projection mapping controls"
    >
      {/* Group: Project Info */}
      {projectName && (
        <div className="flex items-center px-3 py-1.5">
          <span className="text-xs font-bold tracking-widest uppercase text-white/40 mr-2">Project</span>
          <span className="text-sm font-semibold text-white/90 truncate max-w-30">{projectName}</span>
        </div>
      )}

      {projectName && <div className="w-px h-6 bg-white/10 mx-1" aria-hidden="true" />}

      {/* Group: Create */}
      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
        <ToolbarButton
          variant="toolbar"
          size="sm"
          className="bg-primary text-white border-none hover:bg-primary/90 hover:text-white"
          onClick={onAddSurface}
          tooltip="Add New Surface [A]"
        >
          <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={2} />
          <span className="hidden sm:inline ml-1">Add Surface</span>
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" aria-hidden="true" />

      {/* Group: Surface Edit (Contextual) */}
      <div className={cn(
        "flex items-center gap-1 transition-opacity duration-200",
        !hasSelection && "opacity-40 pointer-events-none"
      )}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          id="texture-upload"
        />
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          tooltip="Upload Texture [U]"
        >
          <HugeiconsIcon icon={Upload01Icon} size={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={onDuplicateSurface}
          tooltip="Duplicate Surface [D]"
        >
          <HugeiconsIcon icon={Copy01Icon} size={18} />
        </ToolbarButton>

        <ToolbarButton
          className="hover:text-red-400 hover:border-red-400/30"
          onClick={onDeleteSurface}
          tooltip="Delete Surface [Backspace]"
        >
          <HugeiconsIcon icon={Delete01Icon} size={18} />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" aria-hidden="true" />

      {/* Group: Warp Controls */}
      <div className={cn(
        "flex items-center gap-3 px-2 transition-opacity duration-200",
        !hasSelection && "opacity-40 pointer-events-none"
      )}>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase text-white/30 tracking-tighter">Density</span>
            <span className="text-[10px] font-mono text-primary font-bold">{selectedSegments}</span>
          </div>
          <input
            type="range"
            className="w-24 h-1 accent-primary cursor-pointer appearance-none bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            min={4}
            max={64}
            step={1}
            value={selectedSegments}
            onChange={(e) => onSegmentsChange(Number(e.target.value))}
          />
        </div>

        <ToolbarButton
          data-active={bezierEnabled}
          onClick={onToggleBezier}
          tooltip="Toggle Bezier Curves [B]"
        >
          <HugeiconsIcon icon={EaseCurveControlPointsIcon} size={18} />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" aria-hidden="true" />

      {/* Group: View Controls */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          data-active={handlesVisible}
          onClick={onToggleHandles}
          tooltip="Toggle Control Handles [H]"
        >
          <HugeiconsIcon icon={GridIcon} size={18} />
        </ToolbarButton>

        <ToolbarButton
          data-active={wireframe}
          onClick={onToggleWireframe}
          tooltip="Toggle Wireframe Overlay [W]"
        >
          <HugeiconsIcon icon={GridViewIcon} size={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={onFullscreen}
          tooltip="Fullscreen Mode [F]"
        >
          <HugeiconsIcon icon={FullScreenIcon} size={18} />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" aria-hidden="true" />

      {/* Group: System */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          className="hover:text-amber-400"
          onClick={onReset}
          disabled={surfaceCount === 0}
          tooltip="Clear Canvas"
        >
          <HugeiconsIcon icon={RefreshIcon} size={18} />
        </ToolbarButton>

        {isLoggedIn && (
          <ToolbarButton
            size="sm"
            className={cn(
              "min-w-20",
              saveStatus === "saved" && "text-green-400 border-green-400/40 bg-green-400/5",
              saveStatus === "error" && "text-red-400 border-red-400/40 bg-red-400/5"
            )}
            onClick={handleSave}
            disabled={surfaceCount === 0 || saveStatus === "saving"}
            tooltip="Save Project [S]"
          >
            <HugeiconsIcon 
              icon={FloppyDiskIcon} 
              size={18} 
              className={cn(saveStatus === "saving" && "animate-spin")} 
            />
            <span className="hidden lg:inline whitespace-nowrap ml-1">
              {saveStatus === "saving" ? "Saving" : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Error" : "Save"}
            </span>
          </ToolbarButton>
        )}
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" aria-hidden="true" />

      <AuthButton />
    </div>
  );
}
  