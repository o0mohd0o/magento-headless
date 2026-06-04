/**
 * Column — a grid cell. Width/offset come from the wrapper's mgz-col-* classes
 * (grid.ts), so this component only renders its children. Nested rows/elements
 * recurse through MagezonElements.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { MagezonElements } from '../MagezonElement';

export function Column({ element, ctx }: MagezonElementProps) {
  return (
    <div className="mgz-column-inner">
      <MagezonElements elements={element.elements} ctx={ctx} />
    </div>
  );
}
