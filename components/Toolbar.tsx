"use client";

import { useCallback, useRef } from "react";

interface ToolbarProps {
  onAddSurface: () => void;
  onDeleteSurface: () => void;
  onImageUpload: (image: HTMLImageElement) => void;
  onToggleHandles: () => void;
  onToggleWireframe: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  surfaceCount: number;
  hasSelection: boolean;
  handlesVisible: boolean;
  wireframe: boolean;
}

export function Toolbar({
  onAddSurface,
  onDeleteSurface,
  onImageUpload,
  onToggleHandles,
  onToggleWireframe,
  onReset,
  onFullscreen,
  surfaceCount,
  hasSelection,
  handlesVisible,
  wireframe,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 3v10M3 8h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
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
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 1v10M4 5l4-4 4 4M2 12v2h12v-2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Upload
      </button>

      <button
        className="toolbar-btn"
        onClick={onDeleteSurface}
        disabled={!hasSelection}
        aria-label="Delete selected surface"
        title={hasSelection ? "Delete selected surface" : "Select a surface first"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 4h10M6 4V3h4v1M5 4v9h6V4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Delete
      </button>

      <div className="toolbar-divider" aria-hidden="true" />

      <button
        className={`toolbar-btn ${handlesVisible ? "toolbar-btn-active" : ""}`}
        onClick={onToggleHandles}
        aria-label={handlesVisible ? "Hide handles" : "Show handles"}
        aria-pressed={handlesVisible}
        title={handlesVisible ? "Hide corner handles" : "Show corner handles"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="4"
            height="4"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="10"
            y="2"
            width="4"
            height="4"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="2"
            y="10"
            width="4"
            height="4"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="10"
            y="10"
            width="4"
            height="4"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        Handles
      </button>

      <button
        className={`toolbar-btn ${wireframe ? "toolbar-btn-active" : ""}`}
        onClick={onToggleWireframe}
        aria-label={wireframe ? "Hide wireframe" : "Show wireframe"}
        aria-pressed={wireframe}
        title={wireframe ? "Hide wireframe overlay" : "Show wireframe overlay"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="12"
            height="12"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M2 8h12M8 2v12M2 5h12M2 11h12M5 2v12M11 2v12"
            stroke="currentColor"
            strokeWidth="0.75"
            opacity="0.6"
          />
        </svg>
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
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 8a6 6 0 0 1 10.3-4.2M14 8a6 6 0 0 1-10.3 4.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 1v3.5h-3.5M4 15v-3.5h3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Reset
      </button>

      <button
        className="toolbar-btn"
        onClick={onFullscreen}
        aria-label="Toggle fullscreen"
        title="Toggle fullscreen for projection"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Fullscreen
      </button>
    </div>
  );
}
