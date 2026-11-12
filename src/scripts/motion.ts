import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';

gsap.registerPlugin(CustomEase, CustomBounce);
CustomEase.create('signature', '0.22, 1, 0.36, 1');
CustomEase.create('cinema', '0.77, 0, 0.175, 1');
CustomBounce.create('drop', { strength: 0.1, squash: 0 });

const REDUCE_KEY = 'rk-reduce-motion';

export function systemPrefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function manualMotionReduced(): boolean {
  try {
    return sessionStorage.getItem(REDUCE_KEY) === '1';
  } catch {
    return false;
  }
}

export function motionAllowed(): boolean {
  return !systemPrefersReducedMotion() && !manualMotionReduced();
}

export function setManualMotionReduced(reduced: boolean): void {
  try {
    sessionStorage.setItem(REDUCE_KEY, reduced ? '1' : '0');
  } catch {
    // Penyimpanan sesi dapat ditolak di mode privat; preferensi tetap berlaku sampai halaman dimuat ulang.
  }
  document.body.classList.toggle('reduce-motion', reduced || systemPrefersReducedMotion());
  window.dispatchEvent(new CustomEvent('rk:motionchange', { detail: { allowed: motionAllowed() } }));
}

export function syncMotionControl(): void {
  const button = document.querySelector<HTMLButtonElement>('#motionToggle');
  if (!button) return;
  const reduced = !motionAllowed();
  button.setAttribute('aria-pressed', String(reduced));
  button.textContent = reduced ? 'Gerak dikurangi' : 'Kurangi gerak';
  if (systemPrefersReducedMotion()) {
    button.title = 'Gerak dikurangi mengikuti pengaturan perangkat.';
  }
}
