// Cloudinary delivery helpers. Banners are stored as multi-megabyte PNGs; asking Cloudinary for
// an automatic format and quality at the displayed width cuts a 4 MB hero to ~170 KB.

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;

// "v1750012399/..." or a folder path: no transformation segment yet
const hasTransformation = (rest: string) => /^[a-z]{1,3}_[^/]+(,[a-z]{1,3}_[^/]+)*\//.test(rest);

/** Same image at `width` px, in the best format the browser accepts. Other URLs pass through. */
export function optimizedImageUrl(url: string | undefined, width: number): string | undefined {
  if (!url) return url;
  const match = url.match(CLOUDINARY_UPLOAD);
  if (!match || hasTransformation(match[2])) return url;
  return `${match[1]}f_auto,q_auto,c_limit,w_${width}/${match[2]}`;
}

/** `srcSet` for a full-width image; undefined when the URL is not a Cloudinary upload. */
export function optimizedImageSrcSet(
  url: string | undefined,
  widths: number[] = [768, 1280, 1920, 2560]
): string | undefined {
  if (!url || optimizedImageUrl(url, widths[0]) === url) return undefined;
  return widths.map((width) => `${optimizedImageUrl(url, width)} ${width}w`).join(", ");
}
