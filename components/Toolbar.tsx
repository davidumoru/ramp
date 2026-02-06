"use client";

import { useCallback, useRef } from "react";

interface ToolbarProps {
  onImageUpload: (image: HTMLImageElement) => void;
  onSegmentsChange: (segments: number) => void;
  onTogglePins: () => void;
  onFullscreen: () => void;
  segments: number;
  pinsVisible: boolean;
}

export function Toolbar({
  onImageUpload,
  onSegmentsChange,
  onTogglePins,
  onFullscreen,
  segments,
  pinsVisible,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const img = new Image();
      img.onload = () => onImageUpload(img);
      img.src = URL.createObjectURL(file);

      // Reset so the same file can be re-selected
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
        className="toolbar-btn"
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
