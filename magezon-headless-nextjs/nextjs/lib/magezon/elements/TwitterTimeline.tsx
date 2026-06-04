'use client';
/**
 * TwitterTimeline — port of element/twitter_timeline.phtml (category: social).
 *
 * Faithful to the Magezon template, which renders a single embedded-timeline
 * anchor:
 *
 *   <a class="twitter-timeline"
 *      href="{page_url}"
 *      data-show-replies data-tweet-limit data-width data-height
 *      data-theme data-chrome data-border-color data-lang></a>
 *
 * and then loads Twitter/X's `platform.twitter.com/widgets.js` once. That SDK
 * scans the DOM for `.twitter-timeline` anchors and replaces each with the live
 * timeline iframe, reading the `data-*` attributes for configuration.
 *
 * Element fields (from Data/Element/TwitterTimeline.php):
 *   - page_url      Timeline URL (default "https://twitter.com/magezonvn")
 *   - box_width     -> data-width
 *   - box_height    -> data-height (default 600)
 *   - limit         Number of tweets -> data-tweet-limit
 *   - show_replies  toggle -> data-show-replies ("true"/"false")
 *   - chrome        noheader|nofooter|noborders|transparent|noscrollbar
 *                   -> data-chrome (a space-separated list of these)
 *   - theme         light|dark (default light) -> data-theme
 *   - border_color  hex color -> data-border-color (run through getStyleColor:
 *                   a bare hex like "1da1f2" is prefixed with "#")
 *   - lang          BCP-47 language code (empty = automatic) -> data-lang
 *
 * SDK loading: the widgets.js <script> is injected at most once per page
 * (guarded by id). After it loads — and on every re-mount, since SPA navigation
 * means the SDK is already present — we call `window.twttr.widgets.load(node)`
 * to (re)scan this anchor. If the network/SDK is unavailable the anchor degrades
 * gracefully to a plain text link to the timeline.
 *
 * No jQuery; self-contained.
 */
import React, { useEffect, useRef } from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

const WIDGETS_SCRIPT_ID = 'twitter-wjs';
const WIDGETS_SRC = 'https://platform.twitter.com/widgets.js';

interface TwttrGlobal {
  twttr?: {
    widgets?: {
      load?: (element?: HTMLElement) => void;
    };
  };
}

/**
 * Inject widgets.js once, then resolve. If it is already present (typical after
 * SPA navigation) resolve immediately.
 */
function loadTwitterWidgets(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  const w = window as unknown as TwttrGlobal;
  if (w.twttr && w.twttr.widgets) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(WIDGETS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if ((window as unknown as TwttrGlobal).twttr) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('widgets.js error')));
      }
      return;
    }
    const script = document.createElement('script');
    script.id = WIDGETS_SCRIPT_ID;
    script.async = true;
    script.src = WIDGETS_SRC;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('widgets.js error')));
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  });
}

/** Mirror Builder\Helper\Data::getStyleColor() for a hex border color. */
function styleColor(value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (v === 'transparent') return v;
  if (v.startsWith('#') || v.startsWith('rgb')) return v;
  return `#${v}`;
}

export function TwitterTimeline({ element }: MagezonElementProps) {
  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  const pageUrl = str(element.page_url) || 'https://twitter.com/magezonvn';
  const showReplies = bool(element.show_replies);
  const limit = str(element.limit);
  const width = str(element.box_width);
  const height = str(element.box_height) || '600';
  const chrome = str(element.chrome);
  const theme = str(element.theme) || 'light';
  const borderColor = styleColor(str(element.border_color));
  const lang = str(element.lang);

  useEffect(() => {
    if (!pageUrl) return;
    let cancelled = false;

    loadTwitterWidgets()
      .then(() => {
        if (cancelled) return;
        const w = window as unknown as TwttrGlobal;
        // (Re)scan this anchor so SPA navigation also renders the timeline.
        if (w.twttr && w.twttr.widgets && typeof w.twttr.widgets.load === 'function') {
          w.twttr.widgets.load(anchorRef.current || undefined);
        }
      })
      .catch(() => {
        /* SDK/network unavailable — the plain-text fallback link stays. */
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageUrl, showReplies, limit, width, height, chrome, theme, borderColor, lang]);

  if (!pageUrl) return null;

  return (
    <a
      ref={anchorRef}
      className="twitter-timeline"
      href={pageUrl}
      data-show-replies={showReplies ? 'true' : 'false'}
      {...(limit ? { 'data-tweet-limit': limit } : {})}
      {...(width ? { 'data-width': width } : {})}
      {...(height ? { 'data-height': height } : {})}
      data-theme={theme}
      {...(chrome ? { 'data-chrome': chrome } : {})}
      {...(borderColor ? { 'data-border-color': borderColor } : {})}
      {...(lang ? { 'data-lang': lang } : {})}
      target="_blank"
      rel="noopener noreferrer"
    >
      {/* Fallback shown until widgets.js replaces this anchor with the timeline. */}
      Tweets
    </a>
  );
}