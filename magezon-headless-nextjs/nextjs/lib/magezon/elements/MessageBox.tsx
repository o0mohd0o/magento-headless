/**
 * MessageBox — port of element/message_box.phtml.
 *
 * phtml markup:
 *   <div class="mgz-message-box mgz-message-box-{style} mgz-message-box-{shape}">
 *     <div class="mgz-message-box-icon"><i class="{icon}"></i></div>
 *     <div class="mgz-message-box-content">{filter(content)}</div>
 *   </div>
 *
 * The .phtml reads `message_box_style` / `message_box_shape` for class hooks and
 * `icon` + `content`. All the colour / border / icon design fields are normally
 * emitted by Block\Element\MessageBox::getAdditionalStyleHtml() as a scoped
 * <style> block (.mgz-message-box, .mgz-message-box-icon, .mgz-message-box-icon i).
 * The <ElementWrapper> does NOT reproduce that style block, so to stay faithful
 * we fold those design values back in as inline styles here.
 *
 * `content` is rich HTML from the WYSIWYG editor (PHP runs it through
 * $coreHelper->filter()). Generic Magento directives ({{widget}}, {{config}}…)
 * are NOT expanded here — see the Text component note. Sanitize upstream if the
 * content is not fully trusted.
 *
 * Defaults (from Data\Element\MessageBox): icon "fas mgz-fa-info-circle",
 * preset "info" → color #5e7f96, bg #dff2fe, border #cfebfe, icon #56b0ee.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

export function MessageBox({ element }: MagezonElementProps) {
  const boxStyle = str(element.message_box_style);
  const boxShape = str(element.message_box_shape);
  const icon = str(element.icon) || 'fas mgz-fa-info-circle';
  const content = str(element.content);

  // Box design (Block\Element\MessageBox::getAdditionalStyleHtml — box rules).
  const boxColor = str(element.message_box_color);
  const boxBg = str(element.message_box_background_color);
  const boxBorderColor = str(element.message_box_border_color);
  const boxBorderWidth = str(element.message_box_border_width);
  const boxBorderStyle = str(element.message_box_border_style);
  const boxBorderRadius = str(element.message_box_border_radius);

  const boxCss: React.CSSProperties = {};
  if (boxColor) boxCss.color = boxColor;
  if (boxBorderColor) boxCss.borderColor = boxBorderColor;
  if (boxBg) boxCss.backgroundColor = boxBg;
  // PHP only emits border-width/border-style when a width is set.
  if (boxBorderWidth) {
    boxCss.borderWidth = boxBorderWidth;
    if (boxBorderStyle) boxCss.borderStyle = boxBorderStyle;
  }
  if (boxBorderRadius) boxCss.borderRadius = boxBorderRadius;

  // Icon design — wrapper background colour, and i color/background/font-size.
  const iconColor = str(element.message_icon_color);
  const iconBg = str(element.message_icon_background_color);
  const iconSize = str(element.icon_size);

  // Wrapper rule: .mgz-message-box-icon { color; background-color }.
  const iconWrapCss: React.CSSProperties = {};
  if (iconColor) iconWrapCss.color = iconColor;
  if (iconBg) iconWrapCss.backgroundColor = iconBg;

  // <i> rule: .mgz-message-box-icon i { color; background-color; font-size }.
  const iconCss: React.CSSProperties = {};
  if (iconColor) iconCss.color = iconColor;
  if (iconBg) iconCss.backgroundColor = iconBg;
  // icon_size is a raw number in the form; getStyleProperty would append px.
  if (iconSize) iconCss.fontSize = /^\d+$/.test(iconSize) ? `${iconSize}px` : iconSize;

  const className = ['mgz-message-box', boxStyle && `mgz-message-box-${boxStyle}`, boxShape && `mgz-message-box-${boxShape}`]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} style={Object.keys(boxCss).length ? boxCss : undefined}>
      <div className="mgz-message-box-icon" style={Object.keys(iconWrapCss).length ? iconWrapCss : undefined}>
        <i className={icon} style={Object.keys(iconCss).length ? iconCss : undefined} />
      </div>
      <div className="mgz-message-box-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

// Silence unused-import lint if helpers vary across the codebase.
void bool;
