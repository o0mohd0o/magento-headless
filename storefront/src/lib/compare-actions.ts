"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COMPARE_COOKIE, COMPARE_MAX, getCompareSkus } from "./compare";

export type CompareResult = { ok: boolean; error?: string };

async function writeSkus(skus: string[]) {
  const store = await cookies();
  if (skus.length) {
    store.set(COMPARE_COOKIE, skus.join(","), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    store.delete(COMPARE_COOKIE);
  }
  revalidatePath("/compare");
  revalidatePath("/", "layout");
}

export async function addToCompareAction(sku: string): Promise<CompareResult> {
  const skus = await getCompareSkus();
  if (!skus.includes(sku)) skus.push(sku);
  // keep the most recent COMPARE_MAX
  await writeSkus(skus.slice(-COMPARE_MAX));
  return { ok: true };
}

export async function removeFromCompareAction(sku: string): Promise<CompareResult> {
  const skus = (await getCompareSkus()).filter((s) => s !== sku);
  await writeSkus(skus);
  return { ok: true };
}
