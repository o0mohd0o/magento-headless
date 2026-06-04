/**
 * SearchForm — port of element/search_form.phtml (category: form).
 *
 * The Magento template renders the core `top.search` mini-form block
 * (Magento\Search\Block\Form / quick search) and then string-replaces the
 * input's placeholder with the element's configured `placeholder` value. In a
 * headless storefront there is no `top.search` block to render, so we emit a
 * faithful, equivalent quick-search <form> that GETs the catalog search page —
 * exactly what Magento's mini-form does:
 *
 *   <form action="/catalogsearch/result/" method="get">
 *     <input name="q" placeholder="..." />
 *   </form>
 *
 * Element fields (from Data/Element/SearchForm.php):
 *   - placeholder            (text, default "Search entire store here...")
 *   - form_width             (text/number, default 250) — desktop max width.
 *                            The PHP block (Block/Element/SearchForm.php) only
 *                            applies the width at min-width:768px via
 *                            `.block-search { width: ... }`, so we cap it with a
 *                            CSS max-width and let it shrink on small screens.
 *   - input_background_color (color) — applied to the text input (#search in PHP)
 *   - input_text_color       (color) — applied to the text input
 *
 * No script/SDK is needed; a plain GET form is the most faithful, JS-free
 * port and works without the storefront CSS bundle. The search action path is
 * the Magento default ("/catalogsearch/result/", query param "q"); override the
 * route in the host app if your headless search endpoint differs.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { str } from '../media';

/** Default catalog quick-search route + query param (Magento core). */
const SEARCH_ACTION = '/catalogsearch/result/';
const QUERY_PARAM = 'q';

/** Turn a bare number into px; pass through anything already unit-bearing. */
function cssWidth(value: string): string {
  if (!value) return '';
  return /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

export function SearchForm({ element }: MagezonElementProps) {
  // Mirror the Data\Element defaults.
  const placeholder = str(element.placeholder) || 'Search entire store here...';
  const formWidth = cssWidth(str(element.form_width) || '250');
  const inputBg = str(element.input_background_color);
  const inputColor = str(element.input_text_color);

  const inputStyle: React.CSSProperties = {
    flex: '1 1 auto',
    minWidth: 0,
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRight: 'none',
    borderRadius: '2px 0 0 2px',
    outline: 'none',
    fontSize: 14,
  };
  if (inputBg) inputStyle.backgroundColor = inputBg;
  if (inputColor) inputStyle.color = inputColor;

  return (
    <div className="mgz-search-form">
      <form
        action={SEARCH_ACTION}
        method="get"
        role="search"
        className="block-search"
        style={{
          display: 'flex',
          alignItems: 'stretch',
          width: '100%',
          maxWidth: formWidth || undefined,
          margin: 0,
        }}
      >
        <label htmlFor="mgz-search" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          Search
        </label>
        <input
          id="mgz-search"
          type="search"
          name={QUERY_PARAM}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          maxLength={128}
          style={inputStyle}
        />
        <button
          type="submit"
          aria-label="Search"
          title="Search"
          style={{
            flex: '0 0 auto',
            padding: '8px 16px',
            border: '1px solid #ccc',
            borderRadius: '0 2px 2px 0',
            background: '#1979c3',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1.2,
          }}
        >
          Search
        </button>
      </form>
    </div>
  );
}
