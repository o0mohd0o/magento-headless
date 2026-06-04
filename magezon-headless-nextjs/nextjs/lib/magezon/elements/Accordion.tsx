'use client';
/**
 * Accordion — port of element/accordion.phtml (collection element).
 *
 * Structure: an optional heading block (title/description) followed by a list of
 * collapsible panels. Each panel is an AccordionSection child element living in
 * element.elements; its own inner content lives in section.elements and is
 * rendered with <MagezonElements/>.
 *
 * Accordion-level fields: title, title_align (def center), title_tag (def h2),
 * description, show_line, section_align, accordion_icon (def plus; ''/chevron/
 * plus/triangle/dot/custom), icon_position (def left), icon + active_icon (used
 * only when accordion_icon === 'custom'), active_sections (comma list, 1-based),
 * collapsible_all, at_least_one_open, no_fill_content_area.
 * Section fields: title, add_icon, icon, icon_position (def left).
 *
 * Behavior (port of js/collapse.js, no jQuery): clicking a heading toggles its
 * panel. When collapsible_all is off, opening one panel closes the others. When
 * at_least_one_open is on, the currently-open panel cannot be closed by clicking
 * its own heading.
 */
import React from 'react';
import type { MagezonElementProps, MagezonElement } from '../types';
import { MagezonElements } from '../MagezonElement';
import { bool, str } from '../media';

const HEADING_TAGS: ReadonlySet<string> = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p']);

export function Accordion({ element, ctx }: MagezonElementProps) {
  const children = Array.isArray(element.elements) ? (element.elements as MagezonElement[]) : [];
  const sections = children.filter((c) => c && !bool((c as MagezonElement).disable_element));
  const count = sections.length;

  // Heading
  const title = str(element.title);
  const description = str(element.description);
  const titleAlign = str(element.title_align) || 'center';
  const titleTag = (HEADING_TAGS.has(str(element.title_tag)) ? str(element.title_tag) : 'h2') as keyof React.JSX.IntrinsicElements;
  const showLine = bool(element.show_line);

  // Section / icon config
  const sectionAlign = str(element.section_align) || 'left';
  const iconPosition = str(element.icon_position) || 'left';
  const accordionIcon = str(element.accordion_icon); // '' | chevron | plus | triangle | dot | custom
  const isCustomIcon = accordionIcon === 'custom';
  const baseIcon = isCustomIcon ? str(element.icon) : '';
  const activeIcon = isCustomIcon ? str(element.active_icon) : '';
  const noFillContentArea = bool(element.no_fill_content_area);
  const collapsibleAll = bool(element.collapsible_all);
  const atLeastOneOpen = bool(element.at_least_one_open);

  // active_sections is a comma-separated list of 1-based indexes
  const activeSet = React.useMemo(() => {
    const raw = str(element.active_sections);
    const set = new Set<number>();
    if (raw) {
      for (const part of raw.split(',')) {
        const n = parseInt(part.trim(), 10);
        if (!Number.isNaN(n)) set.add(n);
      }
    }
    return set;
  }, [element.active_sections]);

  // Open state keyed by section index (0-based). active_sections is 1-based.
  const [open, setOpen] = React.useState<Set<number>>(() => {
    const init = new Set<number>();
    sections.forEach((_, i) => {
      if (activeSet.has(i + 1)) init.add(i);
    });
    return init;
  });

  const toggle = React.useCallback(
    (index: number) => {
      setOpen((prev) => {
        const isOpen = prev.has(index);
        // at_least_one_open: cannot close the currently-open panel via its own heading.
        if (isOpen && atLeastOneOpen) return prev;
        const next = collapsibleAll ? new Set(prev) : new Set<number>();
        if (isOpen) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    },
    [atLeastOneOpen, collapsibleAll],
  );

  if (!count) return null;

  return (
    <div className="mgz-block">
      {(title || description) && (
        <div className={`mgz-block-heading mgz-block-heading-align-${titleAlign}${showLine ? ' mgz-block-heading-line' : ''}`}>
          {title && React.createElement(titleTag, { className: 'title', dangerouslySetInnerHTML: { __html: title } })}
          {description && <div className="info" dangerouslySetInnerHTML={{ __html: description }} />}
        </div>
      )}
      <div className="mgz-block-content">
        <div className={`mgz-panels mgz-panels-${str(element.id)}${noFillContentArea ? ' mgz-panels-no-fill-content' : ''}`}>
          {sections.map((section, index) => {
            const isOpen = open.has(index);
            const sectionTitle = str(section.title);
            const addIcon = bool(section.add_icon);
            const secIcon = str(section.icon);
            const secIconPos = str(section.icon_position) || 'left';
            const showSecIconLeft = addIcon && secIcon && secIconPos === 'left';
            const showSecIconRight = addIcon && secIcon && secIconPos === 'right';
            const accIconClass = isOpen ? activeIcon : baseIcon;
            const panelId = `tab-${str(section.id)}`;

            const panelClasses = [
              'mgz-panel',
              isOpen ? 'mgz-active mgz-in' : '',
              index === 0 ? 'mgz-panel-first' : '',
              index === count - 1 ? 'mgz-panel-last' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div className={panelClasses} key={str(section.id) || index}>
                <div className={`mgz-panel-heading mgz-text-${sectionAlign} mgz-icon-position-${iconPosition}`}>
                  <h4 className="mgz-panel-heading-title">
                    <button
                      type="button"
                      className={accordionIcon ? 'has-icon' : undefined}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        font: 'inherit',
                        color: 'inherit',
                        cursor: 'pointer',
                        textAlign: 'inherit',
                        width: '100%',
                        display: 'block',
                      }}
                    >
                      {accordionIcon && <i className={`mgz-accoridon-icon-${accordionIcon} ${accIconClass}`.trim()} />}
                      <span>
                        {showSecIconLeft && <i className={secIcon} />}
                        {sectionTitle}
                        {showSecIconRight && <i className={secIcon} />}
                      </span>
                    </button>
                  </h4>
                </div>
                <div className="mgz-panel-body" id={panelId} hidden={!isOpen} style={{ display: isOpen ? 'block' : 'none' }}>
                  <div className="mgz-panel-body-inner">
                    <MagezonElements elements={section.elements} ctx={ctx} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
