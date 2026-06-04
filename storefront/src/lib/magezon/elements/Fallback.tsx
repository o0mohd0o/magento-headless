/**
 * Fallback — rendered for any Magezon element type without a registered React
 * component. In development it shows a labelled placeholder so missing types are
 * visible; in production it renders nothing (and logs once).
 *
 * If the element carries collection children, they are still rendered so the
 * layout tree isn't lost just because the container type is unmapped.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { MagezonElements } from '../MagezonElement';

const isDev = process.env.NODE_ENV !== 'production';

export function Fallback({ element, ctx }: MagezonElementProps) {
  const hasChildren = Array.isArray(element.elements) && element.elements.length > 0;

  if (isDev) {
    return (
      <div className="mgz-fallback" data-mgz-type={element.type}>
        <span className="mgz-fallback-label">
          Unmapped Magezon element: <code>{element.type}</code>
        </span>
        {hasChildren && <MagezonElements elements={element.elements} ctx={ctx} />}
      </div>
    );
  }

  return hasChildren ? <MagezonElements elements={element.elements} ctx={ctx} /> : null;
}
