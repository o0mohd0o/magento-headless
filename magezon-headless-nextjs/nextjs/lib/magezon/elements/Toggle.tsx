'use client';
/**
 * Toggle — port of element/toggle.phtml.
 *
 * A single collapsible section (title + rich HTML content). The storefront uses
 * Magento's "collapsible" widget; here the open/closed state is driven by React
 * hooks instead of jQuery.
 *
 * Fields:
 *   toggle_title   — header text (plain string, rendered inside <h4><span>)
 *   toggle_content — rich HTML body (WYSIWYG / core filter output)
 *   icon           — FontAwesome class shown when CLOSED (collapsed header)
 *   active_icon    — FontAwesome class shown when OPEN (active header)
 *   icon_style     — default | round | round_outline | square | square_outline | text_only
 *   icon_size      — sm | md | lg ... (just a CSS hook class)
 *   open           — boolean: default expanded state
 *
 * When icon_style === 'text_only' the icons are suppressed (matches the .phtml).
 *
 * NOTE: toggle_content is rich HTML and may contain Magento directives
 * ({{widget}}, {{media url}}, ...) which are NOT expanded here. Sanitize/rewrite
 * upstream as needed.
 */
import React, { useId, useState } from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

export function Toggle({ element }: MagezonElementProps) {
  const title = str(element.toggle_title);
  const content = str(element.toggle_content);

  const iconStyle = str(element.icon_style) || 'default';
  const iconSize = str(element.icon_size) || 'md';
  const textOnly = iconStyle === 'text_only';

  // .phtml: if ($iconStyle == 'text_only') $icon = $activeIcon = '';
  const icon = textOnly ? '' : str(element.icon);
  const activeIcon = textOnly ? '' : str(element.active_icon);
  const hasIcon = icon !== '';

  const defaultOpen = bool(element.open);
  const [open, setOpen] = useState(defaultOpen);

  const contentId = useId();

  const rootClass = [
    'mgz-toggle',
    hasIcon ? 'mgz-toggle-icon' : '',
    `mgz-toggle-icon-${iconStyle}`,
    `mgz-toggle-icon-size-${iconSize}`,
    open ? 'mgz-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Icon swaps between collapsed (icon) and active (active_icon) state.
  const currentIcon = open ? activeIcon || icon : icon;

  return (
    <div className={rootClass}>
      {title ? (
        <div className="mgz-toggle-title" data-role="title">
          <h4 data-role="trigger" style={{ margin: 0 }}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpen((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: 0,
                margin: 0,
                background: 'none',
                border: 'none',
                font: 'inherit',
                color: 'inherit',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {currentIcon ? (
                <span data-role="icons" aria-hidden="true">
                  <i className={currentIcon} />
                </span>
              ) : null}
              <span>{title}</span>
            </button>
          </h4>
        </div>
      ) : null}

      {content ? (
        <div
          id={contentId}
          className="mgz-toggle-content"
          data-role="content"
          style={open ? undefined : { display: 'none' }}
          hidden={!open}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : null}
    </div>
  );
}
