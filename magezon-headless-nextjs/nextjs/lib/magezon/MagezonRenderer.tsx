/**
 * MagezonRenderer — top-level entry point.
 *
 * Pass either the `profile_json` string from the GraphQL module or an already
 * parsed `elements` array, plus the `mediaBaseUrl`. Renders the whole tree.
 *
 *   import { MagezonRenderer } from '@/lib/magezon';
 *   import '@/lib/magezon/styles/magezon.css';
 *
 *   <MagezonRenderer profileJson={data.magezonContent.profile_json}
 *                    mediaBaseUrl={data.magezonContent.media_base_url} />
 *
 * Server Component friendly: rendering is pure; interactive elements (slider,
 * tabs, accordion) are implemented as Client Components ("use client") internally.
 */
import React from 'react';
import type { MagezonElement, MagezonProfile, MagezonRenderContext } from './types';
import { MagezonElements } from './MagezonElement';
import './register-defaults'; // side-effect: registers the bundled element components

interface Props {
  profileJson?: string | null;
  elements?: MagezonElement[];
  mediaBaseUrl?: string | null;
  className?: string;
}

export function parseProfile(profileJson: string | null | undefined): MagezonProfile {
  if (!profileJson) return { elements: [] };
  try {
    const parsed = JSON.parse(profileJson) as Partial<MagezonProfile>;
    const elements = Array.isArray(parsed.elements) ? parsed.elements : [];
    return {
      elements: elements.map((el) => normalizeNode(el)) as MagezonElement[],
      custom_css: typeof parsed.custom_css === 'string' ? parsed.custom_css : '',
      custom_classes: typeof parsed.custom_classes === 'string' ? parsed.custom_classes : '',
    };
  } catch {
    return { elements: [] };
  }
}

/**
 * Defensively decode repeatable fields that were persisted as JSON *strings*
 * rather than arrays/objects (the known Magezon "dynamic-rows saved as string"
 * corruption — e.g. the offers-page empty-repeatables bug). Any string value that
 * looks like a JSON array/object and parses cleanly is replaced with the parsed
 * value; plain text (headings, captions, WYSIWYG HTML) is left untouched because
 * it doesn't start with `[`/`{`. Recurses through nested elements.
 */
function normalizeNode(node: unknown, depth = 0): unknown {
  if (depth > 12) return node;
  if (Array.isArray(node)) return node.map((v) => normalizeNode(v, depth + 1));
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[k] = normalizeNode(v, depth + 1);
    }
    return out;
  }
  if (typeof node === 'string') {
    const t = node.trim();
    if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) {
      try {
        const parsed = JSON.parse(t);
        if (parsed && typeof parsed === 'object') return normalizeNode(parsed, depth + 1);
      } catch {
        /* not JSON — leave the string as-is */
      }
    }
  }
  return node;
}

export function MagezonRenderer({ profileJson, elements, mediaBaseUrl, className }: Props) {
  const profile: MagezonProfile = elements
    ? { elements, custom_css: '', custom_classes: '' }
    : parseProfile(profileJson);
  const tree = profile.elements;
  const ctx: MagezonRenderContext = { mediaBaseUrl: mediaBaseUrl ?? '' };

  if (!tree.length) return null;

  // Match the storefront wrapper (.magezon-builder) so page-level custom CSS that
  // targets it applies; keep .mgz-builder for our own grid/base styles.
  const wrapperClass = ['magezon-builder', 'mgz-builder', profile.custom_classes, className]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <div className={wrapperClass}>
      <MagezonElements elements={tree} ctx={ctx} />
      {profile.custom_css ? (
        <style className="mgz-style" dangerouslySetInnerHTML={{ __html: profile.custom_css }} />
      ) : null}
    </div>
  );
}
