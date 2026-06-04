/**
 * IconList — port of element/icon_list.phtml.
 *
 * A static-repeatable list of icon + text rows. Each row may link out.
 *
 * Fields:
 *   - layout: "vertical" (default) | "horizontal" — sets the .mgz-icon-list-{layout} class.
 *   - items: dynamic-rows array; each item = { icon, link_text, link_url }.
 *       icon      — FontAwesome / Magezon mgz-font class string (e.g. "fas mgz-fa-check").
 *       link_text — the visible label (already filtered server-side).
 *       link_url  — Magezon link field (string URL or {url,title,blank,nofollow,...}).
 *
 * Per-element appearance is generated on the storefront by
 * IconList::getAdditionalStyleHtml(): item spacing (margin-right when horizontal,
 * margin-bottom when vertical), icon size/border-radius/color/background (+ :hover),
 * and text size/color/font-weight (+ :hover). That logic is ported in styleIconList()
 * and emitted as a scoped <style> keyed on the element id, matching Button.tsx.
 *
 * Icon glyphs require a font (FontAwesome / Magezon mgz-font) in the host app.
 */
import React from 'react';
import type { MagezonElement, MagezonElementProps } from '../types';
import { getLinkParams, linkAttrs } from '../links';
import { str } from '../media';

/** Port of Helper\Data::getStyleColor — prefix bare hex values with '#'. */
function cssColor(v: unknown): string {
  const s = str(v).trim();
  if (!s) return '';
  if (s === 'transparent' || s.startsWith('#') || s.startsWith('rgb')) return s;
  return `#${s}`;
}

/** Port of Helper\Data::getStyleProperty — append 'px' to bare numbers; '-' clears. */
function cssProp(v: unknown): string {
  const s = str(v).trim();
  if (!s) return '';
  if (s === '-') return '';
  return /^-?\d*\.?\d+$/.test(s) ? `${s}px` : s;
}

/** Port of IconList::getAdditionalStyleHtml(), scoped to this element's wrapper. */
function styleIconList(el: MagezonElement, items: unknown[]): string {
  if (!items.length) return '';
  const base = `.mgz-element.${str(el.id)}`;
  let css = '';

  // .mgz-icon-list-item — spacing between items, direction depends on layout.
  const layout = str(el.layout) || 'vertical';
  const spacing = cssProp(el.spacing);
  if (spacing) {
    const prop = layout === 'horizontal' ? 'margin-right' : 'margin-bottom';
    css += `${base} .mgz-icon-list-item{${prop}:${spacing};}`;
  }

  // .mgz-icon-list-item-icon — normal.
  const icon: string[] = [];
  const iconSize = cssProp(el.icon_size);
  if (iconSize) icon.push(`font-size:${iconSize}`);
  const iconRadius = cssProp(el.icon_border_radius);
  if (iconRadius) icon.push(`border-radius:${iconRadius}`);
  const iconColor = cssColor(el.icon_color);
  if (iconColor) icon.push(`color:${iconColor}`);
  const iconBg = cssColor(el.icon_background_color);
  if (iconBg) icon.push(`background-color:${iconBg}`);
  if (icon.length) css += `${base} .mgz-icon-list-item-icon{${icon.join(';')};}`;

  // .mgz-icon-list-item-icon:hover.
  const iconHover: string[] = [];
  const iconHoverColor = cssColor(el.icon_hover_color);
  if (iconHoverColor) iconHover.push(`color:${iconHoverColor}`);
  const iconHoverBg = cssColor(el.icon_hover_background_color);
  if (iconHoverBg) iconHover.push(`background-color:${iconHoverBg}`);
  if (iconHover.length) css += `${base} .mgz-icon-list-item-icon:hover{${iconHover.join(';')};}`;

  // .mgz-icon-list-item-text — normal.
  const text: string[] = [];
  const textSize = cssProp(el.text_size);
  if (textSize) text.push(`font-size:${textSize}`);
  const textColor = cssColor(el.text_color);
  if (textColor) text.push(`color:${textColor}`);
  const textWeight = str(el.text_font_weight).trim();
  if (textWeight) text.push(`font-weight:${textWeight}`);
  if (text.length) css += `${base} .mgz-icon-list-item-text{${text.join(';')};}`;

  // .mgz-icon-list-item-text:hover.
  const textHoverColor = cssColor(el.text_hover_color);
  if (textHoverColor) css += `${base} .mgz-icon-list-item-text:hover{color:${textHoverColor};}`;

  return css;
}

export function IconList({ element }: MagezonElementProps) {
  const layout = str(element.layout) || 'vertical';
  const items = Array.isArray(element.items) ? (element.items as Record<string, unknown>[]) : [];
  const css = styleIconList(element, items);

  return (
    <div className={`mgz-icon-list mgz-icon-list-${layout}`}>
      {items.map((item, i) => {
        const link = getLinkParams(item.link_url);
        const linkText = str(item.link_text);
        const icon = str(item.icon);

        const inner = (
          <>
            {icon ? <i className={`mgz-icon-list-item-icon ${icon}`} /> : null}{' '}
            <span className="mgz-icon-list-item-text">{linkText}</span>
          </>
        );

        return (
          <div className="mgz-icon-list-item" key={i}>
            {link.url ? (
              <a href={link.url} title={link.title} {...linkAttrs(link)}>
                {inner}
              </a>
            ) : (
              inner
            )}
          </div>
        );
      })}
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
    </div>
  );
}
