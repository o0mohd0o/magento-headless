'use client';
/**
 * FacebookComments — port of element/facebook_comments.phtml (category: social).
 *
 * Faithful to the Magezon template, which renders the Facebook Comments plugin:
 *
 *   <div class="fb-comments" data-url="..." data-numposts="5" data-width="100%"></div>
 *   <script>...inject https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0...</script>
 *
 * Element fields (from Data/Element/FacebookComments.php):
 *   - page_url  (text)   default "https://www.facebook.com/facebook"
 *       The absolute URL comments are permanently associated with
 *       (rendered as the data-url attribute).
 *   - num_posts (number) default 5
 *       Number of comments shown by default. The PHP casts to int and
 *       falls back to 5 when the value is 0/empty.
 *   data-width is fixed to "100%" in the template.
 *
 * SDK: the official Facebook JS SDK (sdk.js#xfbml=1&version=v3.0) is injected
 * once per page (guarded by element id "facebook-jssdk", exactly like the PHP
 * template). When the SDK is already present we call FB.XFBML.parse() so the
 * plugin renders on client-side navigation too. If the SDK/network is
 * unavailable the empty .fb-comments container is left in place and degrades
 * gracefully.
 */
import React, { useEffect, useRef } from 'react';
import type { MagezonElementProps } from '../types';
import { str } from '../media';

interface FBGlobal {
  XFBML?: { parse?: (el?: Element | null) => void };
}

/** Inject the Facebook SDK <script> once (mirror of the template's IIFE). */
function loadFacebookSdk(): void {
  if (typeof document === 'undefined') return;
  const id = 'facebook-jssdk';
  if (document.getElementById(id)) return;
  const first = document.getElementsByTagName('script')[0];
  const js = document.createElement('script');
  js.id = id;
  js.async = true;
  js.defer = true;
  js.crossOrigin = 'anonymous';
  js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0';
  if (first && first.parentNode) {
    first.parentNode.insertBefore(js, first);
  } else {
    document.head.appendChild(js);
  }
}

export function FacebookComments({ element }: MagezonElementProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const pageUrl = str(element.page_url);

  // Mirror the PHP: (int)num_posts ?: 5.
  const numPostsRaw = parseInt(str(element.num_posts), 10);
  const numPosts = Number.isFinite(numPostsRaw) && numPostsRaw > 0 ? numPostsRaw : 5;

  useEffect(() => {
    loadFacebookSdk();
    // If the SDK is already loaded (e.g. another embed loaded it, or on a
    // client-side route change), ask it to (re)parse this widget.
    const w = window as unknown as { FB?: FBGlobal };
    if (w.FB && w.FB.XFBML && typeof w.FB.XFBML.parse === 'function') {
      w.FB.XFBML.parse(containerRef.current);
    }
  }, [pageUrl, numPosts]);

  return (
    <div ref={containerRef}>
      {/* The SDK requires a #fb-root node to mount into. */}
      <div id="fb-root" />
      <div
        className="fb-comments"
        data-url={pageUrl}
        data-numposts={numPosts}
        data-width="100%"
      />
    </div>
  );
}
