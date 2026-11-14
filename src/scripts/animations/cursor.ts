import gsap from 'gsap';
import { motionAllowed } from '../motion';

export function initLabelCursor(): () => void {
  const cursor = document.querySelector<HTMLElement>('#cursorLabel');
  if (!cursor || !motionAllowed() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => undefined;
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3.out' });
  const onMove = (event: PointerEvent) => { xTo(event.clientX + 18); yTo(event.clientY + 18); };
  const onEnter = (event: Event) => {
    const target = event.currentTarget as HTMLElement;
    cursor.textContent = target.dataset.cursor ?? 'lihat';
    cursor.classList.add('is-visible');
  };
  const onLeave = () => cursor.classList.remove('is-visible');
  const targets = [...document.querySelectorAll<HTMLElement>('[data-cursor]')];
  window.addEventListener('pointermove', onMove, { passive: true });
  targets.forEach((target) => { target.addEventListener('pointerenter', onEnter); target.addEventListener('pointerleave', onLeave); });
  return () => {
    window.removeEventListener('pointermove', onMove);
    targets.forEach((target) => { target.removeEventListener('pointerenter', onEnter); target.removeEventListener('pointerleave', onLeave); });
    cursor.classList.remove('is-visible');
  };
}
