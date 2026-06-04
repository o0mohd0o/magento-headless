/**
 * Renders Magento CMS / PageBuilder HTML.
 * - strips <script>/<style> for safety
 * - keeps absolute magento.test/media image URLs (browser trusts the cert)
 * - rewrites internal absolute links to relative paths
 */
function sanitizeCmsHtml(html: string): string {
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/ on[a-z]+="[^"]*"/gi, "");
  // Internal links: https://magento.test/foo -> /foo (but leave /media/ absolute)
  out = out.replace(
    /https?:\/\/magento\.test\/(?!media\/)/gi,
    "/",
  );
  return out;
}

export default function CmsContent({ html }: { html: string }) {
  return (
    <div
      className="cms-content"
      dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(html) }}
    />
  );
}
