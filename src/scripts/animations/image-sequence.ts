import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ImageSequenceConfig = {
  urls: string[];
  canvas: string | HTMLCanvasElement;
  clear?: boolean;
  scrollTrigger?: ScrollTrigger.Vars;
  fps?: number;
  paused?: boolean;
  onUpdate?: (index: number, image: HTMLImageElement) => void;
};

export function imageSequence(config: ImageSequenceConfig): gsap.core.Tween {
  const playhead = { frame: 0 };
  const canvas = typeof config.canvas === 'string'
    ? document.querySelector<HTMLCanvasElement>(config.canvas)
    : config.canvas;

  if (!canvas) {
    return gsap.to(playhead, { frame: 0, paused: true });
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return gsap.to(playhead, { frame: 0, paused: true });
  }

  let currentFrame = -1;

  const updateImage = () => {
    const frame = Math.round(playhead.frame);
    if (frame === currentFrame) return;

    const image = images[Math.min(frame, images.length - 1)] ?? images[0];
    if (!image || !image.complete) return;

    const progress = images.length > 1 ? frame / (images.length - 1) : 0;
    const drawWidth = canvas.width * (1.08 + progress * 0.18);
    const drawHeight = canvas.height * (1.08 + progress * 0.18);
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2 - progress * 26;

    config.clear && ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `contrast(${1.08 + progress * 0.18}) saturate(${1.12 + progress * 0.2}) brightness(${1.03 + progress * 0.08})`;
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    ctx.filter = 'none';

    currentFrame = frame;
    config.onUpdate?.(frame, image);
  };

  const images = config.urls.map((url, index) => {
    const image = new Image();
    image.src = url;
    if (index === 0) image.onload = updateImage;
    return image;
  });

  return gsap.to(playhead, {
    frame: images.length - 1,
    ease: 'none',
    duration: images.length / (config.fps || 30),
    paused: !!config.paused,
    onUpdate: updateImage,
    scrollTrigger: config.scrollTrigger,
  });
}

export function initImageSequenceSection(): () => void {
  const section = document.querySelector<HTMLElement>('#image-sequence-section');
  const canvas = document.querySelector<HTMLCanvasElement>('#image-sequence');

  if (!section || !canvas) return () => undefined;

  const urls = Array.from({ length: 12 }, (_, index) => `/images/place-placeholder.jpg?frame=${index}`);
  const tween = imageSequence({
    urls,
    canvas,
    clear: true,
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.2,
      invalidateOnRefresh: true,
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
