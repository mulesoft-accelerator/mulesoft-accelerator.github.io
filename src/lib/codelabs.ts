import type { CollectionEntry } from 'astro:content';

type Codelab = CollectionEntry<'codelabs'>;

/**
 * claat writes URLs from the folder name, and the glob loader gives us ids like
 * "add-flex-gateway-to-kubernetes/index". Strip the trailing "/index" (or a
 * bare trailing slash) to get the clean route slug the site should use.
 */
export function slugFor(entry: Codelab): string {
  return entry.id.replace(/\/index$/i, '').replace(/\/+$/, '');
}

/** Turn a slug into Title Case as a last-resort display title. */
function titleize(slug: string): string {
  const last = slug.split('/').pop() ?? slug;
  return last
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * claat stores the codelab title as the document's first `# H1`, not in the
 * metadata block. Prefer an explicit frontmatter `title`, then the first H1 in
 * the raw body, then a titleized slug.
 */
export function titleFor(entry: Codelab): string {
  if (entry.data.title) return entry.data.title;
  const h1 = entry.body?.match(/^\s*#\s+(.+?)\s*$/m);
  if (h1) return h1[1].trim();
  return titleize(slugFor(entry));
}

/** Normalize a duration value ("23", 23, "23 min") into a display string. */
export function durationLabel(entry: Codelab): string | null {
  const d = entry.data.duration;
  if (d === undefined || d === null || d === '') return null;
  const str = String(d).trim();
  return /\d\s*(min|m|hour|hr)/i.test(str) ? str : `${str} min`;
}

/** All codelabs, sorted by title. */
export function sortByTitle(entries: Codelab[]): Codelab[] {
  return [...entries].sort((a, b) =>
    titleFor(a).localeCompare(titleFor(b)),
  );
}

/** Distinct, sorted category list across all codelabs (for the filter bar). */
export function allCategories(entries: Codelab[]): string[] {
  const set = new Set<string>();
  for (const e of entries) for (const c of e.data.categories) set.add(c);
  return [...set].sort((a, b) => a.localeCompare(b));
}
