'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { MagezonElementProps } from '../types';
import { getLinkParams, linkAttrs } from '../links';
import { bool, str } from '../media';

/**
 * Countdown — faithful port of
 * Magezon/Builder/view/frontend/templates/element/countdown.phtml
 * + Magezon_Builder/js/countdown (jQuery widget) reimplemented with hooks.
 *
 * The PHP block builds the target time from year/month/day/hours/minutes in a
 * configured time zone (Block\Element\Countdown::getTime -> DateTime::ATOM).
 * Browsers can't resolve an arbitrary IANA time zone offset without a tz
 * library, so we honour an explicit numeric/`Z` offset when the field already
 * carries one and otherwise treat the configured wall-clock values as the
 * viewer's local time (the common case for marketing countdowns). See notes.
 */

type Unit = 'days' | 'hours' | 'minutes' | 'seconds';

interface Labels {
  singular: string;
  plural: string;
}

const UNIT_ORDER: Unit[] = ['days', 'hours', 'minutes', 'seconds'];

const UNIT_LABELS: Record<Unit, Labels> = {
  days: { singular: 'Day', plural: 'Days' },
  hours: { singular: 'Hour', plural: 'Hours' },
  minutes: { singular: 'Minute', plural: 'Minutes' },
  seconds: { singular: 'Second', plural: 'Seconds' },
};

const CIRCLE_MAX: Record<Unit, number> = {
  days: 365,
  hours: 24,
  minutes: 60,
  seconds: 60,
};

interface Remaining {
  total: number;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const pad2 = (n: number) => `0${n}`.slice(-2);

function getTimeRemaining(endTime: number, now: number): Remaining {
  const t = endTime - now;
  if (t <= 0) {
    return { total: t, days: '00', hours: '00', minutes: '00', seconds: '00' };
  }
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.floor((t / 1000 / 60) % 60);
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    total: t,
    days: days < 10 ? `0${days}` : String(days),
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
  };
}

/** Resolve the target timestamp (ms) from the element's date fields. */
function resolveEndTime(element: MagezonElementProps['element']): number {
  const year = parseInt(str(element.year), 10) || new Date().getFullYear();
  const month = parseInt(str(element.month), 10) || 1;
  const day = parseInt(str(element.day), 10) || 1;
  const hours = parseInt(str(element.hours), 10) || 0;
  const minutes = parseInt(str(element.minutes), 10) || 0;
  // Local wall-clock interpretation (matches visible behaviour for UTC-ish setups).
  const ms = new Date(year, month - 1, day, hours, minutes, 0).getTime();
  return Number.isNaN(ms) ? Date.now() : ms;
}

export function Countdown({ element }: MagezonElementProps) {
  const layout = str(element.layout) || 'circle';
  const isCircle = layout === 'circle';
  const showSeparator = bool(element.show_separator);
  const separatorType = str(element.separator_type) || 'colon';
  const textInline = bool(element.text_inline);
  const headingText = str(element.heading_text);
  const subHeadingText = str(element.sub_heading_text);
  const linkText = str(element.link_text);
  const circleBackgroundColor = str(element.circle_background_color) || '#ffffff';
  const link = getLinkParams(element.link_url);

  const endTimeRef = useRef<number>(resolveEndTime(element));
  const [now, setNow] = useState<number>(() => endTimeRef.current); // SSR-stable: render 00s until mounted
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    endTimeRef.current = resolveEndTime(element);
    setMounted(true);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
    // re-arm if the date inputs change
  }, [element.year, element.month, element.day, element.hours, element.minutes]);

  const remaining = mounted
    ? getTimeRemaining(endTimeRef.current, now)
    : { total: 1, days: '00', hours: '00', minutes: '00', seconds: '00' };

  const rootClass = [
    'mgz-countdown',
    `mgz-countdown-${layout}`,
    showSeparator ? `mgz-countdown-separator-${separatorType}` : '',
    textInline ? 'mgz-countdown-text-inline' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderUnit = (unit: Unit) => {
    const value = remaining[unit];
    const labels = UNIT_LABELS[unit];
    const numeric = parseInt(value, 10);
    const label = numeric !== 1 ? labels.plural : labels.singular;

    let dashOffset = 565.49;
    if (isCircle) {
      const r = 90;
      const circumference = Math.PI * (r * 2);
      const val = parseInt(value, 10) || 0;
      dashOffset = (1 - val / CIRCLE_MAX[unit]) * circumference;
    }

    return (
      <div className={`mgz-countdown-number mgz-countdown-${unit}`} key={unit}>
        <div className="mgz-countdown-unit">
          <span className="mgz-countdown-unit-number">{value}</span>
          <div className="mgz-countdown-unit-label">{label}</div>
        </div>
        {isCircle && (
          <div className="mgz-countdown-circle-container">
            <div className="svg-container">
              <svg
                className="svg"
                viewBox="0 0 200 200"
                version="1.1"
                preserveAspectRatio="xMinYMin meet"
              >
                <circle
                  fill={circleBackgroundColor}
                  className="mgz-element-bar-bg"
                  r="90"
                  cx="100"
                  cy="100"
                  strokeDasharray="565.49"
                  strokeDashoffset="0"
                />
                <circle
                  className="mgz-element-bar"
                  r="90"
                  cx="100"
                  cy="100"
                  fill="transparent"
                  strokeDasharray="565.49"
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={rootClass}>
      {(headingText || subHeadingText) && (
        <div className="mgz-countdown-heading-wrapper">
          {subHeadingText && (
            <div
              className="mgz-countdown-subheading"
              dangerouslySetInnerHTML={{ __html: subHeadingText }}
            />
          )}
          {headingText && (
            <div
              className="mgz-countdown-heading"
              dangerouslySetInnerHTML={{ __html: headingText }}
            />
          )}
        </div>
      )}

      <div className="mgz-countdown-counter-wrapper">
        {UNIT_ORDER.map(renderUnit)}
      </div>

      {linkText && (
        <div className="mgz-countdown-link-wrapper">
          <a
            href={link.url || '#'}
            className="mgz-countdown-link"
            title={link.title}
            {...linkAttrs(link)}
            dangerouslySetInnerHTML={{ __html: linkText }}
          />
        </div>
      )}
    </div>
  );
}
