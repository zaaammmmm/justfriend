import gsap from 'gsap';
import { motionAllowed } from '../motion';

export function initHeroParallax(): () => void {
  const hero = document.querySelector<HTMLElement>('#hero');
  const layers = [...document.querySelectorAll<HTMLElement>('[data-parallax-layer]')];
  if (!hero || !layers.length || !motionAllowed()) return () => undefined;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const quick = layers.map((layer) => ({
    x: gsap.quickTo(layer, 'x', { duration: 0.7, ease: 'signature' }),
    y: gsap.quickTo(layer, 'y', { duration: 0.7, ease: 'signature' }),
  }));
  const onPointer = (event: PointerEvent) => {
    if (!fine) return;
    const rect = hero.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    layers.forEach((layer, index) => {
      const depth = Number(layer.dataset.depth ?? 1);
      quick[index].x(nx * -18 * depth);
      quick[index].y(ny * -12 * depth);
    });
  };
  const onScroll = () => {
    if (fine) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(-1, Math.min(1, -rect.top / Math.max(1, rect.height)));
    layers.forEach((layer, index) => {
      const depth = Number(layer.dataset.depth ?? 1);
      quick[index].y(Math.max(-24, Math.min(24, progress * 24 * depth)));
    });
  };
  hero.addEventListener('pointermove', onPointer);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    hero.removeEventListener('pointermove', onPointer);
    window.removeEventListener('scroll', onScroll);
    layers.forEach((layer) => gsap.killTweensOf(layer));
  };
}
