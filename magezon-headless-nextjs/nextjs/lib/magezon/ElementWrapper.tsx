/**
 * ElementWrapper — port of Magezon\Builder\Block\Element::getElementHtml().
 *
 * Reproduces the storefront structure for every element:
 *
 *   <div class="{id} mgz-element mgz-child mgz-element-{type} ...grid/visibility...">
 *     <div class="mgz-element-inner {id}-s ...">
 *       [background layer]
 *       {children}              <- the element's own content
 *       <style class="mgz-style">{scoped css}</style>
 *     </div>
 *   </div>
 *
 * Individual element components only render their inner content; spacing, border,
 * background, grid, visibility and animation are handled here centrally so the
 * port stays faithful and DRY.
 */
import React from 'react';
import type { MagezonElement, MagezonRenderContext } from './types';
import { buildElementCss } from './style';
import { getWrapperClasses, getInnerClasses } from './grid';
import { mediaUrl, str } from './media';
import { ElementBehavior, needsBehavior, needsBgLayer } from './ElementBehavior';

interface Props {
  element: MagezonElement;
  ctx: MagezonRenderContext;
  children: React.ReactNode;
}

export function ElementWrapper({ element, ctx, children }: Props) {
  const wrapperClasses = getWrapperClasses(element).join(' ');
  const innerClasses = getInnerClasses(element).join(' ');
  const css = buildElementCss(resolveBackgroundPaths(element, ctx));

  const wrapperAttrs: React.HTMLAttributes<HTMLDivElement> & Record<string, string> = {};
  if (str(element.el_id)) wrapperAttrs.id = str(element.el_id);
  if (element.animation_in) {
    if (element.animation_duration !== undefined) {
      wrapperAttrs['data-animation-duration'] = str(element.animation_duration);
    }
    if (element.animation_delay !== undefined) {
      wrapperAttrs['data-animation-delay'] = str(element.animation_delay);
    }
  }

  return (
    <div className={wrapperClasses} {...wrapperAttrs}>
      <div className={innerClasses}>
        {needsBgLayer(element) && (
          <div className={`mgz-parallax ${element.id}-p`} aria-hidden="true">
            <div className="mgz-parallax-inner" />
          </div>
        )}
        {needsBehavior(element) && <ElementBehavior element={element} />}
        {children}
        {css ? <style className="mgz-style" dangerouslySetInnerHTML={{ __html: css }} /> : null}
      </div>
    </div>
  );
}

/**
 * Background image fields hold relative media paths; resolve them to absolute
 * URLs before the style builder emits `url(...)`. Returns a shallow copy with the
 * (up to 5) background_image fields resolved.
 */
function resolveBackgroundPaths(element: MagezonElement, ctx: MagezonRenderContext): MagezonElement {
  const keys = ['background_image', 'lg_background_image', 'md_background_image', 'sm_background_image', 'xs_background_image'];
  let copy: MagezonElement | null = null;
  for (const k of keys) {
    const v = element[k];
    if (typeof v === 'string' && v && !v.includes('http')) {
      if (!copy) copy = { ...element };
      copy[k] = mediaUrl(v, ctx);
    }
  }
  return copy ?? element;
}
