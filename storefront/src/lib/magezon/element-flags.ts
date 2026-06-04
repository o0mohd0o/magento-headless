/**
 * element-flags — pure predicates deciding whether an element needs a background
 * layer or client-side behavior.
 *
 * Kept in a NON-'use client' module so the server-rendered <ElementWrapper> can
 * call them. (They used to live in ElementBehavior.tsx, but that is a 'use client'
 * module, and a function exported from a client module becomes a client reference
 * on the server — not callable during RSC render.)
 */
import type { MagezonElement } from './types';
import { str } from './media';

const SCROLL_TYPES = ['scroll', 'scale', 'opacity', 'scroll-opacity', 'scale-opacity'];

/** Whether an element needs any client behavior (animation / parallax / video bg). */
export function needsBehavior(element: MagezonElement): boolean {
  return (
    !!str(element.animation_in) ||
    (str(element.background_type) === 'yt_vm_video' && !!element.background_video) ||
    SCROLL_TYPES.includes(str(element.parallax_type))
  );
}

/** Whether the background/parallax layer should be rendered (bg color/image/video). */
export function needsBgLayer(element: MagezonElement): boolean {
  return (
    !!element.background_color ||
    !!element.background_image ||
    !!element.lg_background_image ||
    !!element.md_background_image ||
    !!element.sm_background_image ||
    !!element.xs_background_image ||
    (str(element.background_type) === 'yt_vm_video' && !!element.background_video)
  );
}
