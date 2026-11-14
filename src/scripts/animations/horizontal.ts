import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import * as THREE from 'three';
import { motionAllowed } from '../motion';

gsap.registerPlugin(ScrollTrigger, Flip);

const scrollVelocity = { v: 0, s: 0 };
const clamp = gsap.utils.clamp(-2000, 2000);
let velocityController: ScrollTrigger | null = null;

function ensureVelocityController(): void {
  if (velocityController) return;

  velocityController = ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    onUpdate(self) {
      const raw = clamp(self.getVelocity());
      const norm = raw / 1000;
      const strength = Math.min(1, Math.abs(norm));

      if (Math.abs(strength) > Math.abs(scrollVelocity.s)) {
        scrollVelocity.v = norm;
        scrollVelocity.s = strength;
        gsap.to(scrollVelocity, {
          v: 0,
          s: 0,
          duration: 0.8,
          ease: 'sine.inOut',
          overwrite: true,
        });
      }
    },
  });
}

export function initGalleryShaders(): () => void {
  const figures = [...document.querySelectorAll<HTMLElement>('.gallery-item')];
  if (!figures.length || !motionAllowed()) return () => undefined;

  ensureVelocityController();

  const cleanups: Array<() => void> = [];

  figures.forEach((figure) => {
    const image = figure.querySelector<HTMLImageElement>('img');
    if (!image) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'gallery-shader-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    figure.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // High DPR is expensive for a decorative effect; keep it bounded.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uTextureSize: { value: new THREE.Vector2(1, 1) },
      uQuadSize: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uScrollVelocity: { value: 0 },
      uVelocityStrength: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec2 vUvCover;
        uniform vec2 uTextureSize;
        uniform vec2 uQuadSize;

        void main() {
          vUv = uv;

          float texRatio = uTextureSize.x / uTextureSize.y;
          float quadRatio = uQuadSize.x / uQuadSize.y;
          vec2 scale = vec2(1.0);
          if (quadRatio > texRatio) {
            scale.y = texRatio / quadRatio;
          } else {
            scale.x = quadRatio / texRatio;
          }
          vUvCover = vUv * scale + (1.0 - scale) * 0.5;

          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform sampler2D uTexture;
        uniform vec2 uTextureSize;
        uniform vec2 uQuadSize;
        uniform float uTime;
        uniform float uScrollVelocity;
        uniform float uVelocityStrength;

        varying vec2 vUv;
        varying vec2 vUvCover;

        void main() {
          vec2 texCoords = vUvCover;
          float amt = 0.03 * uVelocityStrength;

          float t = uTime * 0.8;
          texCoords.y += sin((texCoords.x * 8.0) + t) * amt;
          texCoords.x += cos((texCoords.y * 6.0) - t * 0.8) * amt * 0.6;

          float dir = sign(uScrollVelocity);
          vec2 tc = texCoords;

          float r = texture2D(uTexture, tc + vec2(amt * 0.5 * dir, 0.0)).r;
          float g = texture2D(uTexture, tc + vec2(amt * 0.25 * dir, 0.0)).g;
          float b = texture2D(uTexture, tc + vec2(-amt * 0.35 * dir, 0.0)).b;

          gl_FragColor = vec4(r, g, b, 1.0);
        }
      `,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let texture: THREE.Texture | null = null;

    const layout = () => {
      const rect = figure.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      renderer.setSize(width, height, false);
      uniforms.uQuadSize.value.set(width, height);
    };

    let lastFrameTime = performance.now();
    let visible = false;
    const tick = (now: number) => {
      if (!visible || !texture) return;
      // Clamp delta after tab switches to avoid a large shader time jump.
      const delta = Math.min((now - lastFrameTime) * 0.001, 0.05);
      lastFrameTime = now;
      uniforms.uTime.value += delta;
      uniforms.uScrollVelocity.value = scrollVelocity.v;
      uniforms.uVelocityStrength.value = scrollVelocity.s;
      renderer.render(scene, camera);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      lastFrameTime = performance.now();
      if (visible && texture) renderer.render(scene, camera);
    }, { rootMargin: '120px', threshold: 0.01 });
    visibility.observe(figure);

    const handleTexture = (loadedTexture: THREE.Texture) => {
      texture = loadedTexture;
      texture.colorSpace = THREE.SRGBColorSpace;
      uniforms.uTexture.value = texture;
      const textureImage = texture.image as { width: number; height: number };
      uniforms.uTextureSize.value.set(textureImage.width, textureImage.height);
      layout();
    };

    const resizeObserver = new ResizeObserver(() => layout());
    resizeObserver.observe(figure);
    window.addEventListener('resize', layout);
    gsap.ticker.add(tick);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(image.currentSrc || image.src, handleTexture);

    cleanups.push(() => {
      gsap.ticker.remove(tick);
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', layout);
      if (texture) texture.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      canvas.remove();
    });
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

export function initBentoGallery(): () => void {
  const gallery = document.querySelector<HTMLElement>('#gallery-scrubbed');
  const items = gallery ? [...gallery.querySelectorAll<HTMLElement>('.gallery__item')] : [];
  if (!gallery || !items.length || !motionAllowed()) return () => undefined;

  let flipCtx: gsap.Context | null = null;

  const build = () => {
    const galleryItems = [...gallery.querySelectorAll<HTMLElement>('.gallery__item')];
    if (!galleryItems.length) return;

    flipCtx?.revert();
    gallery.classList.remove('gallery--final');

    flipCtx = gsap.context(() => {
      gallery.classList.add('gallery--final');
      const flipState = Flip.getState(galleryItems);
      gallery.classList.remove('gallery--final');

      const flip = Flip.to(flipState, {
        simple: true,
        absolute: true,
        duration: 1.15,
        ease: 'expo.inOut',
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: gallery,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
          pin: gallery.parentElement ?? undefined,
          invalidateOnRefresh: true,
        },
      });

      tl.add(flip);
      return () => {
        gsap.set(galleryItems, { clearProps: 'all' });
      };
    }, gallery);
  };

  build();

  const handleResize = () => build();
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    flipCtx?.revert();
    gallery.classList.remove('gallery--final');
  };
}

export function initHorizontalGallery(lenis: Lenis | null): () => void {
  const section = document.querySelector<HTMLElement>('.gallery-section');
  const track = section?.querySelector<HTMLElement>('[data-horizontal-gallery]');
  if (!section || !track || !motionAllowed() || !window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return () => undefined;

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 64);
  if (distance() <= 0) return () => undefined;

  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      pin: true,
      scrub: true,
      end: () => `+=${distance()}`,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
  const trigger = tween.scrollTrigger;

  const images = [...track.querySelectorAll<HTMLImageElement>('img')];
  const parallaxTweens = images.map((image) => gsap.to(image, {
    xPercent: -12,
    ease: 'none',
    scrollTrigger: {
      trigger: image.closest('.gallery-item') ?? image,
      containerAnimation: tween,
      start: 'left right',
      end: 'right left',
      scrub: true,
    },
  }));

  const onFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    const item = target.closest<HTMLElement>('.gallery-item');
    if (!item || !trigger) return;
    const max = distance();
    const ratio = gsap.utils.clamp(0, 1, (item.offsetLeft - window.innerWidth * 0.1) / max);
    const y = trigger.start + ratio * (trigger.end - trigger.start);
    // Hindari browser menggeser overflow horizontal secara terpisah dari pin vertikal.
    track.scrollLeft = 0;
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo({ top: y, behavior: 'auto' });
  };
  track.addEventListener('focusin', onFocus);

  const progress = section.querySelector<HTMLElement>('.gallery-progress span');
  const progressTrigger = ScrollTrigger.create({
    trigger: section,
    start: () => trigger?.start ?? 'top top',
    end: () => trigger?.end ?? 'bottom bottom',
    onUpdate(self) { if (progress) progress.style.transform = `scaleX(${self.progress})`; },
  });

  const refreshAfterImages = () => ScrollTrigger.refresh();
  images.forEach((image) => image.addEventListener('load', refreshAfterImages, { once: true }));

  return () => {
    track.removeEventListener('focusin', onFocus);
    images.forEach((image) => image.removeEventListener('load', refreshAfterImages));
    parallaxTweens.forEach((item) => { item.scrollTrigger?.kill(); item.kill(); });
    progressTrigger.kill();
    trigger?.kill();
    tween.kill();
    if (progress) progress.style.transform = 'scaleX(0)';
  };
}
