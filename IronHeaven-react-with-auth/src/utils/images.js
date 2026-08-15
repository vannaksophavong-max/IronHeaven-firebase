// Resolves an image path to a URL that works on any deploy base path.
// - Firebase Storage URLs (https://...) pass through unchanged.
// - Root-relative paths like "/images/foo.jpg" are rebased onto the
//   app's base URL so they work on GitHub Pages sub-paths.
export function resolveImage(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
