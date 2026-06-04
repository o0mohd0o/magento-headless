'use client';
/**
 * Tabs — faithful React port of Magezon\Builder element/tabs.phtml.
 *
 * A client-collection element: each child in `element.elements` is a "tab"
 * sub-element. The child's own fields (title, add_icon, icon, icon_position)
 * drive the nav, and the child's wrapped content (rendered through
 * <MagezonElements/> so it gets its ElementWrapper, mirroring the PHP
 * `$_element->toHtml()`) is the tab body.
 *
 * Interactivity (active tab, hover-to-activate) is reimplemented with React
 * hooks — the original used Magezon_Builder/js/tabs (jQuery). `active_tab` is
 * 1-based; leaving it empty or pointing at a non-existent tab closes all tabs
 * on load, matching the storefront tooltip.
 */
import React, { useState } from 'react';
import type { MagezonElementProps, MagezonElement } from '../types';
import { MagezonElements } from '../MagezonElement';
import { bool, str } from '../media';

export function Tabs({ element, ctx }: MagezonElementProps) {
  const allChildren = Array.isArray(element.elements) ? element.elements : [];

  // hide_empty_tab: the PHP checks the rendered child for more than one
  // ".mgz-element-inner" (i.e. the tab actually contains inner elements).
  // We approximate that by requiring the child to have nested elements.
  const hideEmptyTab = bool(element.hide_empty_tab);
  const tabs: MagezonElement[] = hideEmptyTab
    ? allChildren.filter(
        (child) =>
          Array.isArray((child as MagezonElement).elements) &&
          ((child as MagezonElement).elements as MagezonElement[]).length > 0
      )
    : allChildren;

  // active_tab is 1-based. hasData('active_tab') ? value-1 : 0
  const rawActive = element.active_tab;
  const hasActive = rawActive !== undefined && rawActive !== null && str(rawActive) !== '';
  const activeTabIndex = hasActive ? parseInt(str(rawActive), 10) - 1 : 0;

  const [active, setActive] = useState<number>(activeTabIndex);

  const hoverActive = bool(element.hover_active);
  const noFill = bool(element.no_fill_content_area);
  const mobileAccordion = bool(element.mobile_accordion);
  const tabAlign = str(element.tab_align) || 'left';
  const tabPosition = str(element.tab_position) || 'top';
  const spacing = parseFloat(str(element.spacing)) || 0;
  const gap = parseFloat(str(element.gap)) || 0;
  const tabsId = str(element.id);

  if (tabs.length === 0) return null;

  const rootClasses = [
    'mgz-tabs',
    `mgz-tabs-${tabsId}`,
    `mgz-element-tab-align-${tabAlign}`,
    `mgz-element-tab-position-${tabPosition}`,
    noFill ? 'mgz-tabs-no-fill-content' : '',
    mobileAccordion ? 'tabs-mobile-accordion' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const activateTab = (index: number) => setActive(index);

  return (
    <div
      className={rootClasses}
      data-spacing={spacing}
      data-gap={gap}
      style={gap ? { gap: `${gap}px` } : undefined}
    >
      <div className="mgz-tabs-nav" role="tablist">
        {tabs.map((tab, index) => {
          const childId = str(tab.id);
          const addIcon = bool(tab.add_icon);
          const iconClass = str(tab.icon);
          const iconPosition = str(tab.icon_position) || 'left';
          const showIcon = addIcon && iconClass;
          const isActive = index === active;
          const panelId = `tab-${childId}`;

          return (
            <div
              key={childId || index}
              className={`${childId} tab-${childId}-title mgz-tabs-tab-title${
                isActive ? ' mgz-active' : ''
              }`}
              data-id={`${panelId}-title`}
              role="presentation"
              onMouseEnter={hoverActive ? () => activateTab(index) : undefined}
            >
              <a
                href={`#${panelId}`}
                data-id={`#${panelId}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                onClick={(e) => {
                  e.preventDefault();
                  activateTab(index);
                }}
              >
                {showIcon && iconPosition === 'left' ? <i className={iconClass} /> : null}
                <span>{str(tab.title)}</span>
                {showIcon && iconPosition === 'right' ? <i className={iconClass} /> : null}
                <span className="tabs-opener" />
              </a>
            </div>
          );
        })}
      </div>
      <div className="mgz-tabs-content">
        {tabs.map((tab, index) => {
          const childId = str(tab.id);
          const isActive = index === active;
          const panelId = `tab-${childId}`;

          return (
            <div
              key={childId || index}
              className={`${childId} tab-${childId}-content mgz-tabs-tab-content${
                isActive ? ' mgz-active' : ''
              }`}
              id={panelId}
              role="tabpanel"
              aria-labelledby={`${panelId}-title`}
              hidden={!isActive}
              style={!isActive ? { display: 'none' } : undefined}
            >
              {/* Render the tab's content via the standard pipeline so the
                  child element gets its own ElementWrapper (padding/border/bg),
                  mirroring `$_element->toHtml()` in the PHP template. */}
              <MagezonElements elements={[tab]} ctx={ctx} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
