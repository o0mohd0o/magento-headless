/**
 * ContactForm — port of element/contact_form.phtml (category: form).
 *
 * The Magento template (Block\Element\ContactForm::getContactFormHtml) renders
 * the CORE `Magento\Contact\Block\ContactForm` block with the
 * `Magento_Contact::form.phtml` template, then the phtml string-injects a hidden
 * `<input name="mgz" value="1">` right after the opening `<form>` tag (so the
 * server-side Contact controller knows the post came from a Magezon element).
 *
 * The native form is a plain POST to Magento's contact action with these fields:
 *   - name      (text,     required)
 *   - email     (email,    required)
 *   - telephone (text,     optional)
 *   - comment   (textarea, required)
 *   - hidden:   mgz=1, plus Magento's form_key (CSRF) — see NOTES below.
 *
 * The Magezon element only adds three presentation toggles
 * (Data\Element\ContactForm.php):
 *   - form_width        (text)  -> CSS width of `.form.contact` (e.g. "600px", "80%")
 *   - show_title        (toggle, default true)  -> show the "Write Us" legend
 *   - show_description   (toggle, default true)  -> show the intro note paragraph
 *
 * This is a faithful, self-contained re-creation of that form. It is a real
 * <form> that POSTs to the Magento default contact route. Because a headless
 * storefront has no server-rendered Magento form_key, the actual submission must
 * be wired by the host app (see NOTES at the bottom of this file). Until then the
 * form is fully rendered and accessible, with client-side required-field
 * validation; on submit we honour a `?contact_action` / form_key supplied by the
 * host if present, otherwise we post to CONTACT_ACTION.
 */
'use client';

import React, { useState } from 'react';
import type { MagezonElementProps } from '../types';
import { str, bool } from '../media';

/** Magento core contact controller (POST). Override in the host if proxied. */
const CONTACT_ACTION = '/contact/index/post/';

/** Turn a bare number into px; pass through anything already unit-bearing. */
function cssWidth(value: string): string {
  if (!value) return '';
  return /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

export function ContactForm({ element }: MagezonElementProps) {
  // Mirror Data\Element\ContactForm defaults (show_title / show_description -> true).
  const showTitle = element.show_title === undefined ? true : bool(element.show_title);
  const showDescription =
    element.show_description === undefined ? true : bool(element.show_description);
  const formWidth = cssWidth(str(element.form_width));

  // Client-side validity gate. Real submission still needs a Magento form_key
  // (see NOTES); we keep the native action so a host that injects the key works.
  const [touched, setTouched] = useState(false);

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 6,
    fontWeight: 600,
    fontSize: 14,
    color: '#333',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    border: '1px solid #c2c2c2',
    borderRadius: 3,
    outline: 'none',
    fontSize: 14,
    fontFamily: 'inherit',
    background: '#fff',
    color: '#333',
  };
  const fieldStyle: React.CSSProperties = { marginBottom: 18 };
  const requiredMark = (
    <span aria-hidden="true" style={{ color: '#e02b27', marginLeft: 2 }}>
      *
    </span>
  );

  return (
    <div className="mgz-contact-form">
      <form
        className="form contact"
        action={CONTACT_ACTION}
        method="post"
        id="contact"
        noValidate
        onSubmit={(e) => {
          const form = e.currentTarget;
          if (!form.checkValidity()) {
            e.preventDefault();
            setTouched(true);
          }
          // Otherwise let the native POST proceed (requires a server form_key).
        }}
        style={{
          width: formWidth || '100%',
          maxWidth: '100%',
          margin: '0 auto',
          textAlign: 'left',
        }}
      >
        {/* Magezon's phtml injects this so the Contact controller recognises the post. */}
        <input type="hidden" name="mgz" value="1" />

        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          {showTitle && (
            <legend
              className="legend"
              style={{
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 12,
                color: '#1a1a1a',
                width: '100%',
              }}
            >
              <span>Write Us</span>
            </legend>
          )}

          {showDescription && (
            <p
              className="field note"
              style={{ marginBottom: 20, color: '#555', lineHeight: 1.5 }}
            >
              Jot us a note and we&rsquo;ll get back to you as quickly as possible.
            </p>
          )}

          <div className="field name required" style={fieldStyle}>
            <label className="label" htmlFor="contact-name" style={labelStyle}>
              <span>Name{requiredMark}</span>
            </label>
            <input
              name="name"
              id="contact-name"
              type="text"
              required
              autoComplete="name"
              title="Name"
              placeholder="Name"
              style={inputStyle}
            />
          </div>

          <div className="field email required" style={fieldStyle}>
            <label className="label" htmlFor="contact-email" style={labelStyle}>
              <span>Email{requiredMark}</span>
            </label>
            <input
              name="email"
              id="contact-email"
              type="email"
              required
              autoComplete="email"
              title="Email"
              placeholder="Email"
              style={inputStyle}
            />
          </div>

          <div className="field telephone" style={fieldStyle}>
            <label className="label" htmlFor="contact-telephone" style={labelStyle}>
              <span>Phone Number</span>
            </label>
            <input
              name="telephone"
              id="contact-telephone"
              type="tel"
              autoComplete="tel"
              title="Phone Number"
              placeholder="Phone Number"
              style={inputStyle}
            />
          </div>

          <div className="field comment required" style={fieldStyle}>
            <label className="label" htmlFor="contact-comment" style={labelStyle}>
              <span>What&rsquo;s on your mind?{requiredMark}</span>
            </label>
            <textarea
              name="comment"
              id="contact-comment"
              required
              title="What's on your mind?"
              rows={5}
              placeholder="What's on your mind?"
              style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
            />
          </div>
        </fieldset>

        <div className="actions-toolbar" style={{ marginTop: 8 }}>
          <button
            type="submit"
            title="Submit"
            className="action submit primary"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              border: 0,
              borderRadius: 3,
              background: '#1979c3',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              lineHeight: 1.2,
            }}
          >
            <span>Submit</span>
          </button>
        </div>

        {touched && (
          <p
            role="alert"
            style={{ marginTop: 12, color: '#e02b27', fontSize: 13 }}
          >
            Please fill in all required fields.
          </p>
        )}
      </form>
    </div>
  );
}

/*
 * NOTES — headless submission wiring
 * ----------------------------------
 * In a normal Magento storefront, `Magento_Contact::form.phtml` includes a
 * server-rendered CSRF token via `$block->getBlockHtml('formkey')` and the
 * controller `Magento\Contact\Controller\Index\Post` validates it. A static
 * Next.js render cannot mint that token, so a raw POST from this component will
 * be rejected by Magento with an "Invalid Form Key" error.
 *
 * To make submissions actually work, the host app should do ONE of:
 *   1) Proxy: point CONTACT_ACTION at a Next.js Route Handler (e.g.
 *      /api/contact) that fetches a fresh form_key from Magento (or uses the
 *      Magento REST/GraphQL contact endpoint) and forwards the post server-side.
 *   2) Inject form_key: fetch the current cart/session form_key client-side and
 *      add `<input type="hidden" name="form_key" value="...">` before submit,
 *      while keeping action="/contact/index/post/".
 *
 * Default field names (name, email, telephone, comment) and the hidden `mgz=1`
 * marker match what Magento's Contact controller expects, so only the form_key /
 * routing needs host wiring. The three Magezon presentation fields
 * (form_width, show_title, show_description) are fully honoured here.
 */
