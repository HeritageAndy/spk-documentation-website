export function withBase(path: string) {
  if (!path) return "";
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (!base) return normalized;
  return `${base}${normalized}`;
}
