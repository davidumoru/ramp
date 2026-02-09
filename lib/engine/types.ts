import type * as THREE from "three";

export interface Pin {
  id: string;
  origin: THREE.Vector3;
  position: THREE.Vector3;
  handle: THREE.Mesh;
}

export interface WarpConfig {
  radius: number;
  falloff: number;
}

export interface MeshConfig {
  segments: number;
  width: number;
  height: number;
}

export interface SurfacePin {
  id: string;
  origin: THREE.Vector3;
  position: THREE.Vector3;
  handle: THREE.Mesh;
}

export interface SurfaceData {
  id: string;
  corners: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
  textureUrl: string | null;
}

export interface SurfaceConfig {
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
