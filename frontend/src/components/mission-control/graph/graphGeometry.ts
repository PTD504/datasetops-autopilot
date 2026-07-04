export interface Point {
  x: number;
  y: number;
}

export interface Box {
  x: number; // center x
  y: number; // center y
  w: number;
  h: number;
}

export type AnchorType =
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left"
  | "top-left"
  | "top"
  | "top-right"
  | number; // Angle in degrees

/**
 * Calculates the intersection of a ray from the box center at a given angle
 * with the bounding box boundaries (circumference of the box).
 */
export function getAnchorPoint(box: Box, angleDegrees: number): Point {
  // Convert angle to standard Cartesian coordinates (adjusting for SVG y-down coordinate space)
  const theta = (angleDegrees * Math.PI) / 180;
  const dx = Math.cos(theta);
  const dy = Math.sin(theta);

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Avoid division by zero
  const tX = absDx > 1e-6 ? (box.w / 2) / absDx : Infinity;
  const tY = absDy > 1e-6 ? (box.h / 2) / absDy : Infinity;

  const t = Math.min(tX, tY);

  return {
    x: box.x + t * dx,
    y: box.y + t * dy,
  };
}

/**
 * Resolves a named or numeric anchor to a Point.
 */
export function resolveAnchor(box: Box, anchor: AnchorType): Point {
  let angle = 0;
  if (typeof anchor === "number") {
    angle = anchor;
  } else {
    switch (anchor) {
      case "right":
        angle = 0;
        break;
      case "bottom-right":
        angle = 45;
        break;
      case "bottom":
        angle = 90;
        break;
      case "bottom-left":
        angle = 135;
        break;
      case "left":
        angle = 180;
        break;
      case "top-left":
        angle = 225;
        break;
      case "top":
        angle = 270;
        break;
      case "top-right":
        angle = 315;
        break;
    }
  }
  return getAnchorPoint(box, angle);
}
