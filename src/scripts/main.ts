import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll, type SmoothScrollHandle } from './smooth-scroll';
import { motionAllowed, setManualMotionReduced, syncMotionControl, systemPrefersReducedMotion } from './motion';
import { runSplash } from './splash';
import { playHeroIntro, stopHeroIntro, initHeroInteractions } from './animations/hero';
import { initHeroParallax } from './animations/hero-parallax';
import { initMembers } from './animations/members';
import { initTimeline } from './animations/timeline';
import { initStackCards } from './animations/stack-cards';
import { initMarquee } from './animations/marquee';
import { initGalleryShaders, initHorizontalGallery, initBentoGallery } from './animations/horizontal';
import { initRevealText } from './animations/reveal-text';
import { initLabelCursor } from './animations/cursor';
import { initProgressFallback } from './fallbacks';
import { initEditorialPanels } from './animations/editorial-panels';
import { initImageSequenceSection } from './animations/image-sequence';
import { initAmbientVideos, stopAllVideos } from './video';

gsap.registerPlugin(ScrollTrigger);

const cleanups: Array<() => void> = [];
let smooth: SmoothScrollHandle | null = null;
let motionInitialized = false;

function addAsyncCleanup(promise: Promise<() => void>): void {
  void promise.then((cleanup) => {
    if (motionAllowed() && motionInitialized) cleanups.push(cleanup);
    else cleanup();
  }).catch((error: unknown) => {
    console.warn('Animasi opsional tidak dapat diinisialisasi.', error);
  });
}

function teardownMotion(): void {
  motionInitialized = false;
  stopHeroIntro();
  cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
  smooth?.destroy();
  smooth = null;
  stopAllVideos();
}

function setupMotion(): void {
  if (!motionAllowed() || motionInitialized) return;
  motionInitialized = true;
  smooth = initSmoothScroll();
  cleanups.push(initProgressFallback());
  cleanups.push(initEditorialPanels(smooth.lenis));
  cleanups.push(initTimeline());
  cleanups.push(initStackCards());
  cleanups.push(initMarquee(smooth.lenis));
  cleanups.push(initBentoGallery());
  cleanups.push(initHorizontalGallery(smooth.lenis));
  cleanups.push(initGalleryShaders());
  cleanups.push(initHeroParallax());
  cleanups.push(initLabelCursor());
  cleanups.push(initImageSequenceSection());
  cleanups.push(initAmbientVideos());
  addAsyncCleanup(initHeroInteractions());
  addAsyncCleanup(initMembers());
  addAsyncCleanup(initRevealText());
  const refreshController = new AbortController();
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true, signal: refreshController.signal });
  document.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    image.addEventListener('load', () => ScrollTrigger.refresh(), { once: true, signal: refreshController.signal });
  });
  cleanups.push(() => refreshController.abort());
}

function clearMomentHash(): void {
  if (location.hash.startsWith('#momen-')) {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
  }
}

function initMomentDialogs(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#momentDialog');
  const videoDialog = document.querySelector<HTMLDialogElement>('#videoDialog');
  if (!dialog || !videoDialog) return;

  let lastMomentTrigger: HTMLElement | null = null;
  let lastVideoTrigger: HTMLElement | null = null;
  let activeStoryVideo: HTMLVideoElement | null = null;

  const openMoment = (trigger: HTMLElement) => {
    const slug = trigger.dataset.openMoment;
    if (!slug) return;
    const titleNode = document.querySelector<HTMLElement>('#dialogTitle');
    const dateNode = document.querySelector<HTMLElement>('#dialogDate');
    const storyNode = document.querySelector<HTMLElement>('#dialogStory');
    if (titleNode) titleNode.textContent = trigger.dataset.title ?? 'Catatan kenangan';
    if (dateNode) dateNode.textContent = trigger.dataset.date ?? '';
    if (storyNode) storyNode.textContent = trigger.dataset.story ?? '';
    lastMomentTrigger = trigger;
    if (!dialog.open) dialog.showModal();
    history.replaceState(null, '', `#momen-${slug}`);
    smooth?.lenis?.stop();
    if (dateNode && motionAllowed()) {
      gsap.fromTo(dateNode, { scale: 1.4, rotation: -2 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'signature', overwrite: 'auto' });
    }
  };

  document.querySelectorAll<HTMLElement>('[data-open-moment]').forEach((trigger) => {
    trigger.addEventListener('click', () => openMoment(trigger));
  });

  document.querySelectorAll<HTMLButtonElement>('.dialog-close').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog')?.close());
  });

  dialog.addEventListener('close', () => {
    clearMomentHash();
    if (motionAllowed()) smooth?.lenis?.start();
    lastMomentTrigger?.focus();
    lastMomentTrigger = null;
  });

  videoDialog.addEventListener('close', () => {
    activeStoryVideo?.pause();
    activeStoryVideo?.querySelectorAll('source').forEach((source) => source.removeAttribute('src'));
    activeStoryVideo?.removeAttribute('src');
    activeStoryVideo?.load();
    activeStoryVideo = null;
    document.querySelector('#storyVideoMount')?.replaceChildren();
    const transcript = document.querySelector<HTMLElement>('#videoTranscript');
    if (transcript) transcript.textContent = '';
    if (motionAllowed()) smooth?.lenis?.start();
    lastVideoTrigger?.focus();
    lastVideoTrigger = null;
  });

  document.querySelectorAll<HTMLButtonElement>('[data-story-video]').forEach((button) => {
    button.addEventListener('click', () => {
      lastVideoTrigger = button;
      const titleNode = document.querySelector<HTMLElement>('#videoDialogTitle');
      const mount = document.querySelector<HTMLElement>('#storyVideoMount');
      const transcriptNode = document.querySelector<HTMLElement>('#videoTranscript');
      if (titleNode) titleNode.textContent = button.dataset.videoTitle ?? 'Video kenangan';
      if (!mount) return;
      mount.replaceChildren();
      if (transcriptNode) transcriptNode.textContent = '';

      if (button.dataset.videoReady !== 'true') {
        const note = document.createElement('p');
        note.textContent = 'Sumber video belum ditambahkan. Poster tetap ditampilkan sampai file video yang telah disetujui tersedia.';
        mount.append(note);
      } else {
        const video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.playsInline = true;
        video.width = 1280;
        video.height = 720;
        video.className = 'story-video';
        if (button.dataset.webm) {
          const webm = document.createElement('source');
          webm.src = button.dataset.webm;
          webm.type = 'video/webm';
          video.append(webm);
        }
        const mp4 = document.createElement('source');
        mp4.src = button.dataset.mp4 ?? '';
        mp4.type = 'video/mp4';
        video.append(mp4);
        if (button.dataset.captions) {
          const track = document.createElement('track');
          track.kind = 'captions';
          track.src = button.dataset.captions;
          track.srclang = 'id';
          track.label = 'Bahasa Indonesia';
          track.default = true;
          video.append(track);
        }
        mount.append(video);
        activeStoryVideo = video;
      }
      if (transcriptNode && button.dataset.transcript) {
        transcriptNode.textContent = `Transkrip: ${button.dataset.transcript}`;
      }
      videoDialog.showModal();
      smooth?.lenis?.stop();
    });
  });

  const openFromHash = () => {
    const match = location.hash.match(/^#momen-(.+)$/);
    if (!match || dialog.open) return;
    const slug = decodeURIComponent(match[1]);
    const trigger = document.querySelector<HTMLElement>(`[data-open-moment="${CSS.escape(slug)}"]`);
    if (trigger) window.setTimeout(() => openMoment(trigger), 100);
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
}

function initFloatingHeader(): void {
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;

  const updateHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  window.addEventListener('resize', updateHeaderState);
}

function initGlobalControls(): void {
  const toggle = document.querySelector<HTMLButtonElement>('#motionToggle');
  syncMotionControl();
  if (systemPrefersReducedMotion() && toggle) {
    toggle.disabled = true;
    toggle.title = 'Gerak dikurangi mengikuti pengaturan perangkat.';
  }
  toggle?.addEventListener('click', () => {
    if (systemPrefersReducedMotion()) return;
    setManualMotionReduced(motionAllowed());
  });

  document.addEventListener('rk:motionchange', () => {
    syncMotionControl();
    if (motionAllowed()) {
      setupMotion();
      playHeroIntro();
    } else {
      teardownMotion();
    }
  });

  document.querySelector<HTMLButtonElement>('#shareBtn')?.addEventListener('click', async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const payload = { title: document.title, text: 'Sebuah arsip kecil tentang kita.', url: location.href };
    try {
      if (navigator.share) await navigator.share(payload);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(location.href);
        button.textContent = 'Tautan disalin ✓';
        window.setTimeout(() => { button.textContent = 'Bagikan ↗'; }, 1800);
      }
    } catch {
      // Pengguna membatalkan dialog berbagi atau browser menolak clipboard.
    }
  });

  const secret = document.querySelector<HTMLButtonElement>('[data-secret-photo]');
  const secretNote = document.querySelector<HTMLElement>('#photoSecretNote');
  let taps = 0;
  secret?.addEventListener('click', () => {
    taps += 1;
    if (taps < 5 || !secretNote) return;
    secretNote.hidden = false;
    secret.setAttribute('aria-label', 'Catatan rahasia telah dibuka.');
    secret.disabled = true;
    if (motionAllowed()) gsap.fromTo(secretNote, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'drop' });
  });
}

function boot(): void {
  initFloatingHeader();
  setupMotion();
  runSplash(smooth?.lenis ?? null, playHeroIntro);
  initMomentDialogs();
  initGlobalControls();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
