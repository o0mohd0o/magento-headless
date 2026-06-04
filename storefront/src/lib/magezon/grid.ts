/**
 * grid.ts — port of Magezon\Builder\Block\Element::getWrapperClasses() and
 * getInnerClasses(). Produces the className lists for the outer/inner element
 * divs, including the responsive grid (mgz-col-*), offsets, visibility
 * (mgz-hidden-*), and animation classes. The matching CSS lives in styles/magezon.css.
 */
import type { MagezonElement } from './types';
import { bool, str } from './media';

const SIZES = ['xl', 'lg', 'md', 'sm', 'xs'] as const;

/**
 * Collection types render children directly (no `mgz-child`); leaf/content types
 * get `mgz-child`. Mirrors the builderElement `is_collection` flag.
 */
const COLLECTION_TYPES = new Set(['row', 'column', 'inner_row', 'tabs', 'tab', 'accordion', 'toggle']);

/** Resizable types participate in the 12-col grid (columns + a few others). */
const RESIZABLE_TYPES = new Set(['column', 'inner_column']);

export function getWrapperClasses(el: MagezonElement): string[] {
  const classes: string[] = [];
  classes.push(el.id);
  classes.push('mgz-element');
  if (!COLLECTION_TYPES.has(el.type)) classes.push('mgz-child');
  classes.push(`mgz-element-${el.type}`);

  if (str(el.animation_in)) {
    classes.push('mgz-animated', str(el.animation_in));
    if (bool(el.animation_infinite)) classes.push('mgz-animated-infinite');
  }
  if (str(el.el_class)) classes.push(str(el.el_class));

  if (RESIZABLE_TYPES.has(el.type)) {
    let xs = str(el.xs_size);
    const xl = str(el.xl_size);
    const lg = str(el.lg_size);
    const md = str(el.md_size);
    const sm = str(el.sm_size);
    if (!xl && !lg && !md && !sm && !xs) xs = '12';
    if (xl) classes.push(`mgz-col-xl-${xl}`);
    if (lg) classes.push(`mgz-col-lg-${lg}`);
    if (md) classes.push(`mgz-col-md-${md}`);
    if (sm) classes.push(`mgz-col-sm-${sm}`);
    if (xs) classes.push(`mgz-col-xs-${xs}`);
    for (const s of SIZES) {
      const off = str(el[`${s}_offset_size`]);
      if (off) classes.push(`mgz-col-${s}-offset-${off}`);
    }
  }

  for (const s of SIZES) {
    if (bool(el[`${s}_hide`])) classes.push(`mgz-hidden-${s}`);
  }
  if (bool(el.hidden_default)) classes.push('mgz-hidden');
  if (str(el.title_align)) classes.push(`mgz-element-title-align-${str(el.title_align)}`);

  return classes;
}

export function getInnerClasses(el: MagezonElement): string[] {
  const classes: string[] = ['mgz-element-inner', `${el.id}-s`];
  if (str(el.el_inner_class)) classes.push(str(el.el_inner_class));
  return classes;
}

/** True when the element has a background that warrants the parallax/background layer. */
export function hasBackgroundLayer(el: MagezonElement): boolean {
  return Boolean(
    el.background_color ||
      el.background_image ||
      el.lg_background_image ||
      el.md_background_image ||
      el.sm_background_image ||
      el.xs_background_image,
  );
}
