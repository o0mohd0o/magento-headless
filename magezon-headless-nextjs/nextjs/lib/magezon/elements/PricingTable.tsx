/**
 * PricingTable — port of element/pricing_table.phtml.
 *
 * Static (non-interactive) element. Renders a row of pricing cards from the
 * repeatable `items` dynamic-rows field. Each item carries a heading
 * (title/sub_title), a price block (currency/price/period), a list of feature
 * rows (icon + icon_color + title), and a CTA button (button_text/button_link).
 *
 * Faithful notes vs the .phtml:
 *  - `items` and each item's `features` are repeatable rows → real JS arrays here
 *    (the PHP wraps them via toObjectArray()); guarded with Array.isArray.
 *  - title / sub_title / feature title / button_text are echoed RAW in PHP
 *    (HTML allowed), so we mirror that with dangerouslySetInnerHTML.
 *  - The price block renders when price is a non-empty string (PHP `$price != ''`,
 *    which still shows "0").
 *  - icon_color is applied inline only when present, matching the conditional
 *    style attr in the template.
 *  - Wrapper/spacing/border/background are added by <ElementWrapper>; we only
 *    emit the inner `.mgz-pricing-table-wrapper` content.
 */
import React from 'react';
import type { MagezonElementProps, MagezonElement } from '../types';
import { getLinkParams, linkAttrs } from '../links';
import { bool, str } from '../media';

interface FeatureRow {
  icon?: unknown;
  icon_color?: unknown;
  title?: unknown;
}

export function PricingTable({ element }: MagezonElementProps) {
  const items = Array.isArray(element.items) ? (element.items as MagezonElement[]) : [];
  if (items.length === 0) return null;

  const type = str(element.table_type) || 'type1';

  return (
    <div className={`mgz-pricing-table-wrapper mgz-pricing-table-${type}`}>
      {items.map((item, i) => {
        const title = str(item.title);
        const subTitle = str(item.sub_title);
        const price = str(item.price);
        const currency = str(item.currency);
        const period = str(item.period);
        const buttonText = str(item.button_text);
        const customClasses = str(item.custom_classes);
        const featured = bool(item.featured);
        const link = getLinkParams(item.button_link);
        const features = Array.isArray(item.features) ? (item.features as FeatureRow[]) : [];

        const cardClass = [
          'mgz-pricing-table',
          customClasses,
          featured ? 'mgz-pricing-table-featured' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div className={cardClass} key={i}>
            <div className="mgz-pricing-table-inner">
              {title ? (
                <div className="mgz-pricing-table-heading">
                  <h2
                    className="mgz-pricing-table-title"
                    dangerouslySetInnerHTML={{ __html: title }}
                  />
                  <span
                    className="mgz-pricing-table-subtitle"
                    dangerouslySetInnerHTML={{ __html: subTitle }}
                  />
                </div>
              ) : null}

              <div className="mgz-pricing-table-content-wrapper">
                {price !== '' ? (
                  <div className="mgz-pricing-table-content-top">
                    <div className="mgz-pricing-table-meta">
                      {currency ? (
                        <span className="mgz-pricing-table-currency">{currency}</span>
                      ) : null}
                      <span className="mgz-pricing-table-price">{price}</span>
                      {period ? (
                        <span className="mgz-pricing-table-period">{period}</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {features.length > 0 ? (
                  <div className="mgz-pricing-table-content">
                    <ul>
                      {features.map((feature, fi) => {
                        const fIcon = str(feature.icon);
                        const fIconColor = str(feature.icon_color);
                        const fTitle = str(feature.title);
                        return (
                          <li key={fi}>
                            {fIcon ? (
                              <i
                                className={fIcon}
                                style={fIconColor ? { color: fIconColor } : undefined}
                              />
                            ) : null}
                            <span dangerouslySetInnerHTML={{ __html: fTitle }} />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}

                {buttonText ? (
                  <div className="mgz-pricing-table-button">
                    <a
                      className="mgz-btn"
                      href={link.url || '#'}
                      title={link.title}
                      {...linkAttrs(link)}
                      dangerouslySetInnerHTML={{ __html: buttonText }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
