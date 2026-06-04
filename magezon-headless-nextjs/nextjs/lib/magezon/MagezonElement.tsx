/**
 * MagezonElement — renders a single element: looks up its component in the
 * registry, wraps it in <ElementWrapper> (spacing/border/bg/grid/visibility),
 * and renders. Unknown types render <Fallback>.
 *
 * `disable_element` and missing id/type are skipped, mirroring
 * Magezon\Builder\Block\Element::processElements().
 */
import React from 'react';
import type { MagezonElement as MagezonElementType, MagezonRenderContext } from './types';
import { ElementWrapper } from './ElementWrapper';
import { getElementComponent } from './registry';
import { Fallback } from './elements/Fallback';
import { bool } from './media';

interface Props {
  element: MagezonElementType;
  ctx: MagezonRenderContext;
}

export function MagezonElement({ element, ctx }: Props) {
  if (!element || !element.type || !element.id) return null;
  if (bool(element.disable_element)) return null;

  const Component = getElementComponent(element.type) ?? Fallback;

  return (
    <ElementWrapper element={element} ctx={ctx}>
      <Component element={element} ctx={ctx} />
    </ElementWrapper>
  );
}

/** Render a list of elements (used by the renderer and by collection components). */
export function MagezonElements({
  elements,
  ctx,
}: {
  elements: MagezonElementType[] | undefined;
  ctx: MagezonRenderContext;
}) {
  if (!elements || !elements.length) return null;
  return (
    <>
      {elements.map((child) => (
        <MagezonElement key={child.id} element={child} ctx={ctx} />
      ))}
    </>
  );
}
