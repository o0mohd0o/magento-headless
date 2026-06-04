/**
 * RawHtml — port of element/raw_html.phtml.
 *
 * Storefront template:
 *   <?= $dataHelper->filter($element->getContent()) ?>
 *
 * Single field:
 *   - content (string): raw, user-authored HTML. Defaults (per
 *     Magezon\PageBuilder\Data\Element\RawHtml) to the placeholder markup below
 *     when the author never edited the block.
 *
 * The storefront pipes `content` through Magezon\Core\Helper\Data::filter(),
 * which expands Magento CMS/widget directives ({{store url}}, {{media url}},
 * {{config path}}, {{widget}}, {{block}}). Those directives are NOT expanded
 * here — the GraphQL module resolves Magezon media paths / {{mgzlink}} tokens,
 * but generic Magento directives must be pre-resolved server-side or rewritten
 * (see README "Known limitations"). The raw string is rendered through an HTML
 * sink. Run it through DOMPurify if the source content is not fully trusted.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { str } from '../media';

const DEFAULT_CONTENT =
  '<p>I am raw html block.<br/>Click edit button to change this html</p>';

export function RawHtml({ element }: MagezonElementProps) {
  const raw = str(element.content);
  const content = raw !== '' ? raw : DEFAULT_CONTENT;
  if (!content) return null;
  return (
    <div
      className="mgz-raw-html"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
