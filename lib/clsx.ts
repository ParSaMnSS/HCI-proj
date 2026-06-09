export type ClassValue = string | number | false | null | undefined;

/** Minimal classnames helper. */
export function clsx(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}
