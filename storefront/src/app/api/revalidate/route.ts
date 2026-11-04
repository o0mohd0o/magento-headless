import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  parseRevalidateBody,
  secretMatches,
} from "@/lib/revalidate-request";

/**
 * On-demand cache invalidation for Magento webhooks / admin hooks.
 *
 *   POST /api/revalidate
 *   Authorization: Bearer $REVALIDATE_SECRET
 *   { "tags": ["catalog", "product:my-url-key"], "paths": ["/page/about-us"] }
 *
 * Tags are allow-listed (see lib/revalidate-request.ts). Disabled (503) when
 * REVALIDATE_SECRET is not configured so the route can never be hit unsigned.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Revalidation is not configured." },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  const provided = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!secretMatches(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = parseRevalidateBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  for (const tag of parsed.value.tags) revalidateTag(tag, "max");
  for (const path of parsed.value.paths) revalidatePath(path);

  return NextResponse.json({
    revalidated: true,
    ...parsed.value,
    at: new Date().toISOString(),
  });
}
