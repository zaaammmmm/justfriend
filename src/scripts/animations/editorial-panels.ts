import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import { motionAllowed } from '../motion';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';

/** Editorial panel navigation. Uses existing Lenis instance; no cloned DOM/IDs. */
export function initEditorialPanels(lenis: Lenis | null): () => void {
  const panels = gsap.utils.toArray<HTMLElement>('[data-editorial-panel]');
  if (!motionAllowed() || !lenis || panels.length < 2 || !matchMedia(DESKTOP).matches) return () => {};

  const pins: ScrollTrigger[] = [];
  panels.forEach((panel) => {
    // Pin only short, intentionally immersive panels. Never trap tall content.
    if (!panel.hasAttribute('data-panel-pin') || panel.scrollHeight > innerHeight * 1.08) return;
    pins.push(ScrollTrigger.create({
      trigger: panel,
      start: 'top top',
      end: 'bottom top',
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    }));
  });

  // Disabled: keep the user in control of scrolling. The page should not auto-jump to
  // section starts or the next panel while idle.
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('resize', refresh);
  return () => {
    window.removeEventListener('resize', refresh);
    pins.forEach((trigger) => trigger.kill());
  };
}
