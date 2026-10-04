/** Allow an out-of-bounds mass to move back toward the drag region without snapping. */
export function constrainSpringDragPosition(current: number, requested: number): number {
  return Math.max(Math.min(-5, current), Math.min(Math.max(5, current), requested));
}
