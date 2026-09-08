// Centralised SEO configuration shared across route <head> definitions.

/** Production origin — keep in sync with the committed sitemap/robots. */
export const SITE_URL = "https://sjbaby.co.ke";

export const SITE_NAME = "S & J Baby Mart";
export const SITE_ALT_NAME = "Njau Children's Clinic";

/** Default social-share image served from /public. */
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** Resolve a root-relative path (e.g. "/shop") to an absolute URL. */
export const abs = (path: string): string =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
