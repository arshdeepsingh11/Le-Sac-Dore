import { parseDims, type Product } from "./data";

/** Usable interior of a bag in cm, sorted largest → smallest (walls, lining and closure take space). */
export function interior(p: Product) {
  const { w, h, d } = parseDims(p.dims);
  return [w * 0.92, h * 0.88, d * 0.85].sort((a, b) => b - a);
}

/** Tightest ratio of an object inside the bag, allowing any rotation (>1 = does not fit). */
export function fitRatio(item: [number, number, number], box: number[]) {
  const s = [...item].sort((a, b) => b - a);
  return Math.max(...s.map((v, i) => v / box[i]));
}

export const fitsInside = (p: Product, item: [number, number, number]) => fitRatio(item, interior(p)) <= 1;
