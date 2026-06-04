/**
 * Row — port of Builder/view/.../element/row.phtml.
 *
 * Renders an inner-content flex row of child columns. `row_type === 'full_width_row'`
 * adds the `mgz-container` class (centered max-width). The 12-col layout of the
 * child columns is driven by their `mgz-col-*` wrapper classes (see grid.ts +
 * magezon.css).
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { MagezonElements } from '../MagezonElement';
import { str } from '../media';

export function Row({ element, ctx }: MagezonElementProps) {
  const children = element.elements ?? [];
  if (!children.length) return null;
  const rowType = str(element.row_type);
  const containerClass = rowType === 'full_width_row' ? 'mgz-container' : '';

  return (
    <div className={`inner-content mgz-row ${containerClass}`.trim()}>
      <MagezonElements elements={children} ctx={ctx} />
    </div>
  );
}
