/**
 * StaticBlock — port of element/static_block.phtml (renders a CMS block by id).
 *
 * The backend INLINES the referenced CMS block during resolution:
 *   - if the block is itself a Magezon block, its resolved tree is attached as
 *     `element.elements` (rendered natively here), else
 *   - the block's HTML is attached as `element._inline_html`.
 * So nothing is fetched client-side.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { MagezonElements } from '../MagezonElement';
import { str } from '../media';

export function StaticBlock({ element, ctx }: MagezonElementProps) {
  if (Array.isArray(element.elements) && element.elements.length) {
    return <MagezonElements elements={element.elements} ctx={ctx} />;
  }
  const html = str(element._inline_html);
  if (html) {
    return <div className="mgz-static-block" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return null;
}
