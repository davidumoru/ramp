import * as THREE from "three";
import type { MeshConfig } from "./types";

export class MeshBuilder {
  private geometry: THREE.PlaneGeometry;
  private material: THREE.MeshBasicMaterial;
  readonly mesh: THREE.Mesh;

  private basePositions: Float32Array;

  private config: MeshConfig;

  constructor(config: MeshConfig) {
    this.config = { ...config };

    this.geometry = new THREE.PlaneGeometry(
      config.width,
      config.height,
      config.segments,
      config.segments
    );

    this.material = new THREE.MeshBasicMaterial({
      color: 0x333333,
      wireframe: true,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    const pos = this.geometry.attributes.position.array as Float32Array;
    this.basePositions = new Float32Array(pos);
  }

  get segments(): number {
    return this.config.segments;
  }

  getBasePositions(): Float32Array {
    return this.basePositions;
  }

  getPositionAttribute(): THREE.BufferAttribute {
    return this.geometry.attributes.position as THREE.BufferAttribute;
  }

  rebuild(segments: number): void {
    this.config.segments = segments;

    const oldGeometry = this.geometry;
    this.geometry = new THREE.PlaneGeometry(
      this.config.width,
      this.config.height,
      segments,
      segments
    );
    this.mesh.geometry = this.geometry;
    oldGeometry.dispose();

    const pos = this.geometry.attributes.position.array as Float32Array;
    this.basePositions = new Float32Array(pos);
  }

  get hasTexture(): boolean {
    return this.material.map !== null;
  }

  get wireframe(): boolean {
    return this.material.wireframe;
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

  setWireframe(enabled: boolean): void {
    this.material.wireframe = enabled;
    if (enabled) {
      this.material.color.set(0x333333);
    } else if (this.material.map) {
      this.material.color.set(0xffffff);
    }
    this.material.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    if (this.material.map) {
      this.material.map.dispose();
    }
  }
}
