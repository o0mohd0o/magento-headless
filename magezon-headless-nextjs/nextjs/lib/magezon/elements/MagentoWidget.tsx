/**
 * MagentoWidget — port of element/magento_widgget.phtml.
 *
 * The element stores a `{{widget ...}}` directive in the `magento_widget` field.
 * The backend's directive expansion already resolves it to final HTML (via
 * Magento's CMS filter), so here we simply render that HTML.
 *
 * NOTE: widgets that depend on layout/session context (e.g. some dynamic blocks)
 * may render store-default output. Sanitize if your widget content isn't trusted.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { str } from '../media';

export function MagentoWidget({ element }: MagezonElementProps) {
  const html = str(element.magento_widget);
  if (!html) return null;
  return <div className="mgz-magento-widget" dangerouslySetInnerHTML={{ __html: html }} />;
}
