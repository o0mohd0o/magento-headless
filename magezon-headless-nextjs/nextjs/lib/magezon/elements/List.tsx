/**
 * List — port of Builder/view/frontend/templates/element/list.phtml.
 *
 * "list" is a static-repeatable collection container. The PHP template simply
 * iterates `$this->getElements()` and renders each child's `toHtml()`:
 *
 *     <?php foreach ($elements as $_element) { echo $_element->toHtml(); } ?>
 *
 * So this component renders nothing of its own besides a styling-hook wrapper;
 * its children live in `element.elements` and recurse through MagezonElements.
 * (Per-element spacing/border/bg/grid/visibility is added by ElementWrapper.)
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { MagezonElements } from '../MagezonElement';

export function List({ element, ctx }: MagezonElementProps) {
  const children = element.elements ?? [];
  if (!children.length) return null;

  return (
    <div className="mgz-list">
      <MagezonElements elements={children} ctx={ctx} />
    </div>
  );
}
