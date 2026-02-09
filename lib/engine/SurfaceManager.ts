import * as THREE from "three";
import { Surface } from "./Surface";
import type { SurfacePin, SerializedSurface } from "./types";
import type { SceneManager } from "./SceneManager";

type DragTarget =
  | { type: "corner"; surface: Surface; cornerIndex: number }
  | { type: "pin"; surface: Surface; pin: SurfacePin }
  | { type: "midpoint"; surface: Surface; edgeIndex: number }
  | null;

export class SurfaceManager {
  private surfaces: Surface[] = [];
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private canvas: HTMLCanvasElement;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private selectedSurface: Surface | null = null;
  private dragTarget: DragTarget = null;
  private dragOffset = new THREE.Vector2();

  private handlesVisible = true;

  private onSelectionChange: ((id: string | null) => void) | null = null;
  private onSurfaceCountChange: ((count: number) => void) | null = null;
  private onSegmentsChange: ((segments: number) => void) | null = null;
  private onBezierChange: ((enabled: boolean) => void) | null = null;

  private boundOnPointerDown: (e: PointerEvent) => void;
  private boundOnPointerMove: (e: PointerEvent) => void;
  private boundOnPointerUp: (e: PointerEvent) => void;
  private boundOnKeyDown: (e: KeyboardEvent) => void;
  private boundOnDblClick: (e: MouseEvent) => void;
  private boundOnContextMenu: (e: MouseEvent) => void;

  constructor(sceneManager: SceneManager, canvas: HTMLCanvasElement) {
    this.scene = sceneManager.scene;
    this.camera = sceneManager.camera;
    this.canvas = canvas;

    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnDblClick = this.onDblClick.bind(this);
    this.boundOnContextMenu = this.onContextMenu.bind(this);

    canvas.addEventListener("pointerdown", this.boundOnPointerDown);
    canvas.addEventListener("pointermove", this.boundOnPointerMove);
    canvas.addEventListener("pointerup", this.boundOnPointerUp);
    canvas.addEventListener("dblclick", this.boundOnDblClick);
    canvas.addEventListener("contextmenu", this.boundOnContextMenu);
    window.addEventListener("keydown", this.boundOnKeyDown);
  }

  setOnSelectionChange(cb: (id: string | null) => void): void {
    this.onSelectionChange = cb;
  }

  setOnSurfaceCountChange(cb: (count: number) => void): void {
    this.onSurfaceCountChange = cb;
  }

  setOnSegmentsChange(cb: (segments: number) => void): void {
    this.onSegmentsChange = cb;
  }

  setOnBezierChange(cb: (enabled: boolean) => void): void {
    this.onBezierChange = cb;
  }

  getSurfaces(): Surface[] {
    return this.surfaces;
  }

  getSelectedSurface(): Surface | null {
    return this.selectedSurface;
  }

  addSurface(options?: {
    segments?: number;
    wireframe?: boolean;
    bezier?: boolean;
  }): Surface {
    const surface = new Surface();
    surface.addToScene(this.scene);
    surface.setHandlesVisible(this.handlesVisible);
    if (options?.segments && options.segments !== 32) {
      surface.rebuild(options.segments);
    }
    if (options?.wireframe) {
      surface.setWireframe(true);
    }
    if (options?.bezier) {
      surface.setBezierEnabled(true);
    }
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

  serialize(): SerializedSurface[] {
    return this.surfaces.map((s) => s.serialize());
  }

  loadSerialized(data: SerializedSurface[]): void {
    this.clearAll();
    for (const surfaceData of data) {
      const surface = Surface.fromSerialized(surfaceData);
      surface.addToScene(this.scene);
      surface.setHandlesVisible(this.handlesVisible);
      this.surfaces.push(surface);
    }
    if (this.surfaces.length > 0) {
      this.selectSurface(this.surfaces[0]);
    }
    this.onSurfaceCountChange?.(this.surfaces.length);
  }

  setSegmentsOnSelected(segments: number): void {
    if (this.selectedSurface) {
      this.selectedSurface.rebuild(segments);
    }
  }

  setBezierOnSelected(enabled: boolean): void {
    if (this.selectedSurface) {
      this.selectedSurface.setBezierEnabled(enabled);
    }
  }

  duplicateSelected(): void {
    if (!this.selectedSurface) return;

    const clone = this.selectedSurface.clone(this.scene);
    clone.addToScene(this.scene);
    clone.setHandlesVisible(this.handlesVisible);
    this.surfaces.push(clone);
    this.selectSurface(clone);
    this.onSurfaceCountChange?.(this.surfaces.length);
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
    this.onSegmentsChange?.(surface?.getSegments() ?? 32);
    this.onBezierChange?.(surface?.isBezierEnabled ?? false);
  }

  private updateMouse(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private hitTestAll(e: MouseEvent): DragTarget {
    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    let closest: { target: DragTarget; dist: number } | null = null;

    for (const surface of this.surfaces) {
      for (let i = 0; i < 4; i++) {
        const handle = surface.handles[i];
        if (!handle.visible) continue;
        const hits = this.raycaster.intersectObject(handle);
        if (hits.length > 0 && (!closest || hits[0].distance < closest.dist)) {
          closest = {
            target: { type: "corner", surface, cornerIndex: i },
            dist: hits[0].distance,
          };
        }
      }

      for (const pin of surface.pins) {
        if (!pin.handle.visible) continue;
        const hits = this.raycaster.intersectObject(pin.handle);
        if (hits.length > 0 && (!closest || hits[0].distance < closest.dist)) {
          closest = {
            target: { type: "pin", surface, pin },
            dist: hits[0].distance,
          };
        }
      }

      for (let i = 0; i < 4; i++) {
        const handle = surface.edgeMidHandles[i];
        if (!handle || !handle.visible) continue;
        const hits = this.raycaster.intersectObject(handle);
        if (hits.length > 0 && (!closest || hits[0].distance < closest.dist)) {
          closest = {
            target: { type: "midpoint", surface, edgeIndex: i },
            dist: hits[0].distance,
          };
        }
      }
    }

    return closest?.target ?? null;
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

  // --- Event handlers ---

  private onPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;

    const hit = this.hitTestAll(e);
    if (hit) {
      this.dragTarget = hit;
      this.selectSurface(hit.surface);

      const worldPos = this.getWorldPos(e);

      if (hit.type === "corner") {
        const corner = hit.surface.corners[hit.cornerIndex];
        this.dragOffset.set(corner.x - worldPos.x, corner.y - worldPos.y);
      } else if (hit.type === "pin") {
        this.dragOffset.set(
          hit.pin.position.x - worldPos.x,
          hit.pin.position.y - worldPos.y
        );
      } else if (hit.type === "midpoint") {
        const mid = hit.surface.edgeMidpoints[hit.edgeIndex];
        if (mid) {
          this.dragOffset.set(mid.x - worldPos.x, mid.y - worldPos.y);
        }
      }

      this.canvas.setPointerCapture(e.pointerId);
      return;
    }

    const surfaceHit = this.hitTestSurfaceMesh(e);
    if (surfaceHit) {
      this.selectSurface(surfaceHit);
    } else {
      this.selectSurface(null);
    }
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.dragTarget) return;

    const worldPos = this.getWorldPos(e);
    const x = worldPos.x + this.dragOffset.x;
    const y = worldPos.y + this.dragOffset.y;

    if (this.dragTarget.type === "corner") {
      this.dragTarget.surface.setCorner(this.dragTarget.cornerIndex, x, y);
    } else if (this.dragTarget.type === "pin") {
      this.dragTarget.pin.position.set(x, y, 0);
      this.dragTarget.pin.handle.position.set(x, y, 0.02);
      this.dragTarget.surface.updateGeometry();
    } else if (this.dragTarget.type === "midpoint") {
      this.dragTarget.surface.setEdgeMidpoint(this.dragTarget.edgeIndex, x, y);
    }
  }

  private onPointerUp(e: PointerEvent): void {
    if (this.dragTarget) {
      this.dragTarget = null;
      this.canvas.releasePointerCapture(e.pointerId);
    }
  }

  private onDblClick(e: MouseEvent): void {
    if (!this.selectedSurface) return;

    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(this.selectedSurface.mesh);
    if (hits.length > 0) {
      const point = hits[0].point;
      this.selectedSurface.addPin(new THREE.Vector3(point.x, point.y, 0));
    }
  }

  private onContextMenu(e: MouseEvent): void {
    e.preventDefault();

    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    for (const surface of this.surfaces) {
      for (const pin of surface.pins) {
        if (!pin.handle.visible) continue;
        const hits = this.raycaster.intersectObject(pin.handle);
        if (hits.length > 0) {
          surface.removePin(pin.id);
          return;
        }
      }
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
    this.canvas.removeEventListener("dblclick", this.boundOnDblClick);
    this.canvas.removeEventListener("contextmenu", this.boundOnContextMenu);
    window.removeEventListener("keydown", this.boundOnKeyDown);

    for (const surface of this.surfaces) {
      surface.removeFromScene(this.scene);
      surface.dispose();
    }
    this.surfaces = [];
  }
}
