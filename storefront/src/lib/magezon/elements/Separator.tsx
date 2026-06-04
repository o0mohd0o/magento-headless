/**
 * Separator — port of element/separator.phtml.
 *
 * Markup (faithful to the .phtml):
 *   <div class="mgz-element-separator-wrapper mgz-text-{title_align}">
 *     <{title_tag} class="title">           // only when there is a title OR an icon
 *       [icon-left] <span>{title}</span> [icon-right]
 *     </{title_tag}>
 *     <div class="mgz-element-separator-line"></div>
 *   </div>
 *
 * Fields (with defaults from Data\Element\Separator):
 *   title         — Widget Title (free text, may contain inline HTML → rendered via sink)
 *   title_tag     — heading tag, template fallback 'h4'
 *   title_align   — left|center|right, default 'center'
 *   title_color   — optional title color
 *   add_icon      — toggle; show icon only when on AND icon set
 *   icon          — FontAwesome-style icon class
 *   icon_position — 'left' | 'right', default 'left'
 *
 * Line styling — Block\Element\Separator::getAdditionalStyleHtml() injects these
 * onto .mgz-element-separator-line via the (absent in headless) CSS bundle, so we
 * apply them inline here instead:
 *   border-color     ← color (default '#ebebeb')
 *   border-top-style ← style (default 'solid')
 *   border-top-width ← line_weight (default 1 → '1px')
 *   width            ← el_width (optional)
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { str } from '../media';

const ALLOWED_TAGS: ReadonlySet<string> = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'span']);

/** Append 'px' to a bare number, otherwise pass the unit-bearing value through. */
function unit(value: string): string {
  return /^-?\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

export function Separator({ element }: MagezonElementProps) {
  const title = str(element.title);
  const titleTag = (ALLOWED_TAGS.has(str(element.title_tag)) ? str(element.title_tag) : 'h4') as keyof React.JSX.IntrinsicElements;
  const titleAlign = str(element.title_align) || 'center';
  const titleColor = str(element.title_color);

  const addIcon = bool(element.add_icon);
  const icon = str(element.icon);
  const iconPosition = str(element.icon_position) || 'left';
  const showIcon = addIcon && !!icon;

  // Line inline styles (mirrors getAdditionalStyleHtml()).
  const color = str(element.color) || '#ebebeb';
  const lineStyle = str(element.style) || 'solid';
  const lineWeight = str(element.line_weight) || '1';
  const elWidth = str(element.el_width);

  const lineStyleObj: React.CSSProperties = {
    borderColor: color,
    borderTopStyle: lineStyle as React.CSSProperties['borderTopStyle'],
    borderTopWidth: unit(lineWeight),
  };
  if (elWidth) lineStyleObj.width = unit(elWidth);

  const titleStyleObj: React.CSSProperties | undefined = titleColor ? { color: titleColor } : undefined;

  const titleNode =
    title || showIcon
      ? React.createElement(
          titleTag,
          { className: 'title', style: titleStyleObj },
          showIcon && iconPosition === 'left' ? <i className={`mgz-icon-element ${icon}`} /> : null,
          title ? <span dangerouslySetInnerHTML={{ __html: title }} /> : null,
          showIcon && iconPosition === 'right' ? <i className={`mgz-icon-element ${icon}`} /> : null,
        )
      : null;

  return (
    <div className={`mgz-element-separator-wrapper mgz-text-${titleAlign}`}>
      {titleNode}
      <div className="mgz-element-separator-line" style={lineStyleObj} />
    </div>
  );
}

/** Local boolean coercion (kept inline to avoid an unused-import lint if media's bool changes). */
function bool(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}
