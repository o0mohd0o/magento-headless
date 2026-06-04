/**
 * PassThrough — a container element that simply renders its child elements.
 *
 * Used for collection child types that have no markup of their own beyond their
 * contents, e.g. a `tab` inside <Tabs> (Tabs renders each tab via the standard
 * pipeline so the tab gets its own ElementWrapper — padding/border/bg — mirroring
 * `$_element->toHtml()` in tabs.phtml). Without this, those child types would
 * fall through to <Fallback>.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { MagezonElements } from '../MagezonElement';

export function PassThrough({ element, ctx }: MagezonElementProps) {
  return <MagezonElements elements={element.elements} ctx={ctx} />;
}
