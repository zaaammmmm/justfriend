import type Lenis from 'lenis';
import { motionAllowed } from './motion';

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

async function criticalAssetsReady(): Promise<void> {
  const heroImage = new Image();
  heroImage.src = '/images/place-placeholder.jpg';
  const imageReady = heroImage.decode?.().catch(() => undefined) ?? Promise.resolve();
  await Promise.all([document.fonts?.ready ?? Promise.resolve(), imageReady]);
}

export function runSplash(lenis: Lenis | null, onIntroStart: () => void): void {
  const splash = document.querySelector<HTMLElement>('#splash');
  if (!splash) return;

  const reduced = !motionAllowed();
  let seen = false;
  try { seen = sessionStorage.getItem('rk-splash-seen') === '1'; } catch { /* mode privat */ }

  let completed = false;
  let unlockTimer = 0;
  const unlock = () => {
    if (unlockTimer) window.clearTimeout(unlockTimer);
    lenis?.start();
    document.documentElement.classList.remove('has-intro');
  };

  if (reduced) {
    window.setTimeout(() => {
      splash.classList.add('is-exit');
      window.setTimeout(() => splash.remove(), 250);
    }, 80);
    return;
  }

  lenis?.stop();
  unlockTimer = window.setTimeout(unlock, 2500);

  const finish = async () => {
    if (completed) return;
    completed = true;
    splash.classList.add('is-exit');
    onIntroStart();
    try { sessionStorage.setItem('rk-splash-seen', '1'); } catch { /* mode privat */ }

    await new Promise<void>((resolve) => {
      const fallback = window.setTimeout(resolve, 1600);
      splash.addEventListener('transitionend', (event) => {
        const transition = event as TransitionEvent;
        if (event.target === splash && transition.propertyName === 'opacity') {
          window.clearTimeout(fallback);
          resolve();
        }
      }, { once: true });
    });
    splash.remove();
    document.documentElement.classList.remove('has-intro');
    unlock();
  };

  const skip = () => { void finish(); };
  splash.querySelector('[data-skip-intro]')?.addEventListener('click', skip, { once: true });
  window.addEventListener('pointerdown', skip, { once: true, capture: true });
  window.addEventListener('keydown', skip, { once: true, capture: true });

  const minimum = seen ? 300 : 900;
  void Promise.race([
    Promise.all([criticalAssetsReady(), wait(minimum)]),
    wait(2200),
  ]).then(() => finish());
}
