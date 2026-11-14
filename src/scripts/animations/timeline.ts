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
  if (!items.length) return () => undefined;

  let tween: gsap.core.Tween | null = null;
  let path: SVGPathElement | null = null;
  let fractions: number[] = [];
  let frame = 0;

  const build = () => {
    tween?.scrollTrigger?.kill();
    tween?.kill();
    const svg = container.querySelector<SVGSVGElement>(
      window.matchMedia('(max-width: 639px)').matches ? '.timeline-tall' : '.timeline-wide',
    );
    path = svg?.querySelector<SVGPathElement>('path') ?? null;
    if (!path) return;

    if (!motionAllowed()) {
      path.style.strokeDashoffset = '0';
      items.forEach((item) => item.classList.add('is-reached'));
      return;
    }

    fractions = items.map((item) => nearestPathFraction(path!, item));
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = '1';
    tween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top 72%',
        end: 'bottom 68%',
        scrub: 0.35,
        invalidateOnRefresh: true,
        onUpdate(self) {
          if (!path) return;
          path.style.strokeDashoffset = String(1 - self.progress);
          items.forEach((item, index) => item.classList.toggle('is-reached', self.progress >= fractions[index]));
        },
      },
    });
  };

  const refresh = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      build();
      ScrollTrigger.refresh();
    });
  };
  build();
  window.addEventListener('resize', refresh, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', refresh);
    tween?.scrollTrigger?.kill();
    tween?.kill();
  };
}
