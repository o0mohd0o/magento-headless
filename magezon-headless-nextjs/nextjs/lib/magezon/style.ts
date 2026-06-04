/**
 * style.ts — port of Magezon\Builder\Block\ElementStyle::getStylesHtml().
 *
 * Magezon renders each element's spacing/border/background/etc. as a per-element
 * scoped <style> block (NOT shared theme CSS). We reproduce that exactly: this
 * builds a CSS string scoped to the element's id classes, which <ElementWrapper>
 * emits inside a <style> tag — same mechanism as the storefront.
 *
 * Scoping (matches the PHP id getters):
 *   wrapper element  -> `.mgz-element.${id}`   (z-index, animation-duration, float)
 *   inner element    -> `.${id}-s`             (text-align, min-height, padding, margin, border, radius, bg-color)
 *   parallax layer   -> `.${id}-p .mgz-parallax-inner`  (background image/size/position)
 *
 * Responsive: when `device_type === 'custom'`, Magezon emits the same rules per
 * breakpoint prefix ('', 'lg_', 'md_', 'sm_', 'xs_') wrapped in max-width media
 * queries. We replicate those breakpoints.
 */
import type { MagezonElement } from './types';

const MEDIA: Record<string, string> = {
  xs_: '@media (max-width: 575px)',
  sm_: '@media (max-width: 767px)',
  md_: '@media (max-width: 991px)',
  lg_: '@media (max-width: 1199px)',
};

type Styles = Record<string, string>;

/** Magezon getStyleProperty(): numeric -> append unit (default px); "-" -> ""; important suffix. */
function cssProp(value: unknown, important = false, unit = 'px'): string {
  if (value === null || value === undefined || value === '') return '';
  let v = String(value);
  if (/^-?\d*\.?\d+$/.test(v)) {
    v = `${v}${unit}`;
  }
  if (v === '-') return '';
  if (v && important) v += ' !important';
  return v;
}

/** Magezon getStyleColor(): prepend "#" unless already #/rgb/transparent; important suffix. */
function cssColor(value: unknown, important = false): string {
  if (value === null || value === undefined || value === '') return '';
  let v = String(value);
  if (!v.startsWith('#') && !v.startsWith('rgb') && v !== 'transparent') {
    v = `#${v}`;
  }
  if (v && important) v += ' !important';
  return v;
}

/** Magezon parseStyles(): join "k:v;" skipping empties. */
function parseStyles(styles: Styles): string {
  let out = '';
  for (const [k, v] of Object.entries(styles)) {
    if (v === '' || v === undefined || v === null) continue;
    out += `${k}:${v};`;
  }
  return out;
}

function isNullish(v: unknown): boolean {
  if (typeof v === 'number') return false;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return false;
  return v === '' || v === null || v === undefined;
}

function get(el: MagezonElement, key: string): unknown {
  return el[key];
}

/** Wrap a rule block in the appropriate media query for a breakpoint prefix. */
function media(prefix: string, css: string): string {
  if (!css) return '';
  if (prefix && MEDIA[prefix]) return `${MEDIA[prefix]} { ${css} }`;
  return css;
}

export function buildElementCss(el: MagezonElement): string {
  const id = el.id;
  const wrapperSel = `.mgz-element.${id}`;
  const innerSel = `.${id}-s`;
  const parallaxSel = `.${id}-p .mgz-parallax-inner`;
  const deviceType = String(get(el, 'device_type') ?? '');
  const prefixes = deviceType === 'custom' ? ['', 'lg_', 'md_', 'sm_', 'xs_'] : [''];

  let html = '';

  // z-index + animation-duration (element-level, no breakpoint)
  {
    const styles: Styles = {};
    if (get(el, 'z_index') !== undefined && get(el, 'z_index') !== '') {
      styles['z-index'] = String(get(el, 'z_index'));
    }
    const ad = get(el, 'animation_duration');
    if (ad) styles['animation-duration'] = `${ad}s`;
    const body = parseStyles(styles);
    if (body) html += `${wrapperSel}{${body}}`;
  }

  for (const p of prefixes) {
    // ELEMENT: float
    {
      const styles: Styles = {};
      const float = get(el, `${p}el_float`);
      if (deviceType === 'custom' || float) {
        styles['float'] = String(float ?? '');
      }
      const body = parseStyles(styles);
      if (body) html += media(p, `${wrapperSel}{${body}}`);
    }

    // INNER: text-align, min-height, padding, margin, border, radius, bg-color
    {
      const styles: Styles = {};
      const align = get(el, `${p}align`);
      if (deviceType === 'custom' || (align && align !== 'left')) {
        styles['text-align'] = String(align ?? '');
      }
      styles['min-height'] = cssProp(get(el, `${p}min_height`), true);

      // padding
      const pt = cssProp(get(el, `${p}padding_top`));
      const pr = cssProp(get(el, `${p}padding_right`));
      const pb = cssProp(get(el, `${p}padding_bottom`));
      const pl = cssProp(get(el, `${p}padding_left`));
      if (![pt, pr, pb, pl].some(isNullish) && pt && pr && pb && pl) {
        styles['padding'] = pt === pr && pt === pb && pt === pl
          ? `${pt}!important`
          : `${pt} ${pr} ${pb} ${pl}!important`;
      } else {
        styles['padding-top'] = cssProp(get(el, `${p}padding_top`), true);
        styles['padding-right'] = cssProp(get(el, `${p}padding_right`), true);
        styles['padding-bottom'] = cssProp(get(el, `${p}padding_bottom`), true);
        styles['padding-left'] = cssProp(get(el, `${p}padding_left`), true);
      }

      // margin
      const mt = cssProp(get(el, `${p}margin_top`));
      const mr = cssProp(get(el, `${p}margin_right`));
      const mb = cssProp(get(el, `${p}margin_bottom`));
      const ml = cssProp(get(el, `${p}margin_left`));
      if (![mt, mr, mb, ml].some(isNullish) && mt && mr && mb && ml) {
        styles['margin'] = mt === mr && mt === mb && mt === ml
          ? `${mt}!important`
          : `${mt} ${mr} ${mb} ${ml}!important`;
      } else {
        styles['margin-top'] = cssProp(get(el, `${p}margin_top`), true);
        styles['margin-right'] = cssProp(get(el, `${p}margin_right`), true);
        styles['margin-bottom'] = cssProp(get(el, `${p}margin_bottom`), true);
        styles['margin-left'] = cssProp(get(el, `${p}margin_left`), true);
      }

      // border
      const borderStyle = get(el, `${p}border_style`);
      const borderColor = get(el, `${p}border_color`);
      if (borderStyle && borderColor) {
        const tw = cssProp(get(el, `${p}border_top_width`));
        const rw = cssProp(get(el, `${p}border_right_width`));
        const bw = cssProp(get(el, `${p}border_bottom_width`));
        const lw = cssProp(get(el, `${p}border_left_width`));
        const allEqual = tw === rw && tw === bw && tw === lw && tw !== '';
        if (allEqual) {
          styles['border'] = `${tw} ${borderStyle} ${cssColor(borderColor)}!important`;
        } else {
          styles['border-color'] = cssColor(borderColor, true);
          if (get(el, `${p}border_top_width`) !== '' && get(el, `${p}border_top_width`) !== undefined) {
            styles['border-top-width'] = cssProp(get(el, `${p}border_top_width`), true);
            styles['border-top-style'] = String(borderStyle);
          }
          if (get(el, `${p}border_right_width`) !== '' && get(el, `${p}border_right_width`) !== undefined) {
            styles['border-right-width'] = cssProp(get(el, `${p}border_right_width`), true);
            styles['border-right-style'] = String(borderStyle);
          }
          if (get(el, `${p}border_bottom_width`) !== '' && get(el, `${p}border_bottom_width`) !== undefined) {
            styles['border-bottom-width'] = cssProp(get(el, `${p}border_bottom_width`), true);
            styles['border-bottom-style'] = String(borderStyle);
          }
          if (get(el, `${p}border_left_width`) !== '' && get(el, `${p}border_left_width`) !== undefined) {
            styles['border-left-width'] = cssProp(get(el, `${p}border_left_width`), true);
            styles['border-left-style'] = String(borderStyle);
          }
        }
      }

      // border-radius
      const trr = cssProp(get(el, `${p}border_top_left_radius`));
      const tlr = cssProp(get(el, `${p}border_top_right_radius`));
      const brr = cssProp(get(el, `${p}border_bottom_right_radius`));
      const blr = cssProp(get(el, `${p}border_bottom_left_radius`));
      if (trr || tlr || brr || blr) {
        styles['border-radius'] = trr === tlr && trr === brr && trr === blr
          ? `${trr}!important`
          : `${trr || '0'} ${tlr || '0'} ${brr || '0'} ${blr || '0'}!important`;
      }

      styles['background-color'] = cssColor(get(el, `${p}background_color`), true);

      const body = parseStyles(styles);
      if (body) html += media(p, `${innerSel}{${body}}`);
    }

    // PARALLAX/BACKGROUND layer: background image/size/position
    {
      const bgImage = get(el, `${p}background_image`);
      if (bgImage) {
        const styles: Styles = {};
        // background_image is already an absolute/relative path; the wrapper resolves it.
        styles['background-image'] = `url('${bgImage}')`;
        const bgStyle = String(get(el, `${p}background_style`) ?? '');
        switch (bgStyle) {
          case 'cover':
          case 'contain':
            styles['background-size'] = bgStyle;
            break;
          case 'full-width':
            styles['background-size'] = '100% auto';
            break;
          case 'full-height':
            styles['background-size'] = 'auto 100%';
            break;
          case 'repeat-x':
            styles['background-repeat'] = 'repeat-x';
            break;
          case 'repeat-y':
            styles['background-repeat'] = 'repeat-y';
            break;
          case 'no-repeat':
          case 'repeat':
            styles['background-repeat'] = bgStyle;
            break;
          default:
            if (bgStyle) styles['background-size'] = bgStyle;
            break;
        }
        let bgPos = String(get(el, `${p}background_position`) ?? '');
        if (bgPos === 'custom') {
          bgPos = String(get(el, `${p}custom_background_position`) ?? '');
        } else {
          bgPos = bgPos.replace(/-/g, ' ');
        }
        if (bgPos) styles['background-position'] = bgPos;

        const body = parseStyles(styles);
        if (body) html += media(p, `${parallaxSel}{${body}}`);
      }
    }
  }

  return html;
}
