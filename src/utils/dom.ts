export function qs<T extends HTMLElement>(root: Document | HTMLElement, selector: string): T {
  const el = root.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el as T;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
