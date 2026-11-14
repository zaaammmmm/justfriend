import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionAllowed } from './motion';

gsap.registerPlugin(ScrollTrigger);

export interface SmoothScrollHandle {
  lenis: Lenis | null;
  destroy: () => void;
}

export function initSmoothScroll(): SmoothScrollHandle {
  if (!motionAllowed()) return { lenis: null, destroy: () => undefined };

  const lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    destroy() {
      gsap.ticker.remove(tick);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    },
  };
}
