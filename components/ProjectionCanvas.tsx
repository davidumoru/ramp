"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SceneManager } from "@/lib/engine/SceneManager";
import { MeshBuilder } from "@/lib/engine/MeshBuilder";
import { WarpSolver } from "@/lib/engine/WarpSolver";
import { PinManager } from "@/lib/engine/PinManager";
import { Toolbar } from "./Toolbar";

const DEFAULT_SEGMENTS = 32;
const WARP_RADIUS = 0.5;
const WARP_FALLOFF = 2;

export function ProjectionCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneManager | null>(null);
  const meshRef = useRef<MeshBuilder | null>(null);
  const warpRef = useRef<WarpSolver | null>(null);
  const pinRef = useRef<PinManager | null>(null);

  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  const [pinsVisible, setPinsVisible] = useState(true);

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
    const mesh = new MeshBuilder({
      segments: DEFAULT_SEGMENTS,
      width: 2,
      height: 1.5,
    });
    const warp = new WarpSolver({ radius: WARP_RADIUS, falloff: WARP_FALLOFF });
    const pins = new PinManager(scene, mesh, warp, canvas);

    scene.scene.add(mesh.mesh);
    scene.start();

    sceneRef.current = scene;
    meshRef.current = mesh;
    warpRef.current = warp;
    pinRef.current = pins;

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
      pins.dispose();
      mesh.dispose();
      scene.dispose();
      sceneRef.current = null;
      meshRef.current = null;
      warpRef.current = null;
      pinRef.current = null;
    };
  }, []);

  const handleImageUpload = useCallback((image: HTMLImageElement) => {
    meshRef.current?.setTexture(image);
  }, []);

  const handleSegmentsChange = useCallback((newSegments: number) => {
    setSegments(newSegments);
    if (meshRef.current) {
      meshRef.current.rebuild(newSegments);
      pinRef.current?.reapplyWarp();
    }
  }, []);

  const handleTogglePins = useCallback(() => {
    setPinsVisible((prev) => {
      const next = !prev;
      pinRef.current?.setPinsVisible(next);
      return next;
    });
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
        onImageUpload={handleImageUpload}
        onSegmentsChange={handleSegmentsChange}
        onTogglePins={handleTogglePins}
        onFullscreen={handleFullscreen}
        segments={segments}
        pinsVisible={pinsVisible}
      />
    </div>
  );
}
