/**
 * EmptySpace — port of element/empty_space.phtml.
 *
 * The storefront template renders a single empty <div class="mgz-element-empty-space">.
 * The element's *height* is applied by Block\Element\EmptySpace::getAdditionalStyleHtml()
 * as a scoped CSS rule (`height`, unit type) on the element's html id, using the
 * 'custom' device type so it emits responsive overrides per breakpoint.
 *
 * Fields:
 *   height     base height          (default '32', => 32px when numeric)
 *   lg_height  height < 1200px
 *   md_height  height <  992px
 *   sm_height  height <  768px
 *   xs_height  height <  576px
 *
 * Each value is a unit string: a bare number gets `px` appended (mirrors
 * Magezon getStyleProperty / style.ts cssProp); anything with an explicit unit
 * (e.g. "2rem", "50%") is passed through. We scope the height to a generated
 * class so the responsive media queries can target this instance only — the
 * shared ElementStyle (style.ts) does NOT cover this per-type `height` rule.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { str } from '../media';

const MEDIA: Record<string, string> = {
  lg_height: '@media (max-width: 1199px)',
  md_height: '@media (max-width: 991px)',
  sm_height: '@media (max-width: 767px)',
  xs_height: '@media (max-width: 575px)',
};

/** Bare number -> append px; "-" -> empty; otherwise pass through. */
function unit(value: unknown): string {
  const v = str(value).trim();
  if (v === '' || v === '-') return '';
  return /^-?\d*\.?\d+$/.test(v) ? `${v}px` : v;
}

export function EmptySpace({ element }: MagezonElementProps) {
  const id = str(element.id);
  // Scope class; fall back to a stable hook if id is missing.
  const scope = id ? `mgz-empty-space-${id}` : 'mgz-element-empty-space';

  const base = unit(element.height);
  const rules: string[] = [];
  if (base) rules.push(`.${scope}{height:${base};}`);
  for (const key of ['lg_height', 'md_height', 'sm_height', 'xs_height'] as const) {
    const h = unit(element[key]);
    if (h) rules.push(`${MEDIA[key]}{.${scope}{height:${h};}}`);
  }

  return (
    <div className={`mgz-element-empty-space ${scope}`.trim()}>
      {rules.length > 0 && (
        <style dangerouslySetInnerHTML={{ __html: rules.join('') }} />
      )}
    </div>
  );
}
