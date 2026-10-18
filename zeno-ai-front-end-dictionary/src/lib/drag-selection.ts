export interface DragPoint {
  x: number;
  y: number;
}

export interface DragBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Includes contact with an edge or corner; ignores invalid and empty rows. */
export function segmentHitsBounds(from: DragPoint, to: DragPoint, bounds: DragBounds): boolean {
  if (![from.x, from.y, to.x, to.y, bounds.left, bounds.right, bounds.top, bounds.bottom].every(Number.isFinite)
    || bounds.left >= bounds.right || bounds.top >= bounds.bottom) return false;

  // Clip the segment's parameter range against each axis. Bounding boxes alone
  // would incorrectly include rows beside a diagonal finger movement.
  let enter = 0;
  let exit = 1;
  const axes = [
    [from.x, to.x, bounds.left, bounds.right],
    [from.y, to.y, bounds.top, bounds.bottom],
  ];

  for (const [start, end, minimum, maximum] of axes) {
    const direction = end - start;
    if (direction === 0) {
      if (start < minimum || start > maximum) return false;
      continue;
    }
    const first = (minimum - start) / direction;
    const last = (maximum - start) / direction;
    enter = Math.max(enter, Math.min(first, last));
    exit = Math.min(exit, Math.max(first, last));
    if (enter > exit) return false;
  }

  return true;
}

/** Paints all visited IDs to the same state without toggling repeated visits. */
export function paintSelection<T extends string>(selected: readonly T[], ids: readonly T[], checked: boolean): T[] {
  const next = new Set(selected);
  for (const id of ids) {
    if (checked) next.add(id);
    else next.delete(id);
  }
  return [...next];
}
