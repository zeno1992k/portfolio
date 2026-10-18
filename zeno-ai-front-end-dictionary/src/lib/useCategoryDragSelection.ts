import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import type { CategoryGroupId } from '../data/categories';
import { paintSelection, segmentHitsBounds, type DragPoint } from './drag-selection';

interface SelectionGesture {
  pointerId: number;
  start: DragPoint;
  previous: DragPoint;
  current: DragPoint;
  button: HTMLButtonElement;
  initial: CategoryGroupId[];
  selected: CategoryGroupId[];
  checked: boolean;
  active: boolean;
}

const pointOf = (event: PointerEvent): DragPoint => ({ x: event.clientX, y: event.clientY });

export function useCategoryDragSelection(selected: CategoryGroupId[], onChange: (ids: CategoryGroupId[]) => void) {
  const listRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<SelectionGesture | null>(null);
  const suppressClickRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const frameTimeRef = useRef(0);
  const onChangeRef = useRef(onChange);
  const [dragging, setDragging] = useState(false);
  onChangeRef.current = onChange;

  function paintCrossedRows(gesture: SelectionGesture, from: DragPoint, to: DragPoint) {
    const list = listRef.current;
    if (!list) return;
    const viewport = (list.closest('.app-scroll') ?? list).getBoundingClientRect();
    const crossed: CategoryGroupId[] = [];
    for (const row of list.querySelectorAll<HTMLElement>('[data-drag-select-row]')) {
      const bounds = row.getBoundingClientRect();
      if (segmentHitsBounds(from, to, {
        left: Math.max(bounds.left, viewport.left), right: Math.min(bounds.right, viewport.right),
        top: Math.max(bounds.top, viewport.top), bottom: Math.min(bounds.bottom, viewport.bottom),
      })) crossed.push(row.dataset.dragSelectRow as CategoryGroupId);
    }
    const next = paintSelection(gesture.selected, crossed, gesture.checked);
    if (next.length === gesture.selected.length && next.every((id, index) => id === gesture.selected[index])) return;
    gesture.selected = next;
    onChangeRef.current(next);
  }

  function stopFrame() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    frameTimeRef.current = 0;
  }

  function scrollAtEdge(time: number) {
    const gesture = gestureRef.current;
    const list = listRef.current;
    if (!gesture?.active || !list) return;
    const scroll = list.closest<HTMLElement>('.app-scroll');
    if (scroll) {
      const bounds = scroll.getBoundingClientRect();
      const { x, y } = gesture.current;
      const elapsed = frameTimeRef.current ? Math.min(time - frameTimeRef.current, 32) : 1000 / 60;
      if (x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom) {
        const edge = 40;
        const strength = y < bounds.top + edge ? -(1 - (y - bounds.top) / edge)
          : y > bounds.bottom - edge ? 1 - (bounds.bottom - y) / edge : 0;
        const previousTop = scroll.scrollTop;
        scroll.scrollTop += strength * 420 * elapsed / 1000;
        if (scroll.scrollTop !== previousTop) paintCrossedRows(gesture, gesture.current, gesture.current);
      }
    }
    frameTimeRef.current = time;
    frameRef.current = requestAnimationFrame(scrollAtEdge);
  }

  function endGesture(commit: boolean) {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    stopFrame();
    setDragging(false);
    if (!gesture) return;
    if (gesture.active && !commit) onChangeRef.current(gesture.initial);
    if (gesture.button.hasPointerCapture(gesture.pointerId)) gesture.button.releasePointerCapture(gesture.pointerId);
  }

  function moveGesture(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const current = pointOf(event);
    gesture.current = current;
    if (!gesture.active) {
      if (Math.hypot(current.x - gesture.start.x, current.y - gesture.start.y) < 8) return;
      gesture.active = true;
      suppressClickRef.current = true;
      setDragging(true);
      frameRef.current = requestAnimationFrame(scrollAtEdge);
    }
    paintCrossedRows(gesture, gesture.previous, current);
    gesture.previous = current;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || gestureRef.current) return;
    suppressClickRef.current = false;
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button[data-drag-select-id]') : null;
    if (!target || !listRef.current?.contains(target)) return;
    target.setPointerCapture(event.pointerId);
    const start = pointOf(event);
    gestureRef.current = {
      pointerId: event.pointerId, start, previous: start, current: start, button: target,
      initial: [...selected], selected: [...selected], checked: !selected.includes(target.dataset.dragSelectId as CategoryGroupId), active: false,
    };
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (gestureRef.current?.pointerId !== event.pointerId) return;
    moveGesture(event);
    endGesture(true);
  }

  function onPointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (gestureRef.current?.pointerId === event.pointerId) endGesture(false);
  }

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (suppressClickRef.current && event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
    }
    suppressClickRef.current = false;
  }

  useEffect(() => {
    const cancel = () => endGesture(false);
    const onVisibilityChange = () => { if (document.hidden) cancel(); };
    window.addEventListener('blur', cancel);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('blur', cancel);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      const gesture = gestureRef.current;
      gestureRef.current = null;
      stopFrame();
      if (gesture?.button.hasPointerCapture(gesture.pointerId)) gesture.button.releasePointerCapture(gesture.pointerId);
    };
  }, []);

  return {
    listRef, dragging,
    handlers: {
      onPointerDown, onPointerMove: moveGesture, onPointerUp, onPointerCancel,
      onLostPointerCapture: onPointerCancel, onClickCapture,
      onKeyDownCapture: () => { suppressClickRef.current = false; endGesture(false); },
    },
  };
}
