'use client';
/**
 * NumberCounter — port of element/number_counter.phtml + js/number-counter.js.
 *
 * Interactive counter with three layouts:
 *   - "number": just the animated integer (with optional prefix/suffix/icon/text).
 *   - "circle": an SVG ring whose stroke-dashoffset animates to reflect the value.
 *   - "bars":   a horizontal progress bar whose width animates to the value's percent.
 *
 * Animation runs once, when the element first scrolls into view (the storefront's
 * .mgz-waypoint + mgz:animation:run behaviour), after an optional delay, over
 * `speed` seconds, using jQuery's "swing" easing to match the original.
 *
 * Number type:
 *   - "percent":  value is a percentage; circle/bar fill = value out of 100.
 *   - "standard": circle/bar fill = value out of `max`.
 *
 * Colours that the storefront supplied via its generated CSS bundle are applied
 * inline here (from the style fields, with the Data\Element defaults) so the
 * component is self-contained.
 */
import React, { useEffect, useRef, useState } from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

/** jQuery's "swing" easing: the easing the original animation used. */
function swing(p: number): number {
  return 0.5 - Math.cos(p * Math.PI) / 2;
}

function toNum(v: unknown, fallback = 0): number {
  const n = parseFloat(str(v));
  return Number.isFinite(n) ? n : fallback;
}

/** Optional px sizing: bare number -> "<n>px", anything else passed through. */
function sizeStyle(v: unknown): string | undefined {
  const s = str(v).trim();
  if (!s) return undefined;
  return /^\d+(\.\d+)?$/.test(s) ? `${s}px` : s;
}

/**
 * Format a counting value, mirroring number-counter.js _formatNumber:
 * if the target has no decimals -> integer; otherwise keep up to 2 decimals,
 * and group thousands with ",".
 */
function formatNumber(current: number, target: number): string {
  const targetParts = target.toString().split('.');
  let decLimit = 0;
  let n: number = current;
  if (targetParts.length === 1) {
    n = Math.trunc(current);
  } else if (targetParts.length > 1) {
    decLimit = targetParts[1].length > 2 ? 2 : targetParts[1].length;
  }
  const parts = String(n).split('.');
  let intPart = parts[0];
  let decPart = '';
  if (parts.length > 1) {
    const rounded = parseFloat(parseFloat('.' + parts[1]).toFixed(decLimit));
    if (rounded) decPart = '.' + String(rounded).split('.').pop();
  }
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(intPart)) {
    intPart = intPart.replace(rgx, '$1' + ',' + '$2');
  }
  return intPart + decPart;
}

export function NumberCounter({ element }: MagezonElementProps) {
  const layout = str(element.layout) || 'circle';
  const type = str(element.number_type) || 'percent';
  const number = toNum(element.number, 100);
  const max = toNum(element.max, 100);
  const speedMs = (toNum(element.speed, 1) || 1) * 1000;
  const delaySec = toNum(element.delay, 0);
  const numberPosition = str(element.number_position) || 'inside';

  const beforeText = str(element.before_number_text);
  const afterText = str(element.after_number_text);
  const numberPrefix = str(element.number_prefix);
  const numberSuffix = str(element.number_suffix);
  const numberText = str(element.number_text);
  const icon = str(element.icon);
  const countDown = bool(element.countdown);

  // Circle geometry (mirrors the .phtml math).
  const circleSize = parseInt(str(element.circle_size), 10) || 0;
  const halfSize = circleSize ? circleSize / 2 : 0;
  const circleDashWidth = parseInt(str(element.circle_dash_width), 10) || 0;
  const radius = halfSize - circleDashWidth;
  const lineCap = str(element.linecap) || 'round';
  const circumference = (circleSize - circleDashWidth * 2) * Math.PI;
  const circleBgColor = str(element.circle_background_color) || '#ffffff';

  // Colours (defaults from Data\Element\NumberCounter).
  const barStrokeColor = str(element.circle_color1) || '#a0ce4f';
  const ringTrackColor = str(element.circle_color2) || '#eaeaea';
  const barColor = str(element.bar_color) || '#a0ce4f';
  const barBgColor = str(element.bar_background_color) || '#eaeaea';

  const rootRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState('0');
  // Circle stroke-dashoffset: starts full (empty ring), or 0 when counting down.
  const [dashOffset, setDashOffset] = useState<number>(countDown ? 0 : circumference);
  const [barWidth, setBarWidth] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || startedRef.current) return;

    let rafId = 0;
    let delayId: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      // Target circle offset.
      const ringMax = type === 'percent' ? 100 : max || 1;
      let val = number;
      if (val < 0) val = 0;
      if (val > ringMax) val = ringMax;
      const targetOffset =
        type === 'percent'
          ? ((100 - val) / 100) * circumference
          : (1 - val / ringMax) * circumference;
      const startOffset = countDown ? 0 : circumference;

      // Target bar width (percent).
      let barTarget: number;
      if (type === 'percent') {
        barTarget = number > 100 ? 100 : number;
      } else {
        barTarget = Math.ceil((number / (max || 1)) * 100);
      }
      if (barTarget < 0) barTarget = 0;
      if (barTarget > 100) barTarget = 100;

      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const p = speedMs > 0 ? Math.min(elapsed / speedMs, 1) : 1;
        const eased = swing(p);

        setDisplay(formatNumber(number * eased, number));
        if (layout === 'circle') {
          setDashOffset(startOffset + (targetOffset - startOffset) * eased);
        } else if (layout === 'bars') {
          setBarWidth(barTarget * eased);
        }

        if (p < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setDisplay(formatNumber(number, number));
          if (layout === 'circle') setDashOffset(targetOffset);
          if (layout === 'bars') setBarWidth(barTarget);
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      if (delaySec > 0) {
        delayId = setTimeout(run, delaySec * 1000);
      } else {
        run();
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      start();
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (delayId) clearTimeout(delayId);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            start();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      if (delayId) clearTimeout(delayId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The number/icon/text block, reused across positions.
  const numberStyle: React.CSSProperties = {};
  const ns = sizeStyle(element.number_size);
  if (str(element.number_color)) numberStyle.color = str(element.number_color);
  if (ns) numberStyle.fontSize = ns;

  const iconStyle: React.CSSProperties = {};
  const is = sizeStyle(element.icon_size);
  if (str(element.icon_color)) iconStyle.color = str(element.icon_color);
  if (is) iconStyle.fontSize = is;

  const textStyle: React.CSSProperties = {};
  const ts = sizeStyle(element.text_size);
  if (str(element.text_color)) textStyle.color = str(element.text_color);
  if (ts) textStyle.fontSize = ts;

  const renderString = () => (
    <div className="mgz-numbercounter-string" style={numberStyle}>
      {numberPrefix}
      {numberText || icon ? (
        <>
          {numberText ? (
            <span className="mgz-numbercounter-number-text" style={textStyle}>
              {numberText}
            </span>
          ) : null}
          {icon ? (
            <i className={`mgz-numbercounter-icon ${icon}`} style={iconStyle} />
          ) : null}
        </>
      ) : (
        <>
          <span className="mgz-numbercounter-int">{display}</span>
          {type === 'percent' ? (
            <span className="mgz-numbercounter-number-percent">%</span>
          ) : null}
          {icon ? (
            <i className={`mgz-numbercounter-icon ${icon}`} style={iconStyle} />
          ) : null}
        </>
      )}
      {numberSuffix}
    </div>
  );

  const beforeStyle: React.CSSProperties = {};
  if (str(element.before_text_color)) beforeStyle.color = str(element.before_text_color);
  const bts = sizeStyle(element.before_text_size);
  if (bts) beforeStyle.fontSize = bts;

  const afterStyle: React.CSSProperties = {};
  if (str(element.after_text_color)) afterStyle.color = str(element.after_text_color);
  const ats = sizeStyle(element.after_text_size);
  if (ats) afterStyle.fontSize = ats;

  return (
    <div
      ref={rootRef}
      className={`mgz-numbercounter-content mgz-waypoint mgz-numbercounter mgz-numbercounter-${layout} mgz-numbercounter-number-position-${numberPosition}`}
    >
      <div className="mgz-numbercounter-text">
        {beforeText ? (
          <span className="mgz-numbercounter-before-text" style={beforeStyle}>
            {beforeText}
          </span>
        ) : null}

        {(layout === 'number' || layout === 'circle') && renderString()}

        {layout === 'bars' ? (
          <>
            {numberPosition === 'above' ? renderString() : null}
            <div
              className="mgz-numbercounter-bars-container"
              style={{
                backgroundColor: barBgColor,
                borderRadius: 3,
                overflow: 'hidden',
                width: '100%',
              }}
            >
              <div
                className="mgz-numbercounter-bar"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: barColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  minHeight: '1.5em',
                  transition: 'none',
                }}
              >
                {numberPosition === 'inside' ? renderString() : null}
              </div>
            </div>
            {numberPosition === 'bellow' ? renderString() : null}
          </>
        ) : null}

        {afterText ? (
          <span className="mgz-numbercounter-after-text" style={afterStyle}>
            {afterText}
          </span>
        ) : null}
      </div>

      {layout === 'circle' && circleSize ? (
        <div className="svg-container">
          <svg
            className="svg"
            viewBox={`0 0 ${circleSize} ${circleSize}`}
            version="1.1"
            preserveAspectRatio="xMinYMin meet"
            width={circleSize}
            height={circleSize}
          >
            <circle
              fill={circleBgColor}
              className="mgz-element-bar-bg"
              r={radius}
              cx={halfSize}
              cy={halfSize}
              stroke={ringTrackColor}
              strokeWidth={circleDashWidth}
              strokeDasharray={circumference}
              strokeDashoffset={0}
              strokeLinecap={lineCap as 'butt' | 'round' | 'square'}
            />
            <circle
              className="mgz-element-bar"
              r={radius}
              cx={halfSize}
              cy={halfSize}
              fill="transparent"
              stroke={barStrokeColor}
              strokeWidth={circleDashWidth}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${halfSize} ${halfSize})`}
              strokeLinecap={lineCap as 'butt' | 'round' | 'square'}
            />
          </svg>
        </div>
      ) : null}
    </div>
  );
}
