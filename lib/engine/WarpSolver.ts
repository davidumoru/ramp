import type { Pin, WarpConfig } from "./types";
import type { MeshBuilder } from "./MeshBuilder";

export class WarpSolver {
  private config: WarpConfig;

  constructor(config: WarpConfig) {
    this.config = { ...config };
  }

  /**
   * IDW (Inverse Distance Weighted) interpolation.
   * For each vertex, compute weighted blend of all pin displacements.
   * Writes directly into the geometry's position buffer.
   */
  solve(pins: Pin[], meshBuilder: MeshBuilder): void {
    const posAttr = meshBuilder.getPositionAttribute();
    const base = meshBuilder.getBasePositions();
    const array = posAttr.array as Float32Array;
    const vertexCount = posAttr.count;
    const { radius, falloff } = this.config;

    for (let i = 0; i < vertexCount; i++) {
      const i3 = i * 3;
      const bx = base[i3];
      const by = base[i3 + 1];

      let sumWx = 0;
      let sumWy = 0;
      let sumW = 0;

      for (let p = 0; p < pins.length; p++) {
        const pin = pins[p];
        const ox = pin.origin.x;
        const oy = pin.origin.y;

        const dx = bx - ox;
        const dy = by - oy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= radius) continue;

        const t = 1 - dist / radius;
        const w = Math.pow(t, falloff);

        const offsetX = pin.position.x - pin.origin.x;
        const offsetY = pin.position.y - pin.origin.y;

        sumWx += w * offsetX;
        sumWy += w * offsetY;
        sumW += w;
      }

      if (sumW > 0) {
        array[i3] = bx + sumWx / sumW;
        array[i3 + 1] = by + sumWy / sumW;
      } else {
        array[i3] = bx;
        array[i3 + 1] = by;
      }
    }

    posAttr.needsUpdate = true;
  }

  setRadius(radius: number): void {
    this.config.radius = radius;
  }

  setFalloff(falloff: number): void {
    this.config.falloff = falloff;
  }
}
