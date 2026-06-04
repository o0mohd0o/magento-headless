'use client';
/**
 * RawJs — port of element/raw_js.phtml ( `<?= filter($element->getContent()) ?>` ).
 *
 * The `content` field holds raw JS (often wrapped in <script>). React's
 * dangerouslySetInnerHTML does NOT execute injected <script> tags, so we inject
 * the markup and then re-create any <script> elements so they run — faithfully
 * reproducing the storefront behavior. Runs once on mount (client only).
 *
 * Admin-authored content; treat as trusted (same trust level as the storefront).
 */
import React, { useEffect, useRef } from 'react';
import type { MagezonElementProps } from '../types';
import { str } from '../media';

export function RawJs({ element }: MagezonElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const content = str(element.content);

  useEffect(() => {
    const host = ref.current;
    if (!host || !content) return;
    host.innerHTML = content;
    // Re-create scripts so the browser executes them.
    const scripts = Array.from(host.querySelectorAll('script'));
    for (const old of scripts) {
      const s = document.createElement('script');
      for (const attr of Array.from(old.attributes)) s.setAttribute(attr.name, attr.value);
      s.textContent = old.textContent;
      old.parentNode?.replaceChild(s, old);
    }
    // If the content was bare JS (no <script>), execute it directly.
    if (!scripts.length && content.indexOf('<') === -1) {
      const s = document.createElement('script');
      s.textContent = content;
      host.appendChild(s);
    }
    return () => {
      host.innerHTML = '';
    };
  }, [content]);

  if (!content) return null;
  return <div ref={ref} className="mgz-raw-js" />;
}
