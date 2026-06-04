'use client';
/**
 * TwitterButton — port of element/twitter_button.phtml (category: social embed).
 *
 * Renders the official Twitter/X intent anchor (twitter-share-button,
 * twitter-follow-button, twitter-hashtag-button, twitter-mention-button) and
 * loads platform.twitter.com/widgets.js once per page so widgets.js upgrades
 * the anchor into the rendered button. If the SDK never loads (offline / blocked
 * / X deprecated the endpoint), the plain anchor stays clickable as a fallback.
 *
 * Element fields (from Data/Element/TwitterButton.php). All optional; defaults
 * mirror the PHP `defaultValue`s:
 *   - button_type: 'share' | 'follow' | 'hashtag' | 'mention'  (default 'share')
 *   - lang: ISO code for data-lang                              (default 'en')
 *   - large_button: toggle -> data-size="large"                 (default true)
 *
 *   share:
 *     - page_url (toggle, default true) -> use current page URL to share
 *     - share_use_custom_url            -> data-url (only when page_url is off)
 *     - share_text_page_title (toggle, default true) -> use page title as text
 *     - share_text_custom_text          -> data-text (only when page_title off)
 *     - share_via                       -> data-via
 *     - share_recommend                 -> data-related
 *     - share_hashtag                   -> data-hashtags
 *
 *   follow:
 *     - follow_user                     -> @username (required; else nothing)
 *     - follow_show_username (toggle, default true) -> data-show-screen-name
 *     - show_followers_count (toggle, default true) -> data-show-count
 *
 *   hashtag:
 *     - hashtag_hash                    -> #hashtag (required; else nothing)
 *     - hashtag_tweet_text              -> &text= in the intent href
 *     - hashtag_tweet_url               -> data-url
 *     - hashtag_recommend_1/2           -> data-related (comma joined)
 *
 *   mention:
 *     - mention_tweet_to                -> @username (required; else nothing)
 *     - mention_tweet_text              -> &text= in the intent href
 *     - mention_recommend_1/2           -> data-related (comma joined)
 *
 * Headless note: the PHP `page_url`/`share_text_page_title` toggles relied on
 * Magento knowing the current page server-side. Here we leave data-url/data-text
 * unset in that case, which is exactly how widgets.js behaves — it falls back to
 * the page's own URL and <title> at render time on the client.
 */
import React, { useEffect, useRef } from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

const WIDGETS_SRC = 'https://platform.twitter.com/widgets.js';
/** Twitter's own canonical script id (matches the .phtml inline loader). */
const WIDGETS_ID = 'twitter-wjs';

interface TwttrGlobal {
  widgets?: { load?: (el?: HTMLElement | null) => void };
}

/** Inject widgets.js once, then resolve when twttr.widgets is available. */
function loadWidgets(): Promise<TwttrGlobal | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const w = window as unknown as { twttr?: TwttrGlobal };
  if (w.twttr && w.twttr.widgets) return Promise.resolve(w.twttr);

  return new Promise((resolve) => {
    const finish = () => {
      const t = (window as unknown as { twttr?: TwttrGlobal }).twttr || null;
      resolve(t);
    };
    const existing = document.getElementById(WIDGETS_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', finish);
      existing.addEventListener('error', () => resolve(null));
      // Script may already be loaded but twttr not yet attached — poll briefly.
      finish();
      return;
    }
    const script = document.createElement('script');
    script.id = WIDGETS_ID;
    script.async = true;
    script.src = WIDGETS_SRC;
    script.addEventListener('load', finish);
    script.addEventListener('error', () => resolve(null));
    document.head.appendChild(script);
  });
}

/** Mirror toggle defaults: undefined means the PHP defaultValue=true applies. */
function toggle(value: unknown, fallback = true): boolean {
  return value === undefined || value === null || value === '' ? fallback : bool(value);
}

export function TwitterButton({ element }: MagezonElementProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);

  const type = str(element.button_type) || 'share';
  const lang = str(element.lang) || 'en';
  const large = toggle(element.large_button); // defaultValue true

  // Build href + visible text + data-* attributes exactly like the .phtml.
  const dataAttrs: Record<string, string> = { 'data-lang': lang };
  if (large) dataAttrs['data-size'] = 'large';

  let href = '';
  let text = '';

  if (type === 'share') {
    text = 'Tweet';
    href = 'https://twitter.com/share';
    // PHP: only set data-url when page_url toggle is OFF and a custom url exists.
    const usePageUrl = toggle(element.page_url); // default true
    const customUrl = str(element.share_use_custom_url);
    if (!usePageUrl && customUrl) dataAttrs['data-url'] = customUrl;

    const usePageTitle = toggle(element.share_text_page_title); // default true
    const customText = str(element.share_text_custom_text);
    if (!usePageTitle && customText) dataAttrs['data-text'] = customText;

    const via = str(element.share_via);
    if (via) dataAttrs['data-via'] = via;
    const related = str(element.share_recommend);
    if (related) dataAttrs['data-related'] = related;
    const hashtags = str(element.share_hashtag);
    if (hashtags) dataAttrs['data-hashtags'] = hashtags;
  } else if (type === 'follow') {
    const followUser = str(element.follow_user);
    if (followUser) {
      href = 'https://twitter.com/' + followUser;
      dataAttrs['data-show-count'] = toggle(element.show_followers_count) ? 'true' : 'false';
      const showName = toggle(element.follow_show_username); // default true
      dataAttrs['data-show-screen-name'] = showName ? 'true' : 'false';
      text = showName ? `Follow @${followUser}` : 'Follow';
    }
  } else if (type === 'hashtag') {
    const hashtagHash = str(element.hashtag_hash);
    if (hashtagHash) {
      text = `Tweet #${hashtagHash}`;
      href = 'https://twitter.com/intent/tweet?button_hashtag=' + hashtagHash;
      const tweetUrl = str(element.hashtag_tweet_url);
      if (tweetUrl) dataAttrs['data-url'] = tweetUrl;
      const tweetText = str(element.hashtag_tweet_text);
      if (tweetText) href += '&text=' + tweetText;
      const related: string[] = [];
      const r1 = str(element.hashtag_recommend_1);
      const r2 = str(element.hashtag_recommend_2);
      if (r1) related.push(r1);
      if (r2) related.push(r2);
      if (related.length) dataAttrs['data-related'] = related.join(',');
    }
  } else if (type === 'mention') {
    const mentionTo = str(element.mention_tweet_to);
    if (mentionTo) {
      text = `Tweet to @${mentionTo}`;
      href = 'https://twitter.com/intent/tweet?screen_name=' + mentionTo;
      const tweetText = str(element.mention_tweet_text);
      if (tweetText) href += '&text=' + tweetText;
      const related: string[] = [];
      const r1 = str(element.mention_recommend_1);
      const r2 = str(element.mention_recommend_2);
      if (r1) related.push(r1);
      if (r2) related.push(r2);
      if (related.length) dataAttrs['data-related'] = related.join(',');
    }
  }

  // Load widgets.js once on mount, then upgrade this anchor specifically.
  useEffect(() => {
    if (!href) return;
    let cancelled = false;
    loadWidgets()
      .then((twttr) => {
        if (cancelled) return;
        // widgets.load(scope) re-scans the subtree and renders the button.
        if (twttr && twttr.widgets && twttr.widgets.load) {
          twttr.widgets.load(rootRef.current);
        }
      })
      .catch(() => {
        /* SDK unavailable — the plain <a> below remains a usable fallback. */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href]);

  // Match the PHP guard: no href -> render nothing (e.g. follow with no user).
  if (!href) return null;

  return (
    <span className="mgz-twitter-button" ref={rootRef}>
      <a href={href} className={`twitter-${type}-button`} {...dataAttrs}>
        {text}
      </a>
    </span>
  );
}