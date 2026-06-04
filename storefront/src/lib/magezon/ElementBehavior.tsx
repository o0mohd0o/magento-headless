'use client';
/**
 * ElementBehavior — client-side behaviors for an element's wrapper:
 *   1. Scroll animation (animation_in): plays an animate.css-style keyframe when
 *      the element scrolls into view (IntersectionObserver). Progressive
 *      enhancement — armed only after mount, so no-JS keeps content visible.
 *   2. Video background (background_type = yt_vm_video): injects a covering
 *      YouTube/Vimeo iframe or local <video> into the .mgz-parallax layer.
 *   3. Parallax (parallax_type scroll/scale/opacity/...): transforms the
 *      .mgz-parallax-inner on scroll.
 *
 * Rendered (as an invisible marker) by ElementWrapper ONLY when the element needs
 * one of these, so the vast majority of elements stay fully server-rendered.
 */
import React, { useEffect, useRef } from 'react';
import type { MagezonElement } from './types';
import { bool, str } from './media';

const SCROLL_TYPES = ['scroll', 'scale', 'opacity', 'scroll-opacity', 'scale-opacity'];

function youTubeId(url: string): string {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(url) ? url : '';
}
function vimeoId(url: string): string {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return m[1];
  return /^\d+$/.test(url) ? url : '';
}

export function ElementBehavior({ element }: { element: MagezonElement }) {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = marker.current?.closest('.mgz-element') as HTMLElement | null;
    if (!el) return;
    const cleanups: Array<() => void> = [];

    // 1. Scroll animation -------------------------------------------------
    const animIn = str(element.animation_in);
    if (animIn) {
      el.classList.add('mgz-anim-armed');
      const delay = parseFloat(str(element.animation_delay));
      if (delay) el.style.animationDelay = `${delay}s`;
      const infinite = bool(element.animation_infinite);
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              el.classList.add('mgz-in');
              if (!infinite) io.unobserve(el);
            } else if (infinite) {
              el.classList.remove('mgz-in');
            }
          }
        },
        { threshold: 0.15 },
      );
      io.observe(el);
      cleanups.push(() => io.disconnect());
    }

    // 2. Video background -------------------------------------------------
    const bgType = str(element.background_type);
    const bgVideo = str(element.background_video);
    if (bgType === 'yt_vm_video' && bgVideo) {
      const layer = el.querySelector('.mgz-parallax') as HTMLElement | null;
      if (layer && !layer.querySelector('.mgz-bg-video, iframe')) {
        const yt = youTubeId(bgVideo);
        const vm = !yt ? vimeoId(bgVideo) : '';
        if (yt) {
          const iframe = document.createElement('iframe');
          const params = new URLSearchParams({
            autoplay: '1', mute: '1', controls: '0', loop: '1', playlist: yt,
            playsinline: '1', modestbranding: '1', rel: '0',
          });
          if (element.video_start_time) params.set('start', str(element.video_start_time));
          iframe.src = `https://www.youtube.com/embed/${yt}?${params.toString()}`;
          iframe.allow = 'autoplay; encrypted-media';
          iframe.setAttribute('aria-hidden', 'true');
          layer.appendChild(iframe);
        } else if (vm) {
          const iframe = document.createElement('iframe');
          iframe.src = `https://player.vimeo.com/video/${vm}?autoplay=1&muted=1&loop=1&background=1`;
          iframe.allow = 'autoplay';
          iframe.setAttribute('aria-hidden', 'true');
          layer.appendChild(iframe);
        } else {
          const v = document.createElement('video');
          v.className = 'mgz-bg-video';
          v.autoplay = true;
          v.muted = true;
          v.loop = true;
          v.playsInline = true;
          v.src = bgVideo;
          layer.appendChild(v);
        }
      }
    }

    // 3. Parallax ---------------------------------------------------------
    const parallaxType = str(element.parallax_type);
    if (SCROLL_TYPES.includes(parallaxType)) {
      const inner = el.querySelector('.mgz-parallax-inner') as HTMLElement | null;
      if (inner) {
        const speed = parseFloat(str(element.parallax_speed)) || 0.3;
        let raf = 0;
        const onScroll = () => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            const progress = (rect.top + rect.height / 2 - vh / 2) / vh; // -1..1
            let transform = '';
            if (parallaxType.includes('scroll')) transform += ` translateY(${(-progress * speed * 100).toFixed(1)}px)`;
            if (parallaxType.includes('scale')) transform += ` scale(${(1 + Math.abs(progress) * speed * 0.5).toFixed(3)})`;
            inner.style.transform = transform.trim();
            if (parallaxType.includes('opacity')) inner.style.opacity = String(Math.max(0, 1 - Math.abs(progress)).toFixed(2));
          });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
        cleanups.push(() => {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
          cancelAnimationFrame(raf);
        });
      }
    }

    return () => cleanups.forEach((c) => c());
  }, [element]);

  return <span ref={marker} style={{ display: 'none' }} aria-hidden="true" />;
}

// needsBehavior / needsBgLayer moved to ./element-flags (a non-'use client'
// module) so the server-rendered ElementWrapper can call them. Re-exported here
// for any existing importers.
export { needsBehavior, needsBgLayer } from './element-flags';
