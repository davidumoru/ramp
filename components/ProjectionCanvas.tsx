"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SceneManager } from "@/lib/engine/SceneManager";
import { SurfaceManager } from "@/lib/engine/SurfaceManager";
import { Toolbar } from "./Toolbar";
import { authClient } from "@/lib/auth-client";

interface EditorPrefs {
  defaultSegments: number;
  defaultWireframe: boolean;
  defaultBezier: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

const DEFAULT_PREFS: EditorPrefs = {
  defaultSegments: 32,
  defaultWireframe: false,
  defaultBezier: false,
  autoSave: false,
  autoSaveInterval: 30,
};

export function ProjectionCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneManager | null>(null);
  const surfaceManagerRef = useRef<SurfaceManager | null>(null);
  const prefsRef = useRef<EditorPrefs>(DEFAULT_PREFS);

  const [surfaceCount, setSurfaceCount] = useState(0);
  const [selectedSurfaceId, setSelectedSurfaceId] = useState<string | null>(null);
  const [handlesVisible, setHandlesVisible] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState(32);
  const [bezierEnabled, setBezierEnabled] = useState(false);
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const [projectName, setProjectName] = useState<string | null>(null);
  const projectIdRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    fetch("/api/preferences")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        prefsRef.current = {
          defaultSegments: data.defaultSegments ?? 32,
          defaultWireframe: data.defaultWireframe ?? false,
          defaultBezier: data.defaultBezier ?? false,
          autoSave: data.autoSave ?? false,
          autoSaveInterval: data.autoSaveInterval ?? 30,
        };
        setSelectedSegments(prefsRef.current.defaultSegments);
        setWireframe(prefsRef.current.defaultWireframe);
        setBezierEnabled(prefsRef.current.defaultBezier);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const projectId = searchParams.get("project");
    projectIdRef.current = projectId;
    if (!projectId || !surfaceManagerRef.current) return;

    fetch(`/api/projects/${projectId}`)
      .then(async (res) => {
        if (!res.ok) return;
        const project = await res.json();
        if (project.data && Array.isArray(project.data)) {
          surfaceManagerRef.current?.loadSerialized(project.data);
          setProjectName(project.name);
        }
      })
      .catch((err) => console.error("Failed to load project:", err));
  }, [searchParams]);

  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    const prefs = prefsRef.current;
    const projectId = projectIdRef.current;

    if (!prefs.autoSave || !projectId) return;

    autoSaveTimerRef.current = setInterval(async () => {
      const data = surfaceManagerRef.current?.serialize();
      if (!data || data.length === 0) return;

      try {
        const wereVisible =
          surfaceManagerRef.current !== null;
        surfaceManagerRef.current?.setHandlesVisibleAll(false);
        await new Promise((r) => requestAnimationFrame(r));
        const thumbnail = sceneRef.current?.captureSnapshot() ?? undefined;
        surfaceManagerRef.current?.setHandlesVisibleAll(true);

        await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data, thumbnail }),
        });
      } catch {
        }
    }, prefs.autoSaveInterval * 1000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [searchParams]);

  const handleAddSurface = useCallback(() => {
    surfaceManagerRef.current?.addSurface({
      segments: prefsRef.current.defaultSegments,
      wireframe: prefsRef.current.defaultWireframe,
      bezier: prefsRef.current.defaultBezier,
    });
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
      // Hide handles for clean snapshot
      const wereVisible = handlesVisible;
      if (wereVisible) {
        surfaceManagerRef.current?.setHandlesVisibleAll(false);
      }

      await new Promise((r) => requestAnimationFrame(r));

      const thumbnail = sceneRef.current?.captureSnapshot() ?? undefined;

      if (wereVisible) {
        surfaceManagerRef.current?.setHandlesVisibleAll(true);
      }

      const projectId = projectIdRef.current;

      if (projectId) {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data, thumbnail }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          console.error("Failed to save project:", res.status, err);
          return false;
        }
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data, thumbnail }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          console.error("Failed to save project:", res.status, err);
          return false;
        }

        const { id } = await res.json();
        projectIdRef.current = id;
      }

      return true;
    } catch (err) {
      console.error("Failed to save project:", err);
      return false;
    }
  }, [handlesVisible]);

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
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full touch-none" />
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
        projectName={projectName}
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
