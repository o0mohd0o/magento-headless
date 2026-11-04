import "server-only";
import { magentoFetch } from "./magento";

const RECAPTCHA_V3 = /* GraphQL */ `
  query RecaptchaV3Config {
    recaptchaV3Config { website_key is_enabled }
  }
`;

export type RecaptchaConfig = { website_key: string; is_enabled: boolean };

/**
 * Returns the active reCAPTCHA v3 config, or null when the Magento backend has
 * reCAPTCHA disabled / unconfigured (the case on this demo). Forms that need
 * bot protection mint a token with `website_key` and pass it to a mutation via
 * `magentoFetch(..., { recaptchaToken })` (-> X-ReCaptcha header).
 */
export async function getRecaptchaConfig(): Promise<RecaptchaConfig | null> {
  try {
    const { recaptchaV3Config } = await magentoFetch<{
      recaptchaV3Config: RecaptchaConfig | null;
    }>(RECAPTCHA_V3, { revalidate: 3600, tags: ["store-config"] });
    return recaptchaV3Config?.is_enabled ? recaptchaV3Config : null;
  } catch {
    return null;
  }
}

/** Site key for client token minting, or null when reCAPTCHA is off. */
export async function getRecaptchaSiteKey(): Promise<string | null> {
  const cfg = await getRecaptchaConfig();
  return cfg?.website_key ?? null;
}

/** Pull the token a RecaptchaField put on the form; undefined when absent. */
export function recaptchaTokenFrom(formData: FormData): string | undefined {
  const v = formData.get("recaptcha_token");
  return typeof v === "string" && v ? v : undefined;
}
