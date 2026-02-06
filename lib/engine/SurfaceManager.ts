import * as THREE from "three";
import { Surface } from "./Surface";
import type { SceneManager } from "./SceneManager";

export class SurfaceManager {
  private surfaces: Surface[] = [];
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private canvas: HTMLCanvasElement;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private selectedSurface: Surface | null = null;
  private dragSurface: Surface | null = null;
  private dragCornerIndex = -1;
  private dragOffset = new THREE.Vector2();

  private handlesVisible = true;

  private onSelectionChange: ((id: string | null) => void) | null = null;
  private onSurfaceCountChange: ((count: number) => void) | null = null;

  private boundOnPointerDown: (e: PointerEvent) => void;
  private boundOnPointerMove: (e: PointerEvent) => void;
  private boundOnPointerUp: (e: PointerEvent) => void;
  private boundOnKeyDown: (e: KeyboardEvent) => void;

  constructor(sceneManager: SceneManager, canvas: HTMLCanvasElement) {
    this.scene = sceneManager.scene;
    this.camera = sceneManager.camera;
    this.canvas = canvas;

    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);

    canvas.addEventListener("pointerdown", this.boundOnPointerDown);
    canvas.addEventListener("pointermove", this.boundOnPointerMove);
    canvas.addEventListener("pointerup", this.boundOnPointerUp);
    window.addEventListener("keydown", this.boundOnKeyDown);
  }

  setOnSelectionChange(cb: (id: string | null) => void): void {
    this.onSelectionChange = cb;
  }

  setOnSurfaceCountChange(cb: (count: number) => void): void {
    this.onSurfaceCountChange = cb;
  }

  getSurfaces(): Surface[] {
    return this.surfaces;
  }

  getSelectedSurface(): Surface | null {
    return this.selectedSurface;
  }

  addSurface(): Surface {
    const surface = new Surface();
    surface.addToScene(this.scene);
    surface.setHandlesVisible(this.handlesVisible);
    this.surfaces.push(surface);
    this.selectSurface(surface);
    this.onSurfaceCountChange?.(this.surfaces.length);
    return surface;
  }

  deleteSelected(): void {
    if (!this.selectedSurface) return;

    const surface = this.selectedSurface;
    surface.removeFromScene(this.scene);
    surface.dispose();
    this.surfaces = this.surfaces.filter((s) => s.id !== surface.id);
    this.selectedSurface = null;
    this.onSelectionChange?.(null);
    this.onSurfaceCountChange?.(this.surfaces.length);
  }

  clearAll(): void {
    for (const surface of this.surfaces) {
      surface.removeFromScene(this.scene);
      surface.dispose();
    }
    this.surfaces = [];
    this.selectedSurface = null;
    this.onSelectionChange?.(null);
    this.onSurfaceCountChange?.(this.surfaces.length);
  }

  setTextureOnSelected(image: HTMLImageElement): void {
    if (this.selectedSurface) {
      this.selectedSurface.setTexture(image);
    }
  }

  setHandlesVisibleAll(visible: boolean): void {
    this.handlesVisible = visible;
    for (const surface of this.surfaces) {
      surface.setHandlesVisible(visible);
    }
  }

  setWireframeAll(enabled: boolean): void {
    for (const surface of this.surfaces) {
      surface.setWireframe(enabled);
    }
  }

  private selectSurface(surface: Surface | null): void {
    if (this.selectedSurface && this.selectedSurface !== surface) {
      this.selectedSurface.setSelected(false);
    }
    this.selectedSurface = surface;
    if (surface) {
      surface.setSelected(true);
    }
    this.onSelectionChange?.(surface?.id ?? null);
  }

  private updateMouse(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private hitTestHandles(
    e: MouseEvent
  ): { surface: Surface; cornerIndex: number } | null {
    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    let closest: { surface: Surface; cornerIndex: number; dist: number } | null =
      null;

    for (const surface of this.surfaces) {
      for (let i = 0; i < 4; i++) {
        const handle = surface.handles[i];
        if (!handle.visible) continue;
        const hits = this.raycaster.intersectObject(handle);
        if (hits.length > 0) {
          const dist = hits[0].distance;
          if (!closest || dist < closest.dist) {
            closest = { surface, cornerIndex: i, dist };
          }
        }
      }
    }

    return closest ? { surface: closest.surface, cornerIndex: closest.cornerIndex } : null;
  }

  private hitTestSurfaceMesh(e: MouseEvent): Surface | null {
    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    let closest: { surface: Surface; dist: number } | null = null;

    for (const surface of this.surfaces) {
      const hits = this.raycaster.intersectObject(surface.mesh);
      if (hits.length > 0) {
        const dist = hits[0].distance;
        if (!closest || dist < closest.dist) {
          closest = { surface, dist };
        }
      }
    }

    return closest?.surface ?? null;
  }

  private getWorldPos(e: MouseEvent): THREE.Vector3 {
    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(plane, intersection);
    return intersection;
  }

  private onPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;

    // Check handles first
    const handleHit = this.hitTestHandles(e);
    if (handleHit) {
      this.dragSurface = handleHit.surface;
      this.dragCornerIndex = handleHit.cornerIndex;
      this.selectSurface(handleHit.surface);

      const worldPos = this.getWorldPos(e);
      const corner = handleHit.surface.corners[handleHit.cornerIndex];
      this.dragOffset.set(corner.x - worldPos.x, corner.y - worldPos.y);

      this.canvas.setPointerCapture(e.pointerId);
      return;
    }

    // Check surface meshes for selection
    const surfaceHit = this.hitTestSurfaceMesh(e);
    if (surfaceHit) {
      this.selectSurface(surfaceHit);
    } else {
      this.selectSurface(null);
    }
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.dragSurface || this.dragCornerIndex < 0) return;

    const worldPos = this.getWorldPos(e);
    this.dragSurface.setCorner(
      this.dragCornerIndex,
      worldPos.x + this.dragOffset.x,
      worldPos.y + this.dragOffset.y
    );
  }

  private onPointerUp(e: PointerEvent): void {
    if (this.dragSurface) {
      this.dragSurface = null;
      this.dragCornerIndex = -1;
      this.canvas.releasePointerCapture(e.pointerId);
    }
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Delete" || e.key === "Backspace") {
      // Don't delete if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      this.deleteSelected();
    }
  }

  dispose(): void {
    this.canvas.removeEventListener("pointerdown", this.boundOnPointerDown);
    this.canvas.removeEventListener("pointermove", this.boundOnPointerMove);
    this.canvas.removeEventListener("pointerup", this.boundOnPointerUp);
    window.removeEventListener("keydown", this.boundOnKeyDown);

    for (const surface of this.surfaces) {
      surface.removeFromScene(this.scene);
      surface.dispose();
    }
    this.surfaces = [];
  }
}
