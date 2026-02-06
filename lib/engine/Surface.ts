import * as THREE from "three";
import type { SurfacePin } from "./types";

const HANDLE_SIZE = 0.035;
const PIN_SIZE = 0.025;
const MID_HANDLE_SIZE = 0.028;
const HANDLE_COLOR = 0xff4444;
const HANDLE_COLOR_SELECTED = 0xff8888;
const PIN_COLOR = 0x44aaff;
const MID_HANDLE_COLOR = 0x44ff88;
const EDGE_COLOR = 0xffffff;
const EDGE_OPACITY = 0.5;
const DEFAULT_SEGMENTS = 32;
const EDGE_SAMPLE_COUNT = 16;


export class Surface {
  readonly id: string;
  readonly corners: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
  readonly handles: [THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Mesh];
  readonly mesh: THREE.Mesh;
  readonly edgeLines: THREE.LineSegments;

  // Pins
  pins: SurfacePin[] = [];

  // Bezier edge midpoints: top, right, bottom, left
  edgeMidpoints: [THREE.Vector3 | null, THREE.Vector3 | null, THREE.Vector3 | null, THREE.Vector3 | null] = [null, null, null, null];
  edgeMidHandles: [THREE.Mesh | null, THREE.Mesh | null, THREE.Mesh | null, THREE.Mesh | null] = [null, null, null, null];
  private bezierEnabled = false;

  private geometry: THREE.PlaneGeometry;
  private material: THREE.MeshBasicMaterial;
  private edgeGeometry: THREE.BufferGeometry;
  private edgeMaterial: THREE.LineBasicMaterial;
  private segments: number;
  private selected = false;
  private scene: THREE.Scene | null = null;

  private static handleGeometry: THREE.CircleGeometry | null = null;
  private static pinGeometry: THREE.CircleGeometry | null = null;
  private static midHandleGeometry: THREE.CircleGeometry | null = null;

  private static getHandleGeometry(): THREE.CircleGeometry {
    if (!Surface.handleGeometry) {
      Surface.handleGeometry = new THREE.CircleGeometry(HANDLE_SIZE, 16);
    }
    return Surface.handleGeometry;
  }

  private static getPinGeometry(): THREE.CircleGeometry {
    if (!Surface.pinGeometry) {
      Surface.pinGeometry = new THREE.CircleGeometry(PIN_SIZE, 12);
    }
    return Surface.pinGeometry;
  }

  private static getMidHandleGeometry(): THREE.CircleGeometry {
    if (!Surface.midHandleGeometry) {
      Surface.midHandleGeometry = new THREE.CircleGeometry(MID_HANDLE_SIZE, 12);
    }
    return Surface.midHandleGeometry;
  }

  constructor(
    centerX = 0,
    centerY = 0,
    width = 1.0,
    height = 0.75,
    segments = DEFAULT_SEGMENTS
  ) {
    this.id = crypto.randomUUID();
    this.segments = segments;

    const hw = width / 2;
    const hh = height / 2;

    // TL, TR, BR, BL
    this.corners = [
      new THREE.Vector3(centerX - hw, centerY + hh, 0),
      new THREE.Vector3(centerX + hw, centerY + hh, 0),
      new THREE.Vector3(centerX + hw, centerY - hh, 0),
      new THREE.Vector3(centerX - hw, centerY - hh, 0),
    ];

    // Create geometry with standard UVs
    this.geometry = new THREE.PlaneGeometry(1, 1, segments, segments);
    this.material = new THREE.MeshBasicMaterial({
      color: 0x333333,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // Create corner handles
    const handleGeo = Surface.getHandleGeometry();
    const makeHandle = (corner: THREE.Vector3): THREE.Mesh => {
      const mat = new THREE.MeshBasicMaterial({
        color: HANDLE_COLOR,
        depthTest: false,
      });
      const handle = new THREE.Mesh(handleGeo, mat);
      handle.position.copy(corner);
      handle.position.z = 0.02;
      handle.renderOrder = 2;
      return handle;
    };
    this.handles = [
      makeHandle(this.corners[0]),
      makeHandle(this.corners[1]),
      makeHandle(this.corners[2]),
      makeHandle(this.corners[3]),
    ];

    // Create edge lines
    this.edgeGeometry = new THREE.BufferGeometry();
    this.edgeMaterial = new THREE.LineBasicMaterial({
      color: EDGE_COLOR,
      transparent: true,
      opacity: EDGE_OPACITY,
      depthTest: false,
    });
    this.edgeLines = new THREE.LineSegments(this.edgeGeometry, this.edgeMaterial);
    this.edgeLines.renderOrder = 1;

    this.updateGeometry();
  }

  // --- Bezier edge helpers ---

  private bezierQuad(a: THREE.Vector3, m: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
    const omt = 1 - t;
    return new THREE.Vector3(
      omt * omt * a.x + 2 * omt * t * m.x + t * t * b.x,
      omt * omt * a.y + 2 * omt * t * m.y + t * t * b.y,
      0
    );
  }

  /** Evaluate an edge at parameter t. Edges: 0=top(TL→TR), 1=right(TR→BR), 2=bottom(BL→BR), 3=left(TL→BL) */
  private edgePoint(edgeIndex: number, t: number): THREE.Vector3 {
    const [tl, tr, br, bl] = this.corners;
    const mid = this.edgeMidpoints[edgeIndex];

    switch (edgeIndex) {
      case 0: // top: TL→TR
        return mid ? this.bezierQuad(tl, mid, tr, t) : new THREE.Vector3().lerpVectors(tl, tr, t);
      case 1: // right: TR→BR
        return mid ? this.bezierQuad(tr, mid, br, t) : new THREE.Vector3().lerpVectors(tr, br, t);
      case 2: // bottom: BL→BR
        return mid ? this.bezierQuad(bl, mid, br, t) : new THREE.Vector3().lerpVectors(bl, br, t);
      case 3: // left: TL→BL
        return mid ? this.bezierQuad(tl, mid, bl, t) : new THREE.Vector3().lerpVectors(tl, bl, t);
      default:
        return new THREE.Vector3();
    }
  }

  updateGeometry(): void {
    const posAttr = this.geometry.attributes.position;
    const uvAttr = this.geometry.attributes.uv;
    const [tl, tr, br, bl] = this.corners;

    // Pass 1: Bilinear or Coons patch positions
    for (let i = 0; i < posAttr.count; i++) {
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);

      let x: number, y: number;

      if (this.bezierEnabled) {
        // Coons patch: P(u,v) = (1-v)*bottom(u) + v*top(u) + (1-u)*left(v) + u*right(v) - bilinear
        // In UV space: v=1 is top, v=0 is bottom
        // left(v): v=1→TL, v=0→BL → param = 1-v
        const topPt = this.edgePoint(0, u);
        const bottomPt = this.edgePoint(2, u);
        const leftPt = this.edgePoint(3, 1 - v);
        const rightPt = this.edgePoint(1, 1 - v);

        // Bilinear corners term
        const bilinX =
          (1 - u) * v * tl.x +
          u * v * tr.x +
          u * (1 - v) * br.x +
          (1 - u) * (1 - v) * bl.x;
        const bilinY =
          (1 - u) * v * tl.y +
          u * v * tr.y +
          u * (1 - v) * br.y +
          (1 - u) * (1 - v) * bl.y;

        // Coons: (1-v)*bottom + v*top + (1-u)*left + u*right - bilinear
        x = (1 - v) * bottomPt.x + v * topPt.x + (1 - u) * leftPt.x + u * rightPt.x - bilinX;
        y = (1 - v) * bottomPt.y + v * topPt.y + (1 - u) * leftPt.y + u * rightPt.y - bilinY;
      } else {
        // Bilinear interpolation
        x =
          (1 - u) * v * tl.x +
          u * v * tr.x +
          u * (1 - v) * br.x +
          (1 - u) * (1 - v) * bl.x;
        y =
          (1 - u) * v * tl.y +
          u * v * tr.y +
          u * (1 - v) * br.y +
          (1 - u) * (1 - v) * bl.y;
      }

      posAttr.setXYZ(i, x, y, 0);
    }

    // Pass 2: IDW pin warping
    if (this.pins.length > 0) {
      // Compute radius from surface diagonal so warp scales with surface size
      const diagX = tr.x - bl.x;
      const diagY = tr.y - bl.y;
      const idwRadius = Math.sqrt(diagX * diagX + diagY * diagY) * 0.75;

      const array = (posAttr.array as Float32Array);
      for (let i = 0; i < posAttr.count; i++) {
        const i3 = i * 3;
        const bx = array[i3];
        const by = array[i3 + 1];

        let dx = 0;
        let dy = 0;

        for (const pin of this.pins) {
          const px = bx - pin.origin.x;
          const py = by - pin.origin.y;
          const dist = Math.sqrt(px * px + py * py);

          if (dist >= idwRadius) continue;

          const t = 1 - dist / idwRadius;
          const w = t * t * t; // cubic falloff — smooth and local

          dx += w * (pin.position.x - pin.origin.x);
          dy += w * (pin.position.y - pin.origin.y);
        }

        array[i3] = bx + dx;
        array[i3 + 1] = by + dy;
      }
    }

    posAttr.needsUpdate = true;
    this.geometry.computeBoundingSphere();

    // Update corner handles
    for (let i = 0; i < 4; i++) {
      this.handles[i].position.set(this.corners[i].x, this.corners[i].y, 0.02);
    }

    // Update edge midpoint handles
    for (let i = 0; i < 4; i++) {
      const mid = this.edgeMidpoints[i];
      const handle = this.edgeMidHandles[i];
      if (mid && handle) {
        handle.position.set(mid.x, mid.y, 0.02);
      }
    }

    // Update edge lines (sample curved edges)
    this.updateEdgeLines();
  }

  private updateEdgeLines(): void {
    const n = EDGE_SAMPLE_COUNT;

    if (!this.bezierEnabled) {
      // Simple 4-edge line segments
      const [tl, tr, br, bl] = this.corners;
      const edgeVerts = new Float32Array([
        tl.x, tl.y, 0.01, tr.x, tr.y, 0.01,
        tr.x, tr.y, 0.01, br.x, br.y, 0.01,
        br.x, br.y, 0.01, bl.x, bl.y, 0.01,
        bl.x, bl.y, 0.01, tl.x, tl.y, 0.01,
      ]);
      this.edgeGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(edgeVerts, 3)
      );
    } else {
      // Sample each edge with n segments → n line-segment pairs per edge → 4*n*2 vertices
      const verts: number[] = [];
      // Edge order for drawing: top(0), right(1), bottom(2 reversed for continuity), left(3 reversed)
      // top: TL→TR, right: TR→BR, bottom: BR→BL (reverse of 2), left: BL→TL (reverse of 3)
      const edges = [
        { idx: 0, reverse: false }, // top: TL→TR
        { idx: 1, reverse: false }, // right: TR→BR
        { idx: 2, reverse: true },  // bottom drawn BR→BL (edgePoint(2,u) is BL→BR, so reverse)
        { idx: 3, reverse: true },  // left drawn BL→TL (edgePoint(3,v) is TL→BL, so reverse)
      ];

      for (const { idx, reverse } of edges) {
        for (let s = 0; s < n; s++) {
          let t0 = s / n;
          let t1 = (s + 1) / n;
          if (reverse) {
            t0 = 1 - t0;
            t1 = 1 - t1;
          }
          const p0 = this.edgePoint(idx, t0);
          const p1 = this.edgePoint(idx, t1);
          verts.push(p0.x, p0.y, 0.01, p1.x, p1.y, 0.01);
        }
      }

      this.edgeGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(verts), 3)
      );
    }

    this.edgeGeometry.computeBoundingSphere();
  }

  setCorner(index: number, x: number, y: number): void {
    this.corners[index].set(x, y, 0);
    this.updateGeometry();
  }

  setTexture(image: HTMLImageElement): void {
    const texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;

    if (this.material.map) {
      this.material.map.dispose();
    }

    this.material.map = texture;
    this.material.wireframe = false;
    this.material.color.set(0xffffff);
    this.material.needsUpdate = true;
  }

  get hasTexture(): boolean {
    return this.material.map !== null;
  }

  setWireframe(enabled: boolean): void {
    this.material.wireframe = enabled;
    if (enabled) {
      if (!this.material.map) {
        this.material.color.set(0x333333);
      }
    } else if (this.material.map) {
      this.material.color.set(0xffffff);
    }
    this.material.needsUpdate = true;
  }

  get wireframe(): boolean {
    return this.material.wireframe;
  }

  setSelected(selected: boolean): void {
    this.selected = selected;
    const color = selected ? HANDLE_COLOR_SELECTED : HANDLE_COLOR;
    for (const handle of this.handles) {
      (handle.material as THREE.MeshBasicMaterial).color.set(color);
    }
    this.edgeMaterial.opacity = selected ? 0.8 : EDGE_OPACITY;
  }

  get isSelected(): boolean {
    return this.selected;
  }

  setHandlesVisible(visible: boolean): void {
    for (const handle of this.handles) {
      handle.visible = visible;
    }
    for (const pin of this.pins) {
      pin.handle.visible = visible;
    }
    for (const handle of this.edgeMidHandles) {
      if (handle) handle.visible = visible && this.bezierEnabled;
    }
    this.edgeLines.visible = visible;
  }

  // --- Pin management ---

  addPin(worldPos: THREE.Vector3): SurfacePin {
    const pinGeo = Surface.getPinGeometry();
    const mat = new THREE.MeshBasicMaterial({
      color: PIN_COLOR,
      depthTest: false,
    });
    const handle = new THREE.Mesh(pinGeo, mat);
    handle.position.set(worldPos.x, worldPos.y, 0.02);
    handle.renderOrder = 3;

    const pin: SurfacePin = {
      id: crypto.randomUUID(),
      origin: worldPos.clone(),
      position: worldPos.clone(),
      handle,
    };

    this.pins.push(pin);
    if (this.scene) {
      this.scene.add(handle);
    }
    return pin;
  }

  removePin(id: string): void {
    const idx = this.pins.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const pin = this.pins[idx];
    if (this.scene) {
      this.scene.remove(pin.handle);
    }
    (pin.handle.material as THREE.MeshBasicMaterial).dispose();
    this.pins.splice(idx, 1);
    this.updateGeometry();
  }

  clearPins(): void {
    for (const pin of this.pins) {
      if (this.scene) this.scene.remove(pin.handle);
      (pin.handle.material as THREE.MeshBasicMaterial).dispose();
    }
    this.pins = [];
    this.updateGeometry();
  }

  // --- Segments rebuild ---

  getSegments(): number {
    return this.segments;
  }

  rebuild(newSegments: number): void {
    this.segments = newSegments;

    // Dispose old geometry
    this.geometry.dispose();

    // Create new geometry
    this.geometry = new THREE.PlaneGeometry(1, 1, newSegments, newSegments);
    this.mesh.geometry = this.geometry;

    this.updateGeometry();
  }

  // --- Bezier edges ---

  get isBezierEnabled(): boolean {
    return this.bezierEnabled;
  }

  setBezierEnabled(enabled: boolean): void {
    this.bezierEnabled = enabled;

    if (enabled && !this.edgeMidHandles[0]) {
      // First time: create midpoint handles at edge centers
      const [tl, tr, br, bl] = this.corners;
      const edgeCenters = [
        new THREE.Vector3().lerpVectors(tl, tr, 0.5), // top
        new THREE.Vector3().lerpVectors(tr, br, 0.5), // right
        new THREE.Vector3().lerpVectors(bl, br, 0.5), // bottom
        new THREE.Vector3().lerpVectors(tl, bl, 0.5), // left
      ];

      const midGeo = Surface.getMidHandleGeometry();
      for (let i = 0; i < 4; i++) {
        this.edgeMidpoints[i] = edgeCenters[i];

        const mat = new THREE.MeshBasicMaterial({
          color: MID_HANDLE_COLOR,
          depthTest: false,
        });
        const handle = new THREE.Mesh(midGeo, mat);
        handle.position.set(edgeCenters[i].x, edgeCenters[i].y, 0.02);
        handle.renderOrder = 2;
        this.edgeMidHandles[i] = handle;

        if (this.scene) {
          this.scene.add(handle);
        }
      }
    }

    // Show/hide midpoint handles based on enabled state
    for (const handle of this.edgeMidHandles) {
      if (handle) handle.visible = enabled;
    }

    this.updateGeometry();
  }

  setEdgeMidpoint(edgeIndex: number, x: number, y: number): void {
    const mid = this.edgeMidpoints[edgeIndex];
    if (mid) {
      mid.set(x, y, 0);
      this.updateGeometry();
    }
  }

  // --- Clone ---

  clone(scene: THREE.Scene): Surface {
    const offset = 0.05;
    const s = new Surface(0, 0, 1, 0.75, this.segments);

    // Copy corners with offset
    for (let i = 0; i < 4; i++) {
      s.corners[i].set(this.corners[i].x + offset, this.corners[i].y + offset, 0);
    }

    // Share texture reference (not cloned)
    if (this.material.map) {
      s.material.map = this.material.map;
      s.material.wireframe = this.material.wireframe;
      s.material.color.copy(this.material.color);
      s.material.needsUpdate = true;
    }

    // Copy bezier state
    if (this.bezierEnabled) {
      s.scene = scene;
      s.setBezierEnabled(true);
      for (let i = 0; i < 4; i++) {
        const mid = this.edgeMidpoints[i];
        if (mid) {
          s.edgeMidpoints[i]!.set(mid.x + offset, mid.y + offset, 0);
        }
      }
    }

    s.updateGeometry();
    return s;
  }

  // --- Scene management ---

  addToScene(scene: THREE.Scene): void {
    this.scene = scene;
    scene.add(this.mesh);
    scene.add(this.edgeLines);
    for (const handle of this.handles) {
      scene.add(handle);
    }
    for (const pin of this.pins) {
      scene.add(pin.handle);
    }
    for (const handle of this.edgeMidHandles) {
      if (handle) scene.add(handle);
    }
  }

  removeFromScene(scene: THREE.Scene): void {
    scene.remove(this.mesh);
    scene.remove(this.edgeLines);
    for (const handle of this.handles) {
      scene.remove(handle);
    }
    for (const pin of this.pins) {
      scene.remove(pin.handle);
    }
    for (const handle of this.edgeMidHandles) {
      if (handle) scene.remove(handle);
    }
    this.scene = null;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    if (this.material.map) {
      this.material.map.dispose();
    }
    this.edgeGeometry.dispose();
    this.edgeMaterial.dispose();
    for (const handle of this.handles) {
      (handle.material as THREE.MeshBasicMaterial).dispose();
    }
    for (const pin of this.pins) {
      (pin.handle.material as THREE.MeshBasicMaterial).dispose();
    }
    for (const handle of this.edgeMidHandles) {
      if (handle) (handle.material as THREE.MeshBasicMaterial).dispose();
    }
  }
}
