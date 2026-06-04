'use client';
/**
 * FacebookPage — port of element/facebook_page.phtml (category: social).
 *
 * Renders the official Facebook "Page Plugin" via the XFBML `.fb-page`
 * container and loads the Facebook JavaScript SDK once per page. Faithful to the
 * Magezon template, which emits a `<div class="fb-page" data-href=...>` with a
 * `<blockquote>` fallback link and then injects
 * `connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0`.
 *
 * Element fields (from Data/Element/FacebookPage.php):
 *   - page_url             (text, default "https://www.facebook.com/facebook")
 *                          -> data-href
 *   - page_tabs            (text, default "timeline") -> data-tabs
 *                          (e.g. "timeline", "messages", "events")
 *   - page_width           (text) -> data-width  (Min. 180 to Max. 500)
 *   - page_height          (text) -> data-height
 *   - small_header         (toggle, default true)  -> data-small-header
 *   - hide_cover           (toggle, default true)  -> data-hide-cover
 *   - adapt_container_width(toggle, default true)  -> data-adapt-container-width
 *   - show_facepile        (toggle, default true)  -> data-show-facepile
 *
 * The numeric width/height are passed through Builder\Helper\Data::getStyleProperty
 * in the PHP block (appends "px" to bare numbers); replicated by styleProperty().
 *
 * The SDK <script> is injected at most once per page (guarded by element id and
 * a window flag). Whenever this widget mounts or its config changes, we ask the
 * already-loaded FB SDK to re-parse XFBML so the embed renders. If the SDK or
 * network is unavailable, the `<blockquote>` fallback link to the Facebook page
 * is shown (matching the template's degradation).
 */
import React, { useEffect, useRef } from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

const FB_SDK_ID = 'facebook-jssdk';
const FB_SDK_SRC =
  'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0';

interface FBGlobal {
  XFBML?: { parse: (node?: Element) => void };
}

/**
 * Port of Builder\Helper\Data::getStyleProperty for width/height: a bare
 * numeric value gets "px" appended; "-" is treated as empty; anything else is
 * passed through verbatim (so "300px", "100%" etc. are respected).
 */
function styleProperty(value: string): string {
  if (!value || value === '-') return '';
  return /^-?\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

/** Inject the Facebook SDK once; mirrors the template's IIFE loader. */
function loadFacebookSdk(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FB_SDK_ID)) return;
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

export function FacebookPage({ element }: MagezonElementProps) {
  const pageUrl = str(element.page_url);
  const pageTabs = str(element.page_tabs) || 'timeline';
  const width = styleProperty(str(element.page_width));
  const height = styleProperty(str(element.page_height));

  // Toggles default to true in Data/Element/FacebookPage.php when the key is
  // absent; an explicit falsey value disables them.
  const flag = (key: string): boolean =>
    key in element ? bool(element[key]) : true;
  const smallHeader = flag('small_header');
  const hideCover = flag('hide_cover');
  const adaptContainerWidth = flag('adapt_container_width');
  const showFacepile = flag('show_facepile');

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Re-parse XFBML whenever config changes. Keyed on every data-* value so an
  // edited page url / tabs / size triggers a re-render of the widget.
  useEffect(() => {
    if (!pageUrl) return;
    loadFacebookSdk();
    const fb = (window as unknown as { FB?: FBGlobal }).FB;
    if (fb?.XFBML?.parse) {
      try {
        fb.XFBML.parse(containerRef.current ?? undefined);
      } catch {
        /* SDK present but parse failed — fallback link stays visible. */
      }
    }
    // If FB isn't ready yet, the freshly injected sdk.js (loaded with
    // #xfbml=1) will parse the DOM on its own initialization.
  }, [
    pageUrl,
    pageTabs,
    width,
    height,
    smallHeader,
    hideCover,
    adaptContainerWidth,
    showFacepile,
  ]);

  if (!pageUrl) return null;

  return (
    <div ref={containerRef}>
      <div
        className="fb-page"
        data-href={pageUrl}
        data-tabs={pageTabs}
        data-width={width || undefined}
        data-height={height || undefined}
        data-small-header={smallHeader ? 'true' : 'false'}
        data-adapt-container-width={adaptContainerWidth ? 'true' : 'false'}
        data-hide-cover={hideCover ? 'true' : 'false'}
        data-show-facepile={showFacepile ? 'true' : 'false'}
      >
        <blockquote
          cite={pageUrl}
          className="fb-xfbml-parse-ignore"
          style={{ margin: 0 }}
        >
          <a href={pageUrl} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </blockquote>
      </div>
    </div>
  );
}
