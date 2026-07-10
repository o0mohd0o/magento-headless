// Pure helpers shared by server (build GraphQL inputs) and client (URL state).
// URL convention: ?color=49,52&size=166&price=20_30&sort=price_ASC&page=2

export const RESERVED_PARAMS = new Set(["q", "sort", "page"]);

export type SearchParamsObj = Record<string, string | string[] | undefined>;

function toCsv(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  return (Array.isArray(raw) ? raw.join(",") : raw).split(",").filter(Boolean);
}

/** Build a Magento ProductAttributeFilterInput from URL search params. */
export function buildProductFilter(
  params: SearchParamsObj,
  categoryUid?: string,
): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (categoryUid) filter.category_uid = { eq: categoryUid };

  for (const [key, raw] of Object.entries(params)) {
    if (RESERVED_PARAMS.has(key)) continue;
    if (key === "category_uid" && categoryUid) continue;
    const values = toCsv(raw);
    if (!values.length) continue;

    if (key === "price") {
      const [from, to] = values[0].split("_");
      filter.price = { from: from || "0", to: to || "999999" };
    } else {
      filter[key] = { in: values };
    }
  }
  return filter;
}

/** Build a ProductAttributeSortInput from the ?sort param. */
export function buildSort(sort?: string): Record<string, "ASC" | "DESC"> {
  if (!sort) return {};
  const [field, dir] = sort.split("_");
  const d = dir === "DESC" ? "DESC" : "ASC";
  if (field === "price") return { price: d };
  if (field === "name") return { name: d };
  return {};
}

export const SORT_OPTIONS = [
  { value: "", label: "Featured" },
  { value: "price_ASC", label: "Price: Low to High" },
  { value: "price_DESC", label: "Price: High to Low" },
  { value: "name_ASC", label: "Name: A–Z" },
];

/** Aggregations we never render as facets (handled elsewhere / noisy). */
export const HIDDEN_FACETS = new Set([
  "category_id",
  "price_buckets",
]);

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  reg: "®",
  trade: "™",
  copy: "©",
  deg: "°",
};

/**
 * Magento attribute/option labels arrive HTML-encoded (e.g. the Luma
 * material facet "Cocona&reg; performance fabric"). React escapes output,
 * so entities render literally unless decoded here. Handles the named
 * entities Magento emits plus numeric forms; unknown entities pass through.
 */
export function decodeHtmlEntities(s: string): string {
  return s.replace(/&(#[xX]?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return NAMED_ENTITIES[body] ?? match;
  });
}
