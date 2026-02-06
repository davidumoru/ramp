"use client";

import { useCallback, useRef } from "react";

interface ToolbarProps {
  onImageUpload: (image: HTMLImageElement) => void;
  onSegmentsChange: (segments: number) => void;
  onTogglePins: () => void;
  onToggleWireframe: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  segments: number;
  pinsVisible: boolean;
  wireframe: boolean;
  hasTexture: boolean;
}

export function Toolbar({
  onImageUpload,
  onSegmentsChange,
  onTogglePins,
  onToggleWireframe,
  onReset,
  onFullscreen,
  segments,
  pinsVisible,
  wireframe,
  hasTexture,
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
        aria-label="Upload image"
        title="Upload image texture"
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

      <div className="toolbar-divider" aria-hidden="true" />

      <label className="toolbar-label" htmlFor="grid-density">
        Grid
      </label>
      <input
        id="grid-density"
        type="range"
        min={4}
        max={64}
        step={1}
        value={segments}
        onChange={(e) => onSegmentsChange(Number(e.target.value))}
        className="toolbar-slider"
        aria-label={`Grid density: ${segments} segments`}
        title={`${segments} segments`}
      />
      <span className="toolbar-value" aria-hidden="true">
        {segments}
      </span>

      <div className="toolbar-divider" aria-hidden="true" />

      <button
        className={`toolbar-btn ${wireframe ? "toolbar-btn-active" : ""}`}
        onClick={onToggleWireframe}
        aria-label={wireframe ? "Show texture" : "Show wireframe"}
        aria-pressed={wireframe}
        title={
          hasTexture
            ? wireframe
              ? "Switch to texture view"
              : "Switch to wireframe view"
            : "Wireframe (upload an image first)"
        }
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

      <button
        className={`toolbar-btn ${pinsVisible ? "toolbar-btn-active" : ""}`}
        onClick={onTogglePins}
        aria-label={pinsVisible ? "Hide pins" : "Show pins"}
        aria-pressed={pinsVisible}
        title={pinsVisible ? "Hide pins" : "Show pins"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="6"
            r="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 9v5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Pins
      </button>

      <div className="toolbar-divider" aria-hidden="true" />

      <button
        className="toolbar-btn"
        onClick={onReset}
        aria-label="Reset all pins and warping"
        title="Remove all pins and reset mesh"
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
