/**
 * Link helper — port of Magezon\Builder\Block\Element::getLinkParams().
 *
 * Magezon link fields can be either a plain URL string or an object
 * { type, url, id, title, extra, nofollow, blank }. {{mgzlink}} tokens have
 * already been resolved to real URLs server-side by the GraphQL module, so here
 * we only normalize shape + assemble the `extra` query/hash suffix.
 */
import type { MagezonLink } from './types';

export function getLinkParams(data: unknown): MagezonLink {
  const params: MagezonLink = {
    type: 'custom',
    url: '',
    title: '',
    extra: '',
    nofollow: 0,
    blank: 0,
  };

  if (typeof data === 'string') {
    params.url = data;
    params.type = 'custom';
  } else if (data && typeof data === 'object') {
    Object.assign(params, data as Partial<MagezonLink>);
  }

  if (params.extra) {
    params.url = params.extra.startsWith('#')
      ? `${params.url}${params.extra}`
      : `${params.url}?${params.extra}`;
  }

  // Normalize "true"/"false" strings to 0/1 like the PHP does.
  params.blank = params.blank === 'true' || params.blank === true || params.blank === 1 ? 1 : 0;
  params.nofollow = params.nofollow === 'true' || params.nofollow === true || params.nofollow === 1 ? 1 : 0;

  return params;
}

/** rel/target attributes for an anchor from a resolved link. */
export function linkAttrs(link: MagezonLink): { target?: string; rel?: string } {
  const out: { target?: string; rel?: string } = {};
  if (link.blank) out.target = '_blank';
  const rel: string[] = [];
  if (link.blank) rel.push('noopener');
  if (link.nofollow) rel.push('nofollow');
  if (rel.length) out.rel = rel.join(' ');
  return out;
}
