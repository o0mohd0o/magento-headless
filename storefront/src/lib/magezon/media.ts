/**
 * Media + value helpers.
 *
 * Mirrors Magezon\Builder\Helper\Data::getImageUrl(): a path that isn't already
 * absolute (no "http", not an inline "<div") gets the store media base URL
 * prepended.
 */
import type { MagezonRenderContext } from './types';

export function mediaUrl(path: unknown, ctx: MagezonRenderContext): string {
  if (typeof path !== 'string' || path === '') return '';
  if (path.includes('http') || path.includes('<div')) return path;
  const base = (ctx.mediaBaseUrl || '').replace(/\/+$/, '');
  const rel = path.replace(/^\/+/, '');
  return base ? `${base}/${rel}` : path;
}

/** Coerce a Magezon truthy flag (1/"1"/true/"true") to a real boolean. */
export function bool(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

/** Safe string getter. */
export function str(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}
