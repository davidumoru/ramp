import * as THREE from "three";

const HANDLE_SIZE = 0.035;
const HANDLE_COLOR = 0xff4444;
const HANDLE_COLOR_SELECTED = 0xff8888;
const EDGE_COLOR = 0xffffff;
const EDGE_OPACITY = 0.5;
const DEFAULT_SEGMENTS = 32;

export class Surface {
  readonly id: string;
  readonly corners: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
  readonly handles: [THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Mesh];
  readonly mesh: THREE.Mesh;
  readonly edgeLines: THREE.LineSegments;

  private geometry: THREE.PlaneGeometry;
  private material: THREE.MeshBasicMaterial;
  private edgeGeometry: THREE.BufferGeometry;
  private edgeMaterial: THREE.LineBasicMaterial;
  private segments: number;
  private selected = false;

  private static handleGeometry: THREE.CircleGeometry | null = null;

  private static getHandleGeometry(): THREE.CircleGeometry {
    if (!Surface.handleGeometry) {
      Surface.handleGeometry = new THREE.CircleGeometry(HANDLE_SIZE, 16);
    }
    return Surface.handleGeometry;
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

  updateGeometry(): void {
    const posAttr = this.geometry.attributes.position;
    const uvAttr = this.geometry.attributes.uv;
    const [tl, tr, br, bl] = this.corners;

    for (let i = 0; i < posAttr.count; i++) {
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);

      // Bilinear interpolation: UV (0,0) = bottom-left, (1,1) = top-right in PlaneGeometry
      // But our corners are TL, TR, BR, BL so remap:
      // v=1 is top, v=0 is bottom
      const x =
        (1 - u) * v * tl.x +
        u * v * tr.x +
        u * (1 - v) * br.x +
        (1 - u) * (1 - v) * bl.x;
      const y =
        (1 - u) * v * tl.y +
        u * v * tr.y +
        u * (1 - v) * br.y +
        (1 - u) * (1 - v) * bl.y;

      posAttr.setXYZ(i, x, y, 0);
    }

    posAttr.needsUpdate = true;
    this.geometry.computeBoundingSphere();

    // Update handles
    for (let i = 0; i < 4; i++) {
      this.handles[i].position.set(this.corners[i].x, this.corners[i].y, 0.02);
    }

    // Update edge lines
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
    this.edgeLines.visible = visible;
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.mesh);
    scene.add(this.edgeLines);
    for (const handle of this.handles) {
      scene.add(handle);
    }
  }

  removeFromScene(scene: THREE.Scene): void {
    scene.remove(this.mesh);
    scene.remove(this.edgeLines);
    for (const handle of this.handles) {
      scene.remove(handle);
    }
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
  }
}
