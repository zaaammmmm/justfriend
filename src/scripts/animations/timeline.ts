import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionAllowed } from '../motion';

gsap.registerPlugin(ScrollTrigger);

function nearestPathFraction(path: SVGPathElement, item: HTMLElement): number {
  const length = path.getTotalLength();
  const matrix = path.getScreenCTM();
  if (!length || !matrix) return 0;
  const rect = item.querySelector('.timeline-point')?.getBoundingClientRect() ?? item.getBoundingClientRect();
  const targetX = rect.left + rect.width / 2;
  const targetY = rect.top + rect.height / 2;
  const samples = 900;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestFraction = 0;
  for (let index = 0; index <= samples; index += 1) {
    const fraction = index / samples;
    const point = path.getPointAtLength(length * fraction);
    const screen = new DOMPoint(point.x, point.y).matrixTransform(matrix);
    const distance = Math.hypot(screen.x - targetX, screen.y - targetY);
    if (distance < bestDistance) { bestDistance = distance; bestFraction = fraction; }
  }
  return bestFraction;
}

export function initTimeline(): () => void {
  const container = document.querySelector<HTMLElement>('[data-timeline]');
  if (!container) return () => undefined;
  const items = [...container.querySelectorAll<HTMLElement>('[data-timeline-item]')];
  const svg = container.querySelector<SVGSVGElement>(window.matchMedia('(max-width: 639px)').matches ? '.timeline-tall' : '.timeline-wide');
  const path = svg?.querySelector<SVGPathElement>('path');
  if (!svg || !path) return () => undefined;

  if (!motionAllowed()) {
    path.style.strokeDashoffset = '0';
    items.forEach((item) => item.classList.add('is-reached'));
    return () => undefined;
  }

  const fractions = items.map((item) => nearestPathFraction(path, item));
  const tween = gsap.to(path, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top 72%',
      end: 'bottom 68%',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate(self) {
        path.style.strokeDashoffset = String(1 - self.progress);
        items.forEach((item, index) => item.classList.toggle('is-reached', self.progress >= fractions[index]));
      },
    },
  });
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('resize', refresh, { passive: true });
  return () => {
    window.removeEventListener('resize', refresh);
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
