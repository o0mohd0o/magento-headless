/**
 * Public API for the headless Magezon renderer.
 *
 *   import { MagezonRenderer, fetchMagezonContent } from '@/lib/magezon';
 *   import '@/lib/magezon/styles/magezon.css';
 */
export { MagezonRenderer, parseProfile } from './MagezonRenderer';
export { MagezonElement, MagezonElements } from './MagezonElement';
export { ElementWrapper } from './ElementWrapper';

// Registry — register/override element components from your app bootstrap.
export { registerElement, registerElements, getElementComponent, registeredTypes } from './registry';
export type { ElementComponent } from './registry';

// Data fetching.
export { fetchMagezonContent, MAGEZON_CONTENT_QUERY, fetchMagezonPreview, MAGEZON_PREVIEW_QUERY } from './api';

// Commerce adapter (wire your product GraphQL + cards).
export {
  MagezonCommerceProvider,
  CommerceElement,
  readCriteria,
} from './elements/commerce';
// Plain data — from the non-client module so server code can read it.
export { COMMERCE_TYPES } from './elements/commerce-types';
export type { CommerceRenderer, ProductSelectionCriteria } from './elements/commerce';

// Layout-block adapter (custom_block / sidebar -> your components).
export { MagezonBlockProvider } from './elements/blocks';
export type { BlockRenderer } from './elements/blocks';

// Helpers (handy when authoring custom element components).
export { str, bool, mediaUrl } from './media';
export { getLinkParams, linkAttrs } from './links';
export { buildElementCss } from './style';

// Types.
export type {
  MagezonElement as MagezonElementNode,
  MagezonProfile,
  MagezonContent,
  MagezonRenderContext,
  MagezonElementProps,
  MagezonLink,
} from './types';
