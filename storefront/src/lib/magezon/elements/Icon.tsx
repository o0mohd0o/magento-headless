/**
 * Icon — port of element/icon.phtml.
 *
 * Fields:
 *   icon       — icon font class (default 'fas mgz-fa-adjust' per Data\Element\Icon)
 *   icon_size  — size keyword (default 'md'); rendered as mgz-icon-size-<size>
 *   link_url   — optional link field (string | link object). NOTE: the icon
 *                element stores its link under `link_url`, not `link`.
 *
 * Markup mirrors the .phtml exactly: an outer wrapper carrying the size class,
 * an optional <a> when a link URL is present, and the <i> icon element.
 * Static element — no interactivity.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { getLinkParams, linkAttrs } from '../links';
import { str } from '../media';

export function Icon({ element }: MagezonElementProps) {
  const icon = str(element.icon) || 'fas mgz-fa-adjust';
  const iconSize = str(element.icon_size) || 'md';
  const link = getLinkParams(element.link_url);

  const iconEl = <i className={`mgz-icon-element ${icon}`} />;

  return (
    <div className={`mgz-icon-wrapper mgz-icon-size-${iconSize}`}>
      {link.url ? (
        <a href={link.url} title={link.title} {...linkAttrs(link)}>
          {iconEl}
        </a>
      ) : (
        iconEl
      )}
    </div>
  );
}
