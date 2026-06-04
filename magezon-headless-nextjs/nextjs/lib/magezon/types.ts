/**
 * QasrAlawani — Magezon headless renderer
 *
 * Types for the decoded Magezon Page Builder element tree returned by the
 * QasrAlawani_MagezonHeadless GraphQL module (field: profile_json).
 */

/**
 * A single Magezon element node. Magezon stores dozens of free-form, per-type
 * fields, so the tree is intentionally open (`[key: string]: unknown`). The
 * fields we read are documented per component under elements/.
 */
export interface MagezonElement {
  /** Stable id used to scope this element's generated CSS (classes `${id}`, `${id}-s`, `${id}-p`). */
  id: string;
  /** Element type, e.g. "row" | "column" | "heading" | "text" | "single_image" | "button" | ... */
  type: string;
  /** Child elements for collection types (row, column, tabs, accordion, slider, ...). */
  elements?: MagezonElement[];
  [key: string]: unknown;
}

export interface MagezonProfile {
  elements: MagezonElement[];
  /** Page-level custom CSS (profile Settings tab). Rendered as a scoped <style>. */
  custom_css?: string;
  /** Page-level custom classes added to the .magezon-builder wrapper. */
  custom_classes?: string;
}

/** Shape of the GraphQL `magezonContent` result. */
export interface MagezonContent {
  identifier: string | null;
  title: string | null;
  has_pagebuilder: boolean;
  /** JSON string of `{ elements: [...] }`, or null. Parse with parseProfile(). */
  profile_json: string | null;
  media_base_url: string | null;
  raw_html: string | null;
}

/** Resolved Magezon link object (Block\Element::getLinkParams output). */
export interface MagezonLink {
  type: string;
  url: string;
  title: string;
  blank: boolean | number;
  nofollow: boolean | number;
  extra?: string;
}

/** Context passed down the render tree (media base url, store, etc.). */
export interface MagezonRenderContext {
  /** Store media base URL; prepended to relative image paths. */
  mediaBaseUrl: string;
}

/** Props every element component receives. */
export interface MagezonElementProps {
  element: MagezonElement;
  ctx: MagezonRenderContext;
}
