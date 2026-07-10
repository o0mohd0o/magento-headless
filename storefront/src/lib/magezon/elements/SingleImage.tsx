/**
 * SingleImage — port of element/single_image.phtml.
 *
 * Fields: image (path), link, alt_tag, title, description, content_position,
 * image_width/height, image_hover_effect, hover_image, overlay_color,
 * hover_overlay_color, responsive_images ('custom' -> <picture> with tablet/
 * landscape/portrait sources), img_id, zoom_effect.
 *
 * Image paths are resolved to absolute media URLs via the render context.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { getLinkParams, linkAttrs } from '../links';
import { mediaUrl, str } from '../media';

function filename(src: string): string {
  const base = src.split('/').pop() ?? src;
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(0, dot) : base;
}

export function SingleImage({ element, ctx }: MagezonElementProps) {
  const rawSrc = str(element.image) || str(element.src);
  if (!rawSrc) return null;

  const src = mediaUrl(rawSrc, ctx);
  const link = getLinkParams(element.link);
  const title = str(element.title);
  const description = str(element.description);
  const alt = str(element.alt_tag) || filename(rawSrc);
  const width = str(element.image_width) || undefined;
  const height = str(element.image_height) || undefined;
  const imgId = str(element.img_id) || undefined;
  const contentPosition = str(element.content_position);
  const hoverEffect = str(element.image_hover_effect);
  const hoverImage = element.hover_image ? mediaUrl(element.hover_image, ctx) : '';
  const overlayColor = str(element.overlay_color);
  const hoverOverlayColor = str(element.hover_overlay_color);
  const responsive = str(element.responsive_images) === 'custom';

  const tablet = element.tablet_image ? mediaUrl(element.tablet_image, ctx) : '';
  const landscape = element.landscape_phone_image ? mediaUrl(element.landscape_phone_image, ctx) : '';
  const portrait = element.portrait_phone_image ? mediaUrl(element.portrait_phone_image, ctx) : '';

  const img = (
    <img
      id={imgId}
      className="mgz-hover-main"
      src={src}
      alt={alt}
      width={width}
      height={height}
      title={title || undefined}
      data-hover={hoverImage || undefined}
    />
  );

  const picture = responsive ? (
    <picture>
      {portrait && <source srcSet={portrait} media="(max-width: 575px)" />}
      {landscape && <source srcSet={landscape} media="(max-width: 767px)" />}
      {tablet && <source srcSet={tablet} media="(max-width: 1023px)" />}
      {img}
    </picture>
  ) : (
    img
  );

  const innerClass = [
    'mgz-single-image-inner',
    contentPosition ? `mgz-flex-position-${contentPosition}` : '',
    hoverEffect ? `hover-type-${hoverEffect}` : '',
    link.url ? 'mgz-image-link' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="mgz-single-image">
      <div className={innerClass}>
        {link.url ? (
          <a className="mgz-image-link-a" href={link.url} title={title} {...linkAttrs(link)}>
            {picture}
          </a>
        ) : (
          picture
        )}
        {(title || description) && contentPosition && contentPosition !== 'never' && (
          <div className="image-content">
            {title && <div className="image-title">{title}</div>}
            {description && <div className="image-description">{description}</div>}
          </div>
        )}
      </div>
      {(overlayColor || hoverOverlayColor) && <div className="mgz-overlay" />}
    </div>
  );
}
