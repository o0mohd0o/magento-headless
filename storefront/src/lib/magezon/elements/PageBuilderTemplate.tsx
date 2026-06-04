/**
 * PageBuilderTemplate — port of element/pagebuilder_template.phtml.
 *
 * References a saved Magezon template by template_id. The backend loads that
 * template's profile, resolves it, and inlines the resulting tree as
 * `element.elements`, so it renders natively with no client round-trip.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { MagezonElements } from '../MagezonElement';

export function PageBuilderTemplate({ element, ctx }: MagezonElementProps) {
  if (!Array.isArray(element.elements) || !element.elements.length) return null;
  return <MagezonElements elements={element.elements} ctx={ctx} />;
}
