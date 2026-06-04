'use client';
/**
 * Pinterest — port of element/pinterest.phtml (category: social embed).
 *
 * Renders the official Pinterest "Pin It" button. The Magezon template emits an
 * <a data-pin-do="buttonPin"> anchor (with data-pin-* attributes) and loads
 * Pinterest's pidget script (//assets.pinterest.com/js/pinit.js). pinit.js then
 * scans the DOM and replaces the anchor with the rendered Pinterest widget.
 *
 * The PHP template also runs a tiny jQuery snippet that rewrites the anchor href
 * to `//pinterest.com/pin/create/button/?url=<current page url>` so the button
 * pins the current page. We reproduce that in an effect using
 * window.location.href, then (re)trigger pinit.js's parser.
 *
 * Element fields (from Data/Element/Pinterest.php):
 *   - show_pin_counts: 'above' | 'beside' | 'not shown'  (default 'above')
 *       -> data-pin-count
 *   - button_round: toggle  -> data-pin-round ('true'|'false'); also picks the
 *       round vs rectangle wrapper class
 *   - button_large: toggle  -> data-pin-tall ('true'|'false'); also picks the
 *       large wrapper class
 *
 * Graceful degradation: if pinit.js cannot load (offline / blocked), the anchor
 * stays in place as a plain link to Pinterest's pin-create page for the current
 * URL, with the official red "Pin It" image as its label — still functional.
 */
import React, { useEffect, useRef } from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

/** Inject //assets.pinterest.com/js/pinit.js once, then resolve. */
let pinitLoader: Promise<void> | null = null;

function loadPinit(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  const w = window as unknown as { PinUtils?: { build?: () => void } };
  if (w.PinUtils) return Promise.resolve();
  if (pinitLoader) return pinitLoader;

  pinitLoader = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('mgz-pinterest-sdk') as HTMLScriptElement | null;
    const onReady = () => resolve();
    const onError = () => reject(new Error('Pinterest pinit.js failed to load'));
    if (existing) {
      existing.addEventListener('load', onReady);
      existing.addEventListener('error', onError);
      return;
    }
    const script = document.createElement('script');
    script.id = 'mgz-pinterest-sdk';
    script.async = true;
    script.defer = true;
    // Protocol-relative in the PHP template; use https for a headless app.
    script.src = 'https://assets.pinterest.com/js/pinit.js';
    script.addEventListener('load', onReady);
    script.addEventListener('error', onError);
    document.head.appendChild(script);
  });
  return pinitLoader;
}

export function Pinterest({ element }: MagezonElementProps) {
  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  // 'above' is the PHP default when show_pin_counts is empty.
  const showPinCounts = str(element.show_pin_counts) || 'above';
  const buttonLarge = bool(element.button_large);
  const buttonRound = bool(element.button_round);

  const wrapperClass = [
    buttonRound ? 'mgz-pinterest-btn-round' : 'mgz-pinterest-btn-rectangle',
    buttonLarge ? 'mgz-pinterest-btn-large' : 'rectangle',
  ].join(' ');

  useEffect(() => {
    // Point the button at the current page (mirrors the template's jQuery).
    if (anchorRef.current) {
      anchorRef.current.href =
        'https://pinterest.com/pin/create/button/?url=' +
        encodeURIComponent(window.location.href);
    }

    let cancelled = false;
    loadPinit()
      .then(() => {
        if (cancelled) return;
        // pinit.js auto-parses on load, but re-run build() to catch anchors
        // mounted after the script was already cached from a prior render.
        const w = window as unknown as { PinUtils?: { build?: () => void } };
        if (w.PinUtils && typeof w.PinUtils.build === 'function') {
          try {
            w.PinUtils.build();
          } catch {
            /* ignore — the unparsed fallback anchor remains usable */
          }
        }
      })
      .catch(() => {
        /* SDK unavailable — the plain fallback anchor stays in place. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span className={wrapperClass}>
      <a
        ref={anchorRef}
        className="mgz-pinterest-btn"
        href="https://pinterest.com/pin/create/button/"
        data-pin-do="buttonPin"
        data-pin-count={showPinCounts}
        data-pin-tall={buttonLarge ? 'true' : 'false'}
        data-pin-round={buttonRound ? 'true' : 'false'}
      >
        <img
          src="https://assets.pinterest.com/images/pidgets/pinit_fg_en_round_red_32.png"
          alt="Pin It"
          title="Pin It"
        />
      </a>
    </span>
  );
}
