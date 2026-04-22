/**
 * Returns a sanitized URL that is safe to use in img src attributes.
 * Only allows http:, https:, blob:, data:image/ and relative (/) URLs.
 * Falls back to the provided fallback URL if the input is unsafe.
 */
export function safeSrc(url, fallback = "") {
  if (!url) return fallback;
  if (
    url.startsWith("blob:") ||
    url.startsWith("data:image/") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  ) {
    return url;
  }
  return fallback;
}
