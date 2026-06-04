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
