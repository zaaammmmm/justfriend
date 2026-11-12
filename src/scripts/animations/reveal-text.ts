import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionAllowed } from '../motion';

gsap.registerPlugin(ScrollTrigger);

export async function initRevealText(): Promise<() => void> {
  const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal="lines"]')];
  if (!targets.length || !motionAllowed()) return () => undefined;
  await document.fonts.ready;
  let SplitText: typeof import('gsap/SplitText').SplitText | null = null;
  try {
    const module = await import('gsap/SplitText');
    SplitText = module.SplitText;
    gsap.registerPlugin(SplitText);
  } catch {
    // Fallback tetap mempertahankan judul utuh dan dapat dibaca.
    return () => undefined;
  }

  const splits: InstanceType<typeof import('gsap/SplitText').SplitText>[] = [];
  const tweens: gsap.core.Tween[] = [];
  targets.forEach((target) => {
    const split = new SplitText!(target, { type: 'lines', linesClass: 'reveal-line', mask: 'lines' });
    splits.push(split);
    tweens.push(gsap.from(split.lines, {
      yPercent: 110,
      opacity: 0,
      duration: 0.8,
      stagger: 0.025,
      ease: 'signature',
      scrollTrigger: { trigger: target, start: 'top 86%', once: true },
    }));
  });

  return () => {
    tweens.forEach((tween) => { tween.scrollTrigger?.kill(); tween.kill(); });
    splits.forEach((split) => split.revert());
  };
}
