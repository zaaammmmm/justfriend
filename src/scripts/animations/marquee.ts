import gsap from 'gsap';
import type Lenis from 'lenis';
import { motionAllowed } from '../motion';

export function initMarquee(lenis: Lenis | null): () => void {
  const rows = [...document.querySelectorAll<HTMLElement>('[data-marquee]')];
  const pauseButton = document.querySelector<HTMLButtonElement>('#pauseMarquee');
  if (!rows.length || !motionAllowed()) return () => undefined;

  const timelines: gsap.core.Tween[] = [];
  const cleanupRows: Array<() => void> = [];
  let pausedByButton = false;

  rows.forEach((row) => {
    const inner = row.querySelector<HTMLElement>('.marquee-inner');
    if (!inner) return;
    const reverse = row.dataset.reverse === 'true' ? -1 : 1;
    const tween = gsap.to(inner, { xPercent: -50, ease: 'none', duration: 30, repeat: -1 });
    timelines.push(tween);
    let direction = 1;
    let boost = 1;
    let hovering = false;
    let visible = true;

    const onEnter = () => { hovering = true; };
    const onLeave = () => { hovering = false; };
    row.addEventListener('pointerenter', onEnter);
    row.addEventListener('pointerleave', onLeave);

    const update = ({ velocity }: { velocity: number }) => {
      if (Math.abs(velocity) > 0.2) direction = Math.sign(velocity);
      boost = Math.min(4, 1 + Math.abs(velocity) * 0.2);
    };
    lenis?.on('scroll', update);

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(row);
    const tick = () => {
      boost += (1 - boost) * 0.05;
      if (pausedByButton || !visible) { tween.pause(); return; }
      tween.paused(false);
      const target = reverse * direction * boost * (hovering ? 0.2 : 1);
      tween.timeScale(gsap.utils.interpolate(tween.timeScale(), target, 0.12));
    };
    gsap.ticker.add(tick);
    cleanupRows.push(() => {
      row.removeEventListener('pointerenter', onEnter);
      row.removeEventListener('pointerleave', onLeave);
      observer.disconnect();
      lenis?.off('scroll', update);
      gsap.ticker.remove(tick);
    });
  });

  const onPause = () => {
    pausedByButton = !pausedByButton;
    pauseButton?.setAttribute('aria-pressed', String(pausedByButton));
    if (pauseButton) pauseButton.textContent = pausedByButton ? '▶ Lanjutkan tulisan' : 'Ⅱ  Jeda tulisan';
    if (pausedByButton) timelines.forEach((timeline) => timeline.pause());
    else timelines.forEach((timeline) => timeline.paused(false));
  };
  pauseButton?.addEventListener('click', onPause);
  return () => {
    pauseButton?.removeEventListener('click', onPause);
    cleanupRows.forEach((cleanup) => cleanup());
    timelines.forEach((timeline) => timeline.kill());
  };
}
