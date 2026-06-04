/**
 * Text — port of element/text.phtml.
 *
 * Field: content (rich HTML from the WYSIWYG editor). Rendered via an HTML sink.
 *
 * NOTE: WYSIWYG content can contain Magento directives ({{widget}}, {{media url}},
 * {{store url}}, {{config path}}). The GraphQL module resolves Magezon {{mgzlink}}
 * tokens and media paths, but generic Magento directives are NOT expanded here —
 * sanitize/rewrite as needed (see README "Known limitations"). Consider running
 * the HTML through DOMPurify if the content is not fully trusted.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { str } from '../media';

export function Text({ element }: MagezonElementProps) {
  const content = str(element.content).replace(/<p><\/p>/g, '<br/>');
  if (!content) return null;
  return <div className="mgz-text" dangerouslySetInnerHTML={{ __html: content }} />;
}
