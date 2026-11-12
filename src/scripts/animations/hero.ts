import gsap from 'gsap';
import { motionAllowed } from '../motion';

let introPlayed = false;

export function playHeroIntro(): void {
  if (!motionAllowed() || introPlayed) return;
  introPlayed = true;

  const heroPhoto = document.querySelector<HTMLElement>('.hero-photo');
  const letters = gsap.utils.toArray<HTMLElement>('.hero-title-line .letter');
  const polaroids = gsap.utils.toArray<HTMLElement>('.polaroid');
  const cue = document.querySelector<HTMLElement>('.hero-bottomline');

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (heroPhoto) {
    gsap.set(heroPhoto, {
      scale: 1.18,
      opacity: 0,
      filter: 'blur(18px) saturate(0.65)',
      transformOrigin: 'center center',
    });
    timeline.to(heroPhoto, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px) saturate(1)',
      duration: 1.5,
    }, 0);
  }

  if (letters.length) {
    gsap.set(letters, {
      opacity: 0,
      yPercent: 118,
      filter: 'blur(12px)',
      rotateX: 48,
      transformPerspective: 1000,
    });
    timeline.to(letters, {
      opacity: 1,
      yPercent: 0,
      rotateX: 0,
      filter: 'blur(0px)',
      duration: 1.1,
      stagger: 0.04,
      ease: 'expo.out',
    }, 0.15);
  }

  if (polaroids.length) {
    gsap.set(polaroids, {
      opacity: 0,
      y: 64,
      x: 18,
      rotate: 6,
      scale: 0.9,
      filter: 'blur(8px)',
    });
    timeline.to(polaroids, {
      opacity: 1,
      y: 0,
      x: 0,
      rotate: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1.2,
      stagger: 0.08,
      ease: 'expo.out',
    }, 0.4);
  }

  if (cue) {
    gsap.set(cue, { opacity: 0, y: 18, scale: 0.96 });
    timeline.to(cue, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: 'power2.out',
    }, 1.05);
  }
}

export async function initHeroInteractions(): Promise<() => void> {
  if (!motionAllowed()) return () => undefined;
  const stage = document.querySelector<HTMLElement>('#heroStage');
  if (!stage) return () => undefined;

  const cleanups: Array<() => void> = [];
  const title = document.querySelector<HTMLElement>('#hero-title');
  if (title && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const letters = [...title.querySelectorAll<HTMLElement>('.letter')];
    const quick = letters.map((letter) => gsap.quickTo(letter, 'y', { duration: 0.35, ease: 'signature' }));
    const onMove = (event: PointerEvent) => {
      const rects = letters.map((letter) => letter.getBoundingClientRect());
      const writes: Array<{ index: number; y: number }> = [];
      rects.forEach((rect, index) => {
        const distance = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2));
        const amount = Math.max(0, 1 - distance / 200);
        writes.push({ index, y: -5 * amount * amount });
      });
      writes.forEach(({ index, y }) => quick[index](y));
    };
    const onLeave = () => quick.forEach((setY) => setY(0));
    title.addEventListener('pointermove', onMove);
    title.addEventListener('pointerleave', onLeave);
    cleanups.push(() => { title.removeEventListener('pointermove', onMove); title.removeEventListener('pointerleave', onLeave); gsap.killTweensOf(letters); });
  } else if (title) {
    const letters = [...title.querySelectorAll<HTMLElement>('.letter')];
    const onScroll = () => {
      const rect = title.getBoundingClientRect();
      const progress = gsap.utils.clamp(0, 1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height));
      letters.forEach((letter, index) => { letter.style.setProperty('--scroll-lift', `${Math.sin(progress * Math.PI + index * 0.12) * 1.5}px`); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener('scroll', onScroll));
  }

  const wrappers = gsap.utils.toArray<HTMLElement>('.polaroid', stage);
  const onWrapperEnter = (event: Event) => {
    const wrapper = event.currentTarget as HTMLElement;
    gsap.to(wrapper, { rotate: 0, duration: 0.3, ease: 'signature', overwrite: 'auto' });
  };
  const onWrapperLeave = (event: Event) => {
    const wrapper = event.currentTarget as HTMLElement;
    gsap.to(wrapper, { rotate: Number.parseFloat(getComputedStyle(wrapper).getPropertyValue('--rot')) || 0, duration: 0.45, ease: 'signature', overwrite: 'auto' });
  };
  wrappers.forEach((wrapper) => {
    wrapper.addEventListener('pointerenter', onWrapperEnter);
    wrapper.addEventListener('pointerleave', onWrapperLeave);
  });
  cleanups.push(() => wrappers.forEach((wrapper) => { wrapper.removeEventListener('pointerenter', onWrapperEnter); wrapper.removeEventListener('pointerleave', onWrapperLeave); }));

  try {
    const [{ Draggable }, { InertiaPlugin }] = await Promise.all([import('gsap/Draggable'), import('gsap/InertiaPlugin')]);
    if (!motionAllowed()) return () => cleanups.forEach((cleanup) => cleanup());
    gsap.registerPlugin(Draggable, InertiaPlugin);
    const draggables = wrappers.map((wrapper) => {
      const target = wrapper.querySelector<HTMLElement>('[data-draggable]');
      if (!target) return null;
      const instance = Draggable.create(target, {
        type: 'x,y', bounds: stage, inertia: true, zIndexBoost: false,
        onPress() {
          gsap.set(wrapper, { zIndex: 20 });
          gsap.to(target, { scale: 1.04, duration: 0.2, ease: 'signature' });
        },
        onDrag: () => updateTilt(target, InertiaPlugin),
        onThrowUpdate: () => updateTilt(target, InertiaPlugin),
        onRelease() { gsap.to(target, { scale: 1, duration: 0.25, ease: 'signature' }); },
        onThrowComplete() {
          gsap.to(target, { rotation: 0, scale: 1, duration: 0.45, ease: 'signature' });
          gsap.set(wrapper, { clearProps: 'zIndex' });
        },
      })[0];
      const onKeyDown = (event: KeyboardEvent) => {
        const directions: Record<string, [number, number]> = { ArrowLeft: [-14, 0], ArrowRight: [14, 0], ArrowUp: [0, -14], ArrowDown: [0, 14] };
        const direction = directions[event.key];
        if (!direction) return;
        event.preventDefault();
        gsap.to(target, { x: `+=${direction[0]}`, y: `+=${direction[1]}`, duration: 0.25, ease: 'signature', onComplete: () => instance.applyBounds(stage) });
      };
      target.addEventListener('keydown', onKeyDown);
      return { kill: () => { target.removeEventListener('keydown', onKeyDown); instance.kill(); gsap.killTweensOf([target, wrapper]); } };
    }).filter(Boolean) as Array<{ kill: () => void }>;
    cleanups.push(() => draggables.forEach((draggable) => draggable.kill()));
  } catch {
    stage.dataset.dragFallback = 'true';
  }

  return () => cleanups.forEach((cleanup) => cleanup());
}

function updateTilt(target: HTMLElement, inertia: typeof import('gsap/InertiaPlugin').InertiaPlugin): void {
  const velocity = inertia.getVelocity(target, 'x') || 0;
  gsap.to(target, { rotation: gsap.utils.clamp(-6, 6, velocity / 250), duration: 0.35, ease: 'signature', overwrite: 'auto' });
}
