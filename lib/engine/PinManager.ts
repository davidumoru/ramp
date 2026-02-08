import * as THREE from "three";
import type { Pin } from "./types";
import type { SceneManager } from "./SceneManager";
import type { MeshBuilder } from "./MeshBuilder";
import type { WarpSolver } from "./WarpSolver";

const PIN_RADIUS = 0.03;
const PIN_COLOR = 0xff4444;
const PIN_COLOR_ACTIVE = 0xff8888;

export class PinManager {
  private pins: Pin[] = [];
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private meshBuilder: MeshBuilder;
  private warpSolver: WarpSolver;
  private canvas: HTMLCanvasElement;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private dragPin: Pin | null = null;
  private dragOffset = new THREE.Vector2();

  private pinGeometry: THREE.SphereGeometry;
  private pinMaterial: THREE.MeshBasicMaterial;
  private pinMaterialActive: THREE.MeshBasicMaterial;

  private pinsVisible = true;

  private boundOnDblClick: (e: MouseEvent) => void;
  private boundOnPointerDown: (e: PointerEvent) => void;
  private boundOnPointerMove: (e: PointerEvent) => void;
  private boundOnPointerUp: (e: PointerEvent) => void;
  private boundOnContextMenu: (e: MouseEvent) => void;

  constructor(
    sceneManager: SceneManager,
    meshBuilder: MeshBuilder,
    warpSolver: WarpSolver,
    canvas: HTMLCanvasElement
  ) {
    this.scene = sceneManager.scene;
    this.camera = sceneManager.camera;
    this.meshBuilder = meshBuilder;
    this.warpSolver = warpSolver;
    this.canvas = canvas;

    this.pinGeometry = new THREE.SphereGeometry(PIN_RADIUS, 16, 16);
    this.pinMaterial = new THREE.MeshBasicMaterial({ color: PIN_COLOR });
    this.pinMaterialActive = new THREE.MeshBasicMaterial({
      color: PIN_COLOR_ACTIVE,
    });

    this.boundOnDblClick = this.onDblClick.bind(this);
    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    this.boundOnContextMenu = this.onContextMenu.bind(this);

    canvas.addEventListener("dblclick", this.boundOnDblClick);
    canvas.addEventListener("pointerdown", this.boundOnPointerDown);
    canvas.addEventListener("pointermove", this.boundOnPointerMove);
    canvas.addEventListener("pointerup", this.boundOnPointerUp);
    canvas.addEventListener("contextmenu", this.boundOnContextMenu);
  }

  getPins(): Pin[] {
    return this.pins;
  }

  setPinsVisible(visible: boolean): void {
    this.pinsVisible = visible;
    for (const pin of this.pins) {
      pin.handle.visible = visible;
    }
  }

  private updateMouse(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private hitTestPins(e: MouseEvent): Pin | null {
    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const handles = this.pins.map((p) => p.handle);
    const hits = this.raycaster.intersectObjects(handles);
    if (hits.length === 0) return null;

    return this.pins.find((p) => p.handle === hits[0].object) ?? null;
  }

  private hitTestMesh(e: MouseEvent): THREE.Vector3 | null {
    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const hits = this.raycaster.intersectObject(this.meshBuilder.mesh);
    if (hits.length === 0) return null;
    return hits[0].point.clone();
  }

  private addPin(worldPos: THREE.Vector3): Pin {
    const handle = new THREE.Mesh(this.pinGeometry, this.pinMaterial.clone());
    handle.position.copy(worldPos);
    handle.position.z = 0.01; // slightly in front of mesh
    handle.renderOrder = 1;
    handle.visible = this.pinsVisible;
    this.scene.add(handle);

    const pin: Pin = {
      id: crypto.randomUUID(),
      origin: worldPos.clone(),
      position: worldPos.clone(),
      handle,
    };

    this.pins.push(pin);
    return pin;
  }

  private removePin(pin: Pin): void {
    this.scene.remove(pin.handle);
    (pin.handle.material as THREE.MeshBasicMaterial).dispose();
    this.pins = this.pins.filter((p) => p.id !== pin.id);
    this.warpSolver.solve(this.pins, this.meshBuilder);
  }

  /** Re-apply warp after mesh rebuild. Pins keep their origin/position. */
  reapplyWarp(): void {
    this.warpSolver.solve(this.pins, this.meshBuilder);
  }

  /** Remove all pins and reset mesh to unwarped state */
  clearAll(): void {
    for (const pin of this.pins) {
      this.scene.remove(pin.handle);
      (pin.handle.material as THREE.MeshBasicMaterial).dispose();
    }
    this.pins = [];
    this.warpSolver.solve(this.pins, this.meshBuilder);
  }

  private onDblClick(e: MouseEvent): void {
    if (this.hitTestPins(e)) return;

    const worldPos = this.hitTestMesh(e);
    if (!worldPos) return;

    this.addPin(worldPos);
  }

  private onPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;

    const pin = this.hitTestPins(e);
    if (!pin) return;

    this.dragPin = pin;
    (pin.handle.material as THREE.MeshBasicMaterial).color.set(
      PIN_COLOR_ACTIVE
    );

    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(plane, intersection);

    this.dragOffset.set(
      pin.position.x - intersection.x,
      pin.position.y - intersection.y
    );

    this.canvas.setPointerCapture(e.pointerId);
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.dragPin) return;

    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(plane, intersection);

    this.dragPin.position.x = intersection.x + this.dragOffset.x;
    this.dragPin.position.y = intersection.y + this.dragOffset.y;
    this.dragPin.handle.position.x = this.dragPin.position.x;
    this.dragPin.handle.position.y = this.dragPin.position.y;

    this.warpSolver.solve(this.pins, this.meshBuilder);
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.dragPin) return;

    (this.dragPin.handle.material as THREE.MeshBasicMaterial).color.set(
      PIN_COLOR
    );
    this.dragPin = null;
    this.canvas.releasePointerCapture(e.pointerId);
  }

  private onContextMenu(e: MouseEvent): void {
    e.preventDefault();

    const pin = this.hitTestPins(e);
    if (pin) {
      this.removePin(pin);
    }
  }

  dispose(): void {
    this.canvas.removeEventListener("dblclick", this.boundOnDblClick);
    this.canvas.removeEventListener("pointerdown", this.boundOnPointerDown);
    this.canvas.removeEventListener("pointermove", this.boundOnPointerMove);
    this.canvas.removeEventListener("pointerup", this.boundOnPointerUp);
    this.canvas.removeEventListener("contextmenu", this.boundOnContextMenu);

    for (const pin of this.pins) {
      this.scene.remove(pin.handle);
      (pin.handle.material as THREE.MeshBasicMaterial).dispose();
    }
    this.pins = [];
    this.pinGeometry.dispose();
    this.pinMaterial.dispose();
    this.pinMaterialActive.dispose();
  }
}
