import { motionAllowed } from './motion';

const activeVideos = new Set<HTMLVideoElement>();
const visibleVideos = new Set<HTMLVideoElement>();

export function stopAllVideos(): void {
  activeVideos.forEach(stop);
}

function stop(video: HTMLVideoElement): void {
  video.pause();
  delete video.dataset.playing;
  activeVideos.delete(video);
}

function removeSources(video: HTMLVideoElement): void {
  video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((source) => source.removeAttribute('src'));
  delete video.dataset.loaded;
  delete video.dataset.playing;
  video.load();
}

export function initAmbientVideos(): () => void {
  const videos = [...document.querySelectorAll<HTMLVideoElement>('video[data-ambient]')];
  if (!videos.length || !motionAllowed()) return () => undefined;

  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return () => undefined;

  const maxConcurrent = window.matchMedia('(max-width: 1023px)').matches ? 1 : 2;
  let disposed = false;

  const start = async (video: HTMLVideoElement) => {
    if (disposed || activeVideos.has(video)) return;
    if (!video.dataset.loaded) {
      video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((source) => {
        source.src = source.dataset.src ?? '';
      });
      video.load();
      video.dataset.loaded = 'true';
    }
    while (activeVideos.size >= maxConcurrent) {
      const oldest = activeVideos.values().next().value as HTMLVideoElement | undefined;
      if (!oldest) break;
      stop(oldest);
    }
    activeVideos.add(video);
    try {
      await video.play();
      if (disposed || !video.isConnected) return stop(video);
      video.dataset.playing = 'true';
    } catch {
      stop(video);
      removeSources(video);
      video.dataset.fallback = 'poster';
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting) { visibleVideos.add(video); void start(video); }
      else { visibleVideos.delete(video); stop(video); }
    });
  }, { rootMargin: '200px 0px', threshold: 0.25 });

  videos.forEach((video) => observer.observe(video));
  const onVisibility = () => {
    if (document.hidden) activeVideos.forEach(stop);
    else videos.forEach((video) => { const rect = video.getBoundingClientRect(); if (rect.bottom > -200 && rect.top < innerHeight + 200) void start(video); });
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    disposed = true;
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    videos.forEach((video) => { stop(video); removeSources(video); });
    visibleVideos.clear();
  };
}
