import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initProgressFallback(): () => void {
  const progress = document.querySelector<HTMLElement>('.progress');
  if (!progress || CSS.supports('animation-timeline: scroll()')) return () => undefined;
  progress.classList.add('progress--fallback');
  const tween = gsap.to(progress, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.documentElement, start: 0, end: 'max', scrub: true },
  });
  return () => { tween.scrollTrigger?.kill(); tween.kill(); progress.classList.remove('progress--fallback'); };
}
