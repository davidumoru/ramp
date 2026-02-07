import type * as THREE from "three";

export interface Pin {
  id: string;
  /** Position in mesh-local coordinates where the pin was placed */
  origin: THREE.Vector3;
  /** Current position (origin + user drag offset) */
  position: THREE.Vector3;
  /** Visual handle (sphere mesh) */
  handle: THREE.Mesh;
}

export interface WarpConfig {
  /** Maximum influence distance (in world units) */
  radius: number;
  /** Falloff exponent - higher = sharper boundary */
  falloff: number;
}

export interface MeshConfig {
  /** Number of segments along each axis (4-64) */
  segments: number;
  /** Width of the plane in world units */
  width: number;
  /** Height of the plane in world units */
  height: number;
}

export interface SurfacePin {
  id: string;
  /** Position on the bilinear grid where pin was placed */
  origin: THREE.Vector3;
  /** Current dragged position */
  position: THREE.Vector3;
  /** Visual handle (sphere mesh) */
  handle: THREE.Mesh;
}

export interface SurfaceData {
  id: string;
  corners: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
  textureUrl: string | null;
}

export interface SurfaceConfig {
  /** Number of subdivisions along each axis (default 32) */
  segments: number;
}

export interface SerializedPin {
  id: string;
  originX: number;
  originY: number;
  positionX: number;
  positionY: number;
}

export interface SerializedSurface {
  id: string;
  corners: [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
  ];
  segments: number;
  bezierEnabled: boolean;
  edgeMidpoints: [
    { x: number; y: number } | null,
    { x: number; y: number } | null,
    { x: number; y: number } | null,
    { x: number; y: number } | null,
  ];
  pins: SerializedPin[];
}
