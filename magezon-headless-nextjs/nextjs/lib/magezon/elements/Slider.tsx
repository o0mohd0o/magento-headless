'use client';
/**
 * Slider — port of Magezon\PageBuilder element/slider.phtml.
 *
 * A faithful, jQuery-free reimplementation of the Owl-Carousel based slider.
 * Items are a dynamic-rows array on `element.items`. Each slide can have an
 * image / youtube / vimeo / local-video background, plus heading + two captions
 * and (link_type === 'button') up to two buttons, or (link_type === 'full') a
 * full-slide overlay link.
 *
 * Behavior implemented with React hooks: prev/next navigation, dot pagination,
 * autoplay (owl_autoplay + owl_autoplay_timeout), loop (owl_loop) and RTL
 * (owl_rtl). The Owl plugin's per-slide entrance "animation" classes are kept
 * as `data-animate-in` hooks for any host CSS but are not required.
 *
 * Class names mirror the storefront (mgz-carousel, mgz-carousel-item,
 * item-content-wrapper, slide-heading, mgz-button ...) so existing style hooks
 * apply; layout-critical bits use small inline styles so this works without the
 * Magezon CSS bundle.
 *
 * The .phtml hard-codes local-video playback to: controls=false, autoplay=true,
 * muted=true, loop=true — replicated here.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { MagezonElementProps, MagezonElement } from '../types';
import { getLinkParams, linkAttrs } from '../links';
import { bool, mediaUrl, str } from '../media';

type Ctx = MagezonElementProps['ctx'];

/** Build the iframe embed src for youtube/vimeo backgrounds (port of getIframeSrc). */
function iframeSrc(item: MagezonElement): string {
  const type = str(item.background_type);
  if (type === 'youtube' && str(item.youtube_id)) {
    const id = str(item.youtube_id);
    const params = new URLSearchParams({
      mute: bool(item.video_mute) ? '1' : '0',
      modestbranding: bool(item.video_modest_branding) ? '1' : '0',
      rel: bool(item.video_related_videos) ? '1' : '0',
    });
    // Template forces loop=true for the slide video block.
    params.set('playlist', id);
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }
  if (type === 'vimeo' && str(item.vimeo_id)) {
    return `https://player.vimeo.com/video/${str(item.vimeo_id)}`;
  }
  return '';
}

/** Render one text block (heading / caption1 / caption2) with its chosen tag. */
function TextBlock({
  text,
  tag,
  blockClass,
  animation,
  fontSize,
  lineHeight,
}: {
  text: string;
  tag: string;
  blockClass: string;
  animation: string;
  fontSize: number;
  lineHeight: number;
}) {
  if (!text) return null;
  const Tag = (tag || 'div') as keyof React.JSX.IntrinsicElements;
  return (
    <div
      className={`${blockClass} slide-animation`}
      data-animate-in={animation || undefined}
    >
      <Tag
        className="slide-text"
        style={{
          fontSize: fontSize ? `${fontSize}px` : undefined,
          lineHeight: lineHeight ? `${lineHeight}px` : undefined,
          margin: 0,
        }}
        // Heading/caption may contain inline HTML from the builder.
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}

/** Render one slide button (button1 / button2). */
function SlideButton({
  text,
  link,
  style,
  size,
  extraClass,
}: {
  text: string;
  link: ReturnType<typeof getLinkParams>;
  style: string;
  size: string;
  extraClass: string;
}) {
  if (!text) return null;
  return (
    <div className={`mgz-button ${extraClass} mgz-btn-style-${style} mgz-btn-size-${size}`}>
      <a
        href={link.url || '#'}
        className="mgz-btn"
        title={link.title || undefined}
        {...linkAttrs(link)}
      >
        {text}
      </a>
    </div>
  );
}

function Slide({ item, index, ctx, lazy, hoverEffect }: {
  item: MagezonElement;
  index: number;
  ctx: Ctx;
  lazy: boolean;
  hoverEffect: string;
}) {
  const backgroundType = str(item.background_type) || 'image';
  const src = mediaUrl(str(item.image), ctx);
  const localLink = str(item.local_link);
  const embed = iframeSrc(item);

  const linkType = str(item.link_type) || 'full';
  const slideLink = getLinkParams(item.slide_link);
  const contentPosition = str(item.content_position) || 'middle-center';

  const heading = str(item.heading);
  const caption1 = str(item.caption1);
  const caption2 = str(item.caption2);
  const button1 = str(item.button1);
  const button2 = str(item.button2);

  const hasButtons = linkType === 'button' && (button1 || button2);
  const hasContent = !embed && (heading || caption1 || caption2 || hasButtons);

  const isLocalVideo = backgroundType === 'local' && !!localLink;
  // Owl-lazy is skipped when a local video fills the slide (matches template).
  const useLazy = lazy && !isLocalVideo;

  const button1Link = getLinkParams(item.button1_link);
  const button2Link = getLinkParams(item.button2_link);

  const itemClass = [
    'item',
    'mgz-carousel-item',
    hoverEffect ? `hover-type-${hoverEffect}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={`slider-item${index}`}
      className={itemClass}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        flex: '0 0 100%',
        backgroundImage: useLazy ? undefined : src ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      }}
    >
      {slideLink.url && linkType === 'full' && (
        <a
          href={slideLink.url}
          className="overlay-link"
          title={slideLink.title || undefined}
          aria-label={slideLink.title || 'slide link'}
          {...linkAttrs(slideLink)}
          style={{ position: 'absolute', inset: 0, zIndex: 3 }}
        />
      )}

      {isLocalVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src={localLink} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {embed && (
        <iframe
          width="1110"
          height="624"
          src={embed}
          title={`slide-${index}-video`}
          frameBorder={0}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      )}

      {hasContent && (
        <div
          className={`item-content-wrapper mgz-flex-position-${contentPosition}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            zIndex: 2,
            padding: '20px',
            ...flexPosition(contentPosition),
          }}
        >
          <div
            className="item-content"
            style={{ textAlign: (str(item.content_align) || undefined) as React.CSSProperties['textAlign'] }}
          >
            <TextBlock
              text={heading}
              tag={str(item.heading_type) || 'h2'}
              blockClass="slide-heading"
              animation={str(item.heading_animation)}
              fontSize={Number(item.heading_font_size) || 60}
              lineHeight={Number(item.heading_line_height) || 80}
            />
            <TextBlock
              text={caption1}
              tag={str(item.caption1_type) || 'div'}
              blockClass="slide-caption1"
              animation={str(item.caption1_animation)}
              fontSize={Number(item.caption1_font_size) || 24}
              lineHeight={Number(item.caption1_line_height) || 38}
            />
            <TextBlock
              text={caption2}
              tag={str(item.caption2_type) || 'div'}
              blockClass="slide-caption2"
              animation={str(item.caption2_animation)}
              fontSize={Number(item.caption2_font_size) || 24}
              lineHeight={Number(item.caption2_line_height) || 38}
            />
            {hasButtons && (
              <div className="slide-buttons" style={{ display: 'inline-flex', gap: '10px', flexWrap: 'wrap' }}>
                <SlideButton
                  text={button1}
                  link={button1Link}
                  style={str(item.button1_style)}
                  size={str(item.button1_size)}
                  extraClass="slide-button1"
                />
                <SlideButton
                  text={button2}
                  link={button2Link}
                  style={str(item.button2_style)}
                  size={str(item.button2_size)}
                  extraClass="slide-button2"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`slide-background slide-background-${backgroundType}`} />
    </div>
  );
}

/** Map Magezon content_position (e.g. "middle-center") to flexbox alignment. */
function flexPosition(position: string): React.CSSProperties {
  const [vertical = 'middle', horizontal = 'center'] = position.split('-');
  const justify =
    horizontal === 'left' ? 'flex-start' : horizontal === 'right' ? 'flex-end' : 'center';
  const align =
    vertical === 'top' ? 'flex-start' : vertical === 'bottom' ? 'flex-end' : 'center';
  return { justifyContent: justify, alignItems: align };
}

export function Slider({ element, ctx }: MagezonElementProps) {
  const items = Array.isArray(element.items) ? (element.items as MagezonElement[]) : [];
  const count = items.length;

  const sliderHeight = Number(element.slider_height) || 625;
  const hoverEffect = str(element.image_hover_effect);
  const lazyLoad = bool(element.owl_lazyload);

  const showNav = bool(element.owl_nav);
  const showDots = bool(element.owl_dots);
  const dotsInside = bool(element.owl_dots_insie);
  const navPosition = str(element.owl_nav_position) || 'center_split';
  const navSize = str(element.owl_nav_size) || 'normal';
  const loop = bool(element.owl_loop);
  const rtl = bool(element.owl_rtl);
  const margin = Number(element.owl_margin) || 0;
  const autoplay = bool(element.owl_autoplay);
  const autoplayTimeout = Number(element.owl_autoplay_timeout) || 5000;

  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => {
      if (count <= 1) return;
      if (next < 0) setActive(loop ? count - 1 : 0);
      else if (next >= count) setActive(loop ? 0 : count - 1);
      else setActive(next);
    },
    [count, loop],
  );

  const prev = useCallback(() => go(active - 1), [active, go]);
  const next = useCallback(() => go(active + 1), [active, go]);

  useEffect(() => {
    if (!autoplay || count <= 1) return;
    timer.current = setInterval(() => {
      setActive((cur) => {
        const n = cur + 1;
        if (n >= count) return loop ? 0 : cur;
        return n;
      });
    }, autoplayTimeout);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [autoplay, autoplayTimeout, count, loop]);

  if (count === 0) return null;

  const carouselClass = [
    'mgz-carousel',
    'owl-carousel',
    dotsInside ? 'mgz-carousel-dot-inside' : '',
    `mgz-carousel-nav-position-${navPosition}`,
    `mgz-carousel-nav-size-${navSize}`,
    hoverEffect ? 'mgz-image-hovers' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={carouselClass}
      data-slider_height={sliderHeight}
      dir={rtl ? 'rtl' : undefined}
      style={{ position: 'relative', overflow: 'hidden', width: '100%' }}
    >
      <div
        className="mgz-carousel-stage"
        style={{
          display: 'flex',
          height: `${sliderHeight}px`,
          transform: `translateX(${(rtl ? 1 : -1) * active * 100}%)`,
          transition: 'transform 0.4s ease',
          flexDirection: rtl ? 'row-reverse' : 'row',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 100%',
              width: '100%',
              height: '100%',
              paddingRight: margin ? `${margin}px` : undefined,
              boxSizing: 'border-box',
            }}
          >
            <Slide
              item={item}
              index={i}
              ctx={ctx}
              lazy={lazyLoad}
              hoverEffect={hoverEffect}
            />
          </div>
        ))}
      </div>

      {showNav && count > 1 && (
        <div className="owl-nav" aria-hidden={false}>
          <button
            type="button"
            className="owl-prev"
            aria-label="Previous slide"
            onClick={prev}
            style={navButtonStyle('prev', rtl)}
          >
            <i className="fa fa-angle-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="owl-next"
            aria-label="Next slide"
            onClick={next}
            style={navButtonStyle('next', rtl)}
          >
            <i className="fa fa-angle-right" aria-hidden="true" />
          </button>
        </div>
      )}

      {showDots && count > 1 && (
        <div
          className="owl-dots"
          role="tablist"
          aria-label="Slide pagination"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: dotsInside ? '12px' : '-24px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 4,
          }}
        >
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to slide ${i + 1}`}
              className={`owl-dot${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                background: i === active ? '#333' : 'rgba(0,0,0,0.35)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function navButtonStyle(dir: 'prev' | 'next', rtl: boolean): React.CSSProperties {
  const onLeft = rtl ? dir === 'next' : dir === 'prev';
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [onLeft ? 'left' : 'right']: '12px',
    zIndex: 4,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.8)',
    color: '#333',
    fontSize: '18px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties;
}
