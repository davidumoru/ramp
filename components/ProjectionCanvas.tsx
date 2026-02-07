"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SceneManager } from "@/lib/engine/SceneManager";
import { SurfaceManager } from "@/lib/engine/SurfaceManager";
import { Toolbar } from "./Toolbar";
import { authClient } from "@/lib/auth-client";

export function ProjectionCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneManager | null>(null);
  const surfaceManagerRef = useRef<SurfaceManager | null>(null);

  const [surfaceCount, setSurfaceCount] = useState(0);
  const [selectedSurfaceId, setSelectedSurfaceId] = useState<string | null>(null);
  const [handlesVisible, setHandlesVisible] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState(32);
  const [bezierEnabled, setBezierEnabled] = useState(false);
  const { data: session } = authClient.useSession();

  // Initialize Three.js engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    canvas.width = width * Math.min(window.devicePixelRatio, 2);
    canvas.height = height * Math.min(window.devicePixelRatio, 2);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const scene = new SceneManager(canvas);
    const surfaceManager = new SurfaceManager(scene, canvas);

    surfaceManager.setOnSurfaceCountChange((count) => setSurfaceCount(count));
    surfaceManager.setOnSelectionChange((id) => setSelectedSurfaceId(id));
    surfaceManager.setOnSegmentsChange((segments) => setSelectedSegments(segments));
    surfaceManager.setOnBezierChange((enabled) => setBezierEnabled(enabled));

    scene.start();

    sceneRef.current = scene;
    surfaceManagerRef.current = surfaceManager;

    // Resize handler
    const onResize = () => {
      const { width: w, height: h } = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      scene.resize(w * dpr, h * dpr);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      surfaceManager.dispose();
      scene.dispose();
      sceneRef.current = null;
      surfaceManagerRef.current = null;
    };
  }, []);

  const handleAddSurface = useCallback(() => {
    surfaceManagerRef.current?.addSurface();
  }, []);

  const handleDeleteSurface = useCallback(() => {
    surfaceManagerRef.current?.deleteSelected();
  }, []);

  const handleDuplicateSurface = useCallback(() => {
    surfaceManagerRef.current?.duplicateSelected();
  }, []);

  const handleImageUpload = useCallback((image: HTMLImageElement) => {
    surfaceManagerRef.current?.setTextureOnSelected(image);
    setWireframe(false);
  }, []);

  const handleToggleHandles = useCallback(() => {
    setHandlesVisible((prev) => {
      const next = !prev;
      surfaceManagerRef.current?.setHandlesVisibleAll(next);
      return next;
    });
  }, []);

  const handleToggleWireframe = useCallback(() => {
    setWireframe((prev) => {
      const next = !prev;
      surfaceManagerRef.current?.setWireframeAll(next);
      return next;
    });
  }, []);

  const handleSegmentsChange = useCallback((segments: number) => {
    setSelectedSegments(segments);
    surfaceManagerRef.current?.setSegmentsOnSelected(segments);
  }, []);

  const handleToggleBezier = useCallback(() => {
    setBezierEnabled((prev) => {
      const next = !prev;
      surfaceManagerRef.current?.setBezierOnSelected(next);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    surfaceManagerRef.current?.clearAll();
    setWireframe(false);
    setBezierEnabled(false);
  }, []);

  const handleSave = useCallback(async (): Promise<boolean> => {
    const data = surfaceManagerRef.current?.serialize();
    if (!data) return false;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error("Failed to save project:", res.status, err);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Failed to save project:", err);
      return false;
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  return (
    <div ref={containerRef} className="projection-container">
      <canvas ref={canvasRef} className="projection-canvas" />
      <Toolbar
        onAddSurface={handleAddSurface}
        onDeleteSurface={handleDeleteSurface}
        onDuplicateSurface={handleDuplicateSurface}
        onImageUpload={handleImageUpload}
        onToggleHandles={handleToggleHandles}
        onToggleWireframe={handleToggleWireframe}
        onToggleBezier={handleToggleBezier}
        onSegmentsChange={handleSegmentsChange}
        onSave={handleSave}
        onReset={handleReset}
        onFullscreen={handleFullscreen}
        isLoggedIn={!!session?.user}
        surfaceCount={surfaceCount}
        hasSelection={selectedSurfaceId !== null}
        handlesVisible={handlesVisible}
        wireframe={wireframe}
        bezierEnabled={bezierEnabled}
        selectedSegments={selectedSegments}
      />
    </div>
  );
}
