'use client';
/**
 * FacebookLike — port of element/facebook_like.phtml (category: social).
 *
 * The PHP template renders the official Facebook Like-button XFBML tag
 *   <div class="mgz-fb-like fb-like" data-href data-layout data-size
 *        data-action data-show-faces data-share></div>
 * and injects the Facebook JS SDK (connect.facebook.net/.../sdk.js#xfbml=1)
 * exactly once (guarded by the "facebook-jssdk" script id). The SDK then scans
 * the DOM for .fb-* tags and replaces them with the rendered widget.
 *
 * Element fields (from Data/Element/FacebookLike.php):
 *   - btn_url        -> data-href. Empty means "like the current page url"
 *                       (the SDK falls back to window.location when omitted).
 *   - btn_layout     -> data-layout (standard | box_count | button_count |
 *                       button). default "standard".
 *   - btn_action     -> data-action (like | recommend). default "like".
 *   - btn_size       -> data-size (small | large). default "small".
 *   - btn_show_faces -> data-show-faces (toggle, default true).
 *   - btn_share      -> data-share (toggle, default true).
 *
 * Faithful behaviour:
 *   - Attributes are only emitted when set (mirrors the PHP `if (...)` guards),
 *     except show-faces/share which are always emitted as "true"/"false" with
 *     the Data/Element defaults of true.
 *   - The SDK <script> is injected once per page, guarded by the same
 *     "facebook-jssdk" id used by Magezon, so it cooperates with any other
 *     facebook_* element on the page.
 *   - After (re)mount we ask FB.XFBML.parse() to (re)render this widget once the
 *     SDK is ready, so client-side navigation still renders the button.
 *   - Degrades gracefully: if the SDK never loads (blocked/offline) the empty
 *     .fb-like container is simply left in place, exactly like the PHP output.
 */
import React, { useEffect, useRef } from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

const FB_SDK_ID = 'facebook-jssdk';
const FB_SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0';

interface FBGlobal {
  XFBML?: { parse: (el?: Element) => void };
}

/** Inject the Facebook SDK once per page, mirroring the phtml's id guard. */
function ensureFacebookSdk(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FB_SDK_ID)) return;

  // Facebook expects an #fb-root anchor; create it if the host page lacks one.
  if (!document.getElementById('fb-root')) {
    const root = document.createElement('div');
    root.id = 'fb-root';
    document.body.insertBefore(root, document.body.firstChild);
  }

  const first = document.getElementsByTagName('script')[0];
  const js = document.createElement('script');
  js.id = FB_SDK_ID;
  js.async = true;
  js.defer = true;
  js.src = FB_SDK_SRC;
  if (first && first.parentNode) {
    first.parentNode.insertBefore(js, first);
  } else {
    document.head.appendChild(js);
  }
}

export function FacebookLike({ element }: MagezonElementProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Mirror the phtml's conditional data-* assignment.
  const href = str(element.btn_url);
  const layout = str(element.btn_layout);
  const size = str(element.btn_size);
  const action = str(element.btn_action);

  // Toggles default to true (Data/Element defaultValue) when the field is absent.
  const showFaces = element.btn_show_faces === undefined ? true : bool(element.btn_show_faces);
  const share = element.btn_share === undefined ? true : bool(element.btn_share);

  useEffect(() => {
    ensureFacebookSdk();

    let cancelled = false;
    const node = ref.current;

    const parse = () => {
      if (cancelled || !node) return;
      const fb = (window as unknown as { FB?: FBGlobal }).FB;
      if (fb && fb.XFBML && typeof fb.XFBML.parse === 'function') {
        try {
          fb.XFBML.parse(node);
        } catch {
          /* SDK present but parse failed — leave the static markup. */
        }
        return true;
      }
      return false;
    };

    // Try immediately (SDK may already be loaded from another fb element),
    // otherwise poll briefly until the async SDK finishes loading.
    if (!parse()) {
      const start = Date.now();
      const timer = window.setInterval(() => {
        if (cancelled || parse() || Date.now() - start > 8000) {
          window.clearInterval(timer);
        }
      }, 250);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [href, layout, size, action, showFaces, share]);

  // Build the same attribute set the PHP builds via parseAttributes().
  const attrs: Record<string, string> = {
    'data-show-faces': showFaces ? 'true' : 'false',
    'data-share': share ? 'true' : 'false',
  };
  if (href) attrs['data-href'] = href;
  if (layout) attrs['data-layout'] = layout;
  if (size) attrs['data-size'] = size;
  if (action) attrs['data-action'] = action;

  return <div ref={ref} className="mgz-fb-like fb-like" {...attrs} />;
}
