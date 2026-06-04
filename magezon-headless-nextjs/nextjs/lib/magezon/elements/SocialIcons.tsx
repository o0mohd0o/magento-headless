import React from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

/**
 * SocialIcons — port of Magezon\Builder element "social_icons".
 *
 * Template: view/frontend/templates/element/social_icons.phtml
 *   <ul class="mgz-socialicons">
 *     <li>
 *       <a href={link} target={link_target} rel="noreferrer" title="Follow on {label}">
 *         <i class={icon} />
 *       </a>
 *       {follow_button && <a class="mgz-socialicons-follow-button">Follow</a>}
 *     </li>
 *   </ul>
 *
 * Element fields:
 *   - items: dynamic-rows array of { icon, link, background_color, hover_background_color }
 *   - link_target: anchor target (default "_self")
 *   - follow_button: toggle — render the textual "Follow" link
 *   - icon_radius: number — border-radius (px) on each <i>
 *   - icon_size: number — font-size (px) on each <i>; box is 2x (PHP getAdditionalStyleHtml)
 *
 * The PHP block also emits scoped CSS (per-item background + :hover, icon sizing).
 * Because this component renders inner content only and cannot inject :hover via
 * inline styles, the static background_color / icon sizing are applied inline as a
 * faithful resting-state approximation. Hover styling can be supplied by host CSS
 * targeting `.mgz-socialicons i`.
 */

// Port of Magezon\Builder\Helper\Data::getListSocial() — icon class -> human label.
const SOCIAL_LABELS: Record<string, string> = {
  'fab mgz-fa-facebook-f': 'Facebook',
  'fab mgz-fa-twitter': 'Twitter',
  'fab mgz-fa-pinterest-p': 'Pinterest',
  'fab mgz-fa-linkedin-in': 'LinkedIn',
  'fab mgz-fa-tumblr': 'Tumblr',
  'fab mgz-fa-instagram': 'Instagram',
  'fab mgz-fa-skype': 'Skype',
  'fab mgz-fa-flickr': 'Flickr',
  'fab mgz-fa-dribbble': 'Dribbble',
  'fab mgz-fa-youtube': 'Youtube',
  'fab mgz-fa-vimeo-v': 'Vimeo',
  'fas mgz-fa-rss': 'RSS',
  'fab mgz-fa-behance': 'Behance',
};

type SocialItem = {
  icon?: unknown;
  link?: unknown;
  background_color?: unknown;
  hover_background_color?: unknown;
};

export function SocialIcons({ element }: MagezonElementProps) {
  const items = Array.isArray(element.items) ? (element.items as SocialItem[]) : [];
  if (items.length === 0) return null;

  // Magezon defaults link_target to "_self".
  const linkTarget = str(element.link_target) || '_self';
  const followButton = bool(element.follow_button);

  const iconRadius = str(element.icon_radius);
  const iconSize = str(element.icon_size);

  // Mirror getAdditionalStyleHtml(): radius + size (box is 2x font-size).
  const iconBaseStyle: React.CSSProperties = {};
  if (iconRadius) iconBaseStyle.borderRadius = `${iconRadius}px`;
  if (iconSize) {
    const size = Number(iconSize);
    if (!Number.isNaN(size)) {
      iconBaseStyle.fontSize = `${size}px`;
      iconBaseStyle.width = `${size * 2}px`;
      iconBaseStyle.height = `${size * 2}px`;
      iconBaseStyle.lineHeight = `${size * 2}px`;
    }
  }

  return (
    <ul className="mgz-socialicons">
      {items.map((item, i) => {
        const iconClass = str(item.icon);
        // PHP filters an empty link down to "#".
        const link = str(item.link) || '#';
        const label = SOCIAL_LABELS[iconClass] || '';
        const bg = str(item.background_color);

        const iconStyle: React.CSSProperties = { ...iconBaseStyle };
        if (bg) iconStyle.backgroundColor = bg;

        return (
          <li key={i}>
            <a
              href={link}
              target={linkTarget}
              rel="noreferrer"
              title={label ? `Follow on ${label}` : undefined}
            >
              <i className={iconClass} style={Object.keys(iconStyle).length ? iconStyle : undefined} />
            </a>
            {followButton && (
              <a href={link} className="mgz-socialicons-follow-button" title={label}>
                Follow
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
