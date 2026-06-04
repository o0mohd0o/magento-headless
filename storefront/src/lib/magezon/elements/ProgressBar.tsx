'use client';
/**
 * ProgressBar — port of element/progress_bar.phtml + js/number-counter.js.
 *
 * Renders a list of animated "single bars". Each bar fills from 0% to its
 * `value`% and its number counts up from 0 to `value` once the element scrolls
 * into view (mirrors the storefront `mgz-waypoint` + `mgz:animation:run`
 * trigger). No jQuery — animation is driven by requestAnimationFrame with a
 * "swing" easing (jQuery's default), honoring `speed` (seconds) and `delay`
 * (seconds).
 *
 * Repeatable rows live in `element.items` (label, value + per-item colors).
 * General fields: speed, delay, units, striped, text_position, bar_height,
 * bar_border_radius, label_font_size, label_font_weight, bar_border_style,
 * bar_border_width.
 */
import React, { useEffect, useRef, useState } from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

interface BarItem {
  label: string;
  value: number;
  color: string;
  background_color: string;
  unfilled_color: string;
  border_color: string;
}

/** jQuery's default "swing" easing. */
function swing(p: number): number {
  return 0.5 - Math.cos(p * Math.PI) / 2;
}

/** Format a number the way number-counter._formatNumber does (thousands sep, capped decimals). */
function formatNumber(now: number, end: number): string {
  const endParts = end.toString().split('.');
  let decLimit = 0;
  let n: number = now;
  if (endParts.length === 1) {
    n = Math.trunc(now);
  } else if (endParts.length > 1) {
    decLimit = endParts[1].length > 2 ? 2 : endParts[1].length;
  }
  let s = String(n);
  const x = s.split('.');
  let x1 = x[0];
  let x2 = x.length > 1 ? parseFloat(parseFloat('.' + x[1]).toFixed(decLimit)) : NaN;
  const decPart = !Number.isNaN(x2) && x2 !== 0 ? '.' + String(x2).split('.').pop() : '';
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1,$2');
  }
  return x1 + decPart;
}

function toLengthValue(raw: string): string {
  if (!raw) return '';
  return /^-?\d+(\.\d+)?$/.test(raw) ? `${raw}px` : raw;
}

export function ProgressBar({ element }: MagezonElementProps) {
  const rawItems = Array.isArray(element.items) ? (element.items as Record<string, unknown>[]) : [];
  const items: BarItem[] = rawItems.map((it) => ({
    label: str(it.label),
    value: parseFloat(str(it.value)) || 0,
    color: str(it.color),
    background_color: str(it.background_color),
    unfilled_color: str(it.unfilled_color),
    border_color: str(it.border_color),
  }));

  const speedMs = (parseFloat(str(element.speed)) || 1) * 1000;
  const delayMs = (parseFloat(str(element.delay)) || 0) * 1000;
  const unit = str(element.units) || '%';
  const striped = bool(element.striped);
  const textPosition = str(element.text_position) || 'inside';

  const barHeight = toLengthValue(str(element.bar_height));
  const barRadius = toLengthValue(str(element.bar_border_radius));
  const labelFontSize = toLengthValue(str(element.label_font_size));
  const labelFontWeight = str(element.label_font_weight);
  const borderStyle = str(element.bar_border_style);
  const borderWidth = toLengthValue(str(element.bar_border_width));

  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Waypoint: start animating when the element enters the viewport (once).
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setActive(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <div ref={rootRef} className={`mgz-progress-bar mgz-progress-bar-text-position-${textPosition}`}>
      {items.map((item, i) => (
        <SingleBar
          key={i}
          index={i}
          item={item}
          active={active}
          speedMs={speedMs}
          delayMs={delayMs}
          unit={unit}
          striped={striped}
          textPosition={textPosition}
          barHeight={barHeight}
          barRadius={barRadius}
          labelFontSize={labelFontSize}
          labelFontWeight={labelFontWeight}
          borderStyle={borderStyle}
          borderWidth={borderWidth}
        />
      ))}
    </div>
  );
}

interface SingleBarProps {
  index: number;
  item: BarItem;
  active: boolean;
  speedMs: number;
  delayMs: number;
  unit: string;
  striped: boolean;
  textPosition: string;
  barHeight: string;
  barRadius: string;
  labelFontSize: string;
  labelFontWeight: string;
  borderStyle: string;
  borderWidth: string;
}

function SingleBar({
  index,
  item,
  active,
  speedMs,
  delayMs,
  unit,
  striped,
  textPosition,
  barHeight,
  barRadius,
  labelFontSize,
  labelFontWeight,
  borderStyle,
  borderWidth,
}: SingleBarProps) {
  const target = item.value > 100 ? 100 : item.value < 0 ? 0 : item.value;
  const [width, setWidth] = useState(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let start = 0;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = speedMs > 0 ? Math.min(elapsed / speedMs, 1) : 1;
      const eased = swing(p);
      setWidth(eased * target);
      setDisplay(formatNumber(eased * item.value, item.value));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setWidth(target);
        setDisplay(formatNumber(item.value, item.value));
      }
    };

    const run = () => {
      raf = requestAnimationFrame(tick);
    };

    if (delayMs > 0) {
      timer = setTimeout(run, delayMs);
    } else {
      run();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [active, speedMs, delayMs, target, item.value]);

  const labelStyle: React.CSSProperties = {};
  if (labelFontSize) labelStyle.fontSize = labelFontSize;
  if (labelFontWeight) labelStyle.fontWeight = labelFontWeight as React.CSSProperties['fontWeight'];

  const labelBlock = (
    <div className="mgz-single-bar-label-wrapper mgz-numbercounter-string" style={labelStyle}>
      <span className="mgz-numbercounter-label">{item.label}</span>{' '}
      <span className="mgz-numbercounter-int-wrapper">
        <span className="mgz-numbercounter-int">{display}</span>
        {unit}
      </span>
    </div>
  );

  // Outer track (unfilled) styling.
  const innerStyle: React.CSSProperties = {};
  if (barHeight) innerStyle.height = barHeight;
  if (barRadius) innerStyle.borderRadius = barRadius;
  if (item.unfilled_color) innerStyle.backgroundColor = item.unfilled_color;
  if (borderStyle && borderStyle !== 'none') {
    innerStyle.borderStyle = borderStyle;
    innerStyle.borderWidth = borderWidth || '1px';
    if (item.border_color) innerStyle.borderColor = item.border_color;
  }

  // Filled bar styling.
  const filledStyle: React.CSSProperties = {
    width: `${width}%`,
    height: '100%',
    transition: 'none',
  };
  if (item.background_color) filledStyle.backgroundColor = item.background_color;
  if (item.color) filledStyle.color = item.color;
  if (barRadius) filledStyle.borderRadius = barRadius;

  return (
    <div className={`mgz-single-bar mgz-waypoint mgz-single-bar-${index}`}>
      {textPosition === 'above' && labelBlock}
      <div className="mgz-single-bar-inner" style={innerStyle}>
        {textPosition === 'inside' && labelBlock}
        <div
          className={`mgz-numbercounter-bar${striped ? ' mgz-bar-striped' : ''}`}
          style={filledStyle}
        />
      </div>
      {textPosition === 'below' && labelBlock}
    </div>
  );
}
