import gsap from 'gsap';
import { motionAllowed } from '../motion';

export async function initMembers(): Promise<() => void> {
  if (!motionAllowed()) return () => undefined;
  const members = [...document.querySelectorAll<HTMLElement>('[data-member]')];
  if (!members.length) return () => undefined;
  const cleanups: Array<() => void> = [];
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let Flip: typeof import('gsap/Flip').Flip | null = null;
  let DrawSVGPlugin: typeof import('gsap/DrawSVGPlugin').DrawSVGPlugin | null = null;
  try {
    const modules = await Promise.all([import('gsap/Flip'), import('gsap/DrawSVGPlugin')]);
    Flip = modules[0].Flip;
    DrawSVGPlugin = modules[1].DrawSVGPlugin;
    gsap.registerPlugin(Flip, DrawSVGPlugin);
  } catch {
    // Hover/tap tetap berfungsi dengan CSS bila plugin tambahan tidak tersedia.
  }

  members.forEach((member) => {
    const photo = member.querySelector<HTMLElement>('.member-photo');
    const signature = member.querySelector<SVGPathElement>('.signature-path');
    if (photo && finePointer) {
      const xTo = gsap.quickTo(photo, 'x', { duration: 0.4, ease: 'signature' });
      const yTo = gsap.quickTo(photo, 'y', { duration: 0.4, ease: 'signature' });
      const rotationTo = gsap.quickTo(photo, 'rotation', { duration: 0.4, ease: 'signature' });
      const onMove = (event: PointerEvent) => {
        const rect = member.getBoundingClientRect();
        const width = photo.getBoundingClientRect().width || 100;
        const height = photo.getBoundingClientRect().height || 130;
        const x = gsap.utils.clamp(0, rect.width - width, event.clientX - rect.left - width / 2);
        const y = gsap.utils.clamp(0, rect.height - height, event.clientY - rect.top - height / 2);
        xTo(x - (rect.width - width));
        yTo(y - (rect.height - height) / 2);
        rotationTo(gsap.utils.clamp(-8, 8, event.movementX * 0.3));
      };
      const onEnter = () => {
        gsap.to(photo, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.5, ease: 'signature' });
        if (signature && DrawSVGPlugin) gsap.fromTo(signature, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'signature' });
      };
      const onLeave = () => {
        gsap.to(photo, { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0.65, duration: 0.5, ease: 'signature' });
        xTo(0); yTo(0); rotationTo(0);
      };
      member.addEventListener('pointermove', onMove);
      member.addEventListener('pointerenter', onEnter);
      member.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        member.removeEventListener('pointermove', onMove);
        member.removeEventListener('pointerenter', onEnter);
        member.removeEventListener('pointerleave', onLeave);
        gsap.killTweensOf(photo);
      });
    }

    const onFocus = () => {
      member.classList.add('is-focused');
      if (photo) gsap.to(photo, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.5, ease: 'signature' });
      if (signature && DrawSVGPlugin) gsap.fromTo(signature, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'signature' });
    };
    const onBlur = () => {
      member.classList.remove('is-focused');
      if (photo && finePointer) gsap.to(photo, { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0.65, duration: 0.5, ease: 'signature' });
    };
    member.addEventListener('focus', onFocus);
    member.addEventListener('blur', onBlur);
    cleanups.push(() => { member.removeEventListener('focus', onFocus); member.removeEventListener('blur', onBlur); });

    if (!finePointer) {
      const toggle = () => {
        if (!Flip) {
          member.classList.toggle('is-expanded');
          member.setAttribute('aria-expanded', String(member.classList.contains('is-expanded')));
          return;
        }
        const state = Flip.getState(member);
        const expanded = !member.classList.contains('is-expanded');
        member.classList.toggle('is-expanded', expanded);
        member.setAttribute('aria-expanded', String(expanded));
        Flip.from(state, { duration: 0.55, ease: 'signature', scale: true, absolute: false, nested: true });
      };
      const onClick = () => toggle();
      member.addEventListener('click', onClick);
      cleanups.push(() => member.removeEventListener('click', onClick));
    }
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
