/**
 * CallToAction — port of element/call_to_action.phtml.
 *
 * A static "call to action" box: optional background image (with overlay), an
 * inner content stack (icon / title / description / button), an optional corner
 * label, and an optional full-box overlay link.
 *
 * Rich-text fields (title, description, label) are server-filtered HTML in
 * Magezon (CMS/widget directives resolved upstream), so we render them with
 * dangerouslySetInnerHTML to stay faithful to the .phtml output.
 *
 * Fields:
 *  - content_position: flex position of the content block (default middle-center)
 *  - image_position:   top | left | right | cover (default top)
 *  - box_link:         link object -> full-box absolute overlay anchor
 *  - title / title_type (h1..h6/div tag, default h2)
 *  - image:            background image path (resolved via mediaUrl)
 *  - description:      rich HTML
 *  - enable_button + button_title + button_link + button_style + button_size
 *  - icon (font class) + icon_size (default md)
 *  - label + label_position (left | right, default right)
 *  - image_hover_animation (e.g. zoom-in) — adds mgz-bg-transform-* class
 *  - content_hover_animation (e.g. grow) — adds mgz-animated-item--* per item
 *  - sequenced_animation (toggle) — adds mgz-cta-sequenced-animation
 *
 * The element's spacing/border/background wrapper is provided by <ElementWrapper>;
 * the .mgz-cta below is this element's own structural markup, so it stays.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { getLinkParams, linkAttrs } from '../links';
import { bool, mediaUrl, str } from '../media';

export function CallToAction({ element, ctx }: MagezonElementProps) {
  const contentPosition = str(element.content_position) || 'middle-center';
  const imagePosition = str(element.image_position) || 'top';
  const boxLink = getLinkParams(element.box_link);
  const title = str(element.title).trim();
  const titleTypeRaw = str(element.title_type) || 'h2';
  // Restrict the dynamic tag to a safe allow-list (matches Magezon heading tags).
  const allowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'span'];
  const TitleTag = (
    allowedTags.includes(titleTypeRaw.toLowerCase()) ? titleTypeRaw.toLowerCase() : 'h2'
  ) as keyof React.JSX.IntrinsicElements;

  const rawImage = str(element.image);
  const image = rawImage ? mediaUrl(rawImage, ctx) : '';
  const description = str(element.description).trim();

  const enableButton = bool(element.enable_button);
  const buttonTitle = str(element.button_title).trim();
  const buttonLink = getLinkParams(element.button_link);
  const btnStyle = str(element.button_style) || 'flat';
  const btnSize = str(element.button_size) || 'md';

  const icon = str(element.icon);
  const iconSize = str(element.icon_size) || 'md';

  const label = str(element.label);
  const labelPosition = str(element.label_position) || 'right';

  const imageHoverAnimation = str(element.image_hover_animation);
  const contentHoverAnimation = str(element.content_hover_animation);
  const sequencedAnimation = bool(element.sequenced_animation);

  // Build the outer class list exactly like the .phtml.
  const classes = ['mgz-cta', 'mgz-animated-content'];
  if (label) classes.push(`mgz-cta-label-${labelPosition}`);
  if (sequencedAnimation) classes.push('mgz-cta-sequenced-animation');
  if (image) classes.push(`mgz-cta-image-${imagePosition}`);
  if (image && imageHoverAnimation) classes.push(`mgz-bg-transform-${imageHoverAnimation}`);
  if (label) classes.push('has-label');

  // Per-content-item animation hook (only when a content hover animation is set).
  const itemAnim = contentHoverAnimation ? `mgz-animated-item--${contentHoverAnimation}` : '';

  const hasContent = !!(icon || title || description || (enableButton && buttonTitle));

  return (
    <div className={classes.join(' ')}>
      {boxLink.url ? (
        <a
          className="mgz-absolute-link"
          href={boxLink.url}
          title={boxLink.title || undefined}
          {...linkAttrs(boxLink)}
        />
      ) : null}

      {image ? (
        <div className="mgz-cta-bg-wrapper mgz-bg-transform-wrapper">
          <div
            className="mgz-cta-bg mgz-bg"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="mgz-cta-bg-overlay" />
        </div>
      ) : null}

      <div className={`mgz-cta-content mgz-flex-position-${contentPosition}`}>
        {hasContent ? (
          <div className="mgz-cta-content-inner">
            {icon ? (
              <div className={`mgz-cta-content-item ${itemAnim}`.trim()}>
                <div
                  className={`mgz-icon-wrapper mgz-icon-size-${iconSize} mgz-animated-item--${contentHoverAnimation}`.trim()}
                >
                  <i className={`mgz-icon-element ${icon}`} />
                </div>
              </div>
            ) : null}

            {title ? (
              <TitleTag
                className={`mgz-cta-content-item mgz-cta-title ${itemAnim}`.trim()}
                dangerouslySetInnerHTML={{ __html: title }}
              />
            ) : null}

            {description ? (
              <div
                className={`mgz-cta-content-item mgz-cta-description ${itemAnim}`.trim()}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : null}

            {enableButton && buttonTitle ? (
              <div
                className={`mgz-cta-content-item mgz-cta-button-wrapper mgz-btn-style-${btnStyle} mgz-btn-size-${btnSize} ${itemAnim}`.trim()}
              >
                <a
                  href={buttonLink.url || '#'}
                  className="mgz-btn mgz-link"
                  title={buttonLink.title || undefined}
                  {...linkAttrs(buttonLink)}
                  dangerouslySetInnerHTML={{ __html: buttonTitle }}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {label ? (
        <div className="mgz-cta-label">
          <div className="mgz-cta-label-inner" dangerouslySetInnerHTML={{ __html: label }} />
        </div>
      ) : null}
    </div>
  );
}
