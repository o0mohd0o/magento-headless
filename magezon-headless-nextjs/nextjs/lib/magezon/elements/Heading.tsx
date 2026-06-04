/**
 * Heading — port of element/heading.phtml.
 *
 * Fields: heading_type (h1..h6), text (HTML), link (object|string), font_size.
 * The text may contain inline HTML; rendered via a sink. font_size is applied
 * inline (the storefront does this via a JS data-attr; we apply it directly).
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { getLinkParams, linkAttrs } from '../links';
import { str } from '../media';

const ALLOWED: ReadonlySet<string> = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p']);

export function Heading({ element }: MagezonElementProps) {
  const text = str(element.text);
  if (!text) return null;

  const tag = (ALLOWED.has(str(element.heading_type)) ? str(element.heading_type) : 'h2') as keyof React.JSX.IntrinsicElements;
  const link = getLinkParams(element.link);
  const fontSize = str(element.font_size);
  const style = fontSize ? { fontSize: /^\d+$/.test(fontSize) ? `${fontSize}px` : fontSize } : undefined;

  const inner = link.url ? (
    <a href={link.url} title={link.title} {...linkAttrs(link)} dangerouslySetInnerHTML={{ __html: text }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: text }} />
  );

  return React.createElement(tag, { className: 'mgz-element-heading-text', style }, inner);
}
