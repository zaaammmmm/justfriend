import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionAllowed } from '../motion';

gsap.registerPlugin(ScrollTrigger);

export function initStackCards(): () => void {
  const cards = [...document.querySelectorAll<HTMLElement>('.stack-card')];
  if (!cards.length || !motionAllowed() || CSS.supports('animation-timeline: view()')) return () => undefined;
  const tweens: gsap.core.Tween[] = [];
  cards.forEach((card, index) => {
    const next = cards[index + 1];
    const inner = card.querySelector<HTMLElement>('.stack-card__inner');
    if (!next || !inner) return;
    tweens.push(gsap.to(inner, {
      scale: 0.94,
      opacity: 0.7,
      ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 40%', scrub: true, invalidateOnRefresh: true },
    }));
  });
  return () => tweens.forEach((tween) => { tween.scrollTrigger?.kill(); tween.kill(); });
}
