'use client';
/**
 * FlipBox — port of element/flip_box.phtml.
 *
 * A two-face card (front / back) that flips on hover/focus. The storefront
 * achieves the flip purely with the Magezon CSS bundle (:hover rotates the
 * front/back faces around X or Y). Because this headless build must NOT depend
 * on Magezon's stylesheet, the flip geometry is reproduced with self-contained
 * inline styles and a React hook drives the "flipped" state on hover + keyboard
 * focus (accessible).
 *
 * Fields:
 *   primary_title / primary_text (HTML) / primary_image  — front face
 *   hover_title   / hover_text   (HTML) / hover_image     — back face
 *   flip_direction: left | right | up | down              — axis + sign
 *   flip_effect: flip-effect-classic | flip-effect-3d     — transition style
 *   flip_duration (seconds, default 0.4)
 *   box_min_height (px, default 200)
 *   icon (font class) + icon_spin (bool) + circle (bool)  — front icon
 *   enable_button + button_title + button_link + button_style + button_size
 *
 * The original markup classes (mgz-flipbox, mgz-flipbox-front, …) are kept as
 * styling hooks; visual flip does not rely on them.
 */
import React, { useState } from 'react';
import type { MagezonElementProps } from '../types';
import { getLinkParams, linkAttrs } from '../links';
import { bool, mediaUrl, str } from '../media';

type Axis = 'rotateX' | 'rotateY';

/**
 * Mirror the storefront CSS rotation map.
 *   right: front 0 -> 180,  back -180 -> 0   (Y axis)
 *   left:  front 0 -> -180, back  180 -> 0   (Y axis)
 *   up:    front 0 -> 180,  back -180 -> 0   (X axis)
 *   down:  front 0 -> -180, back  180 -> 0   (X axis)
 */
function flipGeometry(direction: string): {
  axis: Axis;
  frontRest: number;
  frontFlip: number;
  backRest: number;
  backFlip: number;
} {
  switch (direction) {
    case 'right':
      return { axis: 'rotateY', frontRest: 0, frontFlip: 180, backRest: -180, backFlip: 0 };
    case 'up':
      return { axis: 'rotateX', frontRest: 0, frontFlip: 180, backRest: -180, backFlip: 0 };
    case 'down':
      return { axis: 'rotateX', frontRest: 0, frontFlip: -180, backRest: 180, backFlip: 0 };
    case 'left':
    default:
      return { axis: 'rotateY', frontRest: 0, frontFlip: -180, backRest: 180, backFlip: 0 };
  }
}

export function FlipBox({ element, ctx }: MagezonElementProps) {
  const [flipped, setFlipped] = useState(false);

  const primaryTitle = str(element.primary_title);
  const primaryText = str(element.primary_text);
  const primaryImage = element.primary_image ? mediaUrl(element.primary_image, ctx) : '';

  const hoverTitle = str(element.hover_title);
  const hoverText = str(element.hover_text);
  const hoverImage = element.hover_image ? mediaUrl(element.hover_image, ctx) : '';

  const flipDirection = str(element.flip_direction) || 'left';
  const flipEffect = str(element.flip_effect) || 'flip-effect-classic';
  const is3d = flipEffect === 'flip-effect-3d';

  const durationRaw = str(element.flip_duration);
  const duration = durationRaw && !Number.isNaN(Number(durationRaw)) ? Number(durationRaw) : is3d ? 0.75 : 0.4;

  const minHeightRaw = str(element.box_min_height);
  const minHeight = minHeightRaw && !Number.isNaN(Number(minHeightRaw)) ? `${Number(minHeightRaw)}px` : '200px';

  const icon = str(element.icon);
  const spin = bool(element.icon_spin);
  const circle = bool(element.circle);

  const enableButton = bool(element.enable_button);
  const buttonTitle = str(element.button_title);
  const buttonLink = getLinkParams(element.button_link);
  const btnStyle = str(element.button_style);
  const btnSize = str(element.button_size);

  const { axis, frontRest, frontFlip, backRest, backFlip } = flipGeometry(flipDirection);

  const transition = is3d
    ? `transform ${duration}s ease-in-out`
    : `transform ${duration}s cubic-bezier(0.2, 0.85, 0.4, 1.275)`;

  const faceBase: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '27px 20px',
    textAlign: 'center',
    backfaceVisibility: 'hidden',
    backgroundColor: '#fff',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    transition,
    ...(is3d ? { transformStyle: 'preserve-3d' as const } : {}),
  };

  const frontStyle: React.CSSProperties = {
    ...faceBase,
    position: 'relative',
    zIndex: flipped ? -1 : 10,
    transform: `${axis}(${flipped ? frontFlip : frontRest}deg)`,
    backgroundImage: primaryImage ? `url('${primaryImage}')` : undefined,
  };

  const backStyle: React.CSSProperties = {
    ...faceBase,
    zIndex: flipped ? 1 : -1,
    transform: `${axis}(${flipped ? backFlip : backRest}deg)`,
    backgroundImage: hoverImage ? `url('${hoverImage}')` : undefined,
  };

  const innerFaceStyle: React.CSSProperties = is3d
    ? { width: '100%', transform: 'translateZ(50px) scale(0.9)' }
    : { width: '100%' };

  const titleStyle: React.CSSProperties = {
    color: 'inherit',
    fontWeight: 600,
    margin: '0 0 10px 0',
    fontSize: '20px',
  };

  const circleStyle: React.CSSProperties = circle
    ? {
        borderRadius: '50%',
        height: '64px',
        width: '64px',
        border: '1px solid transparent',
        margin: '0 auto 10px',
        position: 'relative',
        display: 'table',
      }
    : { margin: '0 auto 10px', position: 'relative', display: 'table' };

  const iconStyle: React.CSSProperties = {
    display: 'table-cell',
    verticalAlign: 'middle',
    fontSize: circle ? '24px' : '60px',
  };

  return (
    <div
      className={`mgz-flipbox mgz-flipbox-rotate-${flipDirection} ${flipEffect}`}
      data-min-height={minHeightRaw || '200'}
      style={{ position: 'relative', zIndex: 1, backfaceVisibility: 'hidden' }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onFocus={() => setFlipped(true)}
      onBlur={() => setFlipped(false)}
      tabIndex={0}
    >
      <div
        className="mgz-flipbox-inner"
        style={{
          position: 'relative',
          marginBottom: '15px',
          minHeight,
          perspective: '1000px',
          ...(is3d ? { transformStyle: 'preserve-3d' as const } : {}),
        }}
      >
        <div className="mgz-flipbox-block mgz-flipbox-front" style={frontStyle}>
          <div className="mgz-flipbox-block-inner mgz-flipbox-front-inner" style={innerFaceStyle}>
            {icon && (
              <div className={`mgz-flipbox-circle ${!circle ? 'flipbox-no-circle' : ''}`} style={circleStyle}>
                <i className={`mgz-icon-element ${icon} ${spin ? 'mgz-fa-spin' : ''}`} style={iconStyle} />
              </div>
            )}
            {primaryTitle && (
              <h2 className="mgz-flipbox-title" style={titleStyle}>
                {primaryTitle}
              </h2>
            )}
            {primaryText && (
              <div
                className="mgz-flipbox-front-inner-text"
                dangerouslySetInnerHTML={{ __html: primaryText }}
              />
            )}
          </div>
        </div>

        <div className="mgz-flipbox-block mgz-flipbox-back" style={backStyle}>
          <div className="mgz-flipbox-block-inner mgz-flipbox-back-inner" style={innerFaceStyle}>
            {hoverTitle && (
              <h2 className="mgz-flipbox-title" style={titleStyle}>
                {hoverTitle}
              </h2>
            )}
            {hoverText && (
              <div
                className="mgz-flipbox-back-inner-text"
                dangerouslySetInnerHTML={{ __html: hoverText }}
              />
            )}
            {enableButton && (
              <div
                className={`mgz-flipbox-actions mgz-btn-style-${btnStyle} mgz-btn-size-${btnSize}`}
                style={{ marginTop: '20px' }}
              >
                <a
                  href={buttonLink.url || '#'}
                  className="mgz-link mgz-btn"
                  title={buttonLink.title}
                  {...linkAttrs(buttonLink)}
                >
                  {buttonTitle}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
