// Unified lab index across both content formats:
//   - legacy claat HTML exports (jumpstarts/<slug>/index.html), read by labs.ts
//   - new Markdown sources (jumpstarts/<slug>/index.md), read via the Astro
//     `codelabs` content collection (see src/content.config.ts)
//
// Both feed the landing grids (index.astro, jumpstarts/index.astro) and the
// per-lab route ([...slug].astro). When a slug exists in BOTH formats (some
// legacy labs ship an index.md alongside their claat index.html), the claat
// HTML wins — it's the interactive, styled version — and the Markdown entry is
// dropped so we never emit two pages for the same URL.

import { getCollection, type CollectionEntry } from 'astro:content';
import { getLabs, type Lab } from './labs';
import { slugFor, titleFor } from './codelabs';

/** A lab plus, for Markdown labs, the collection entry needed to render it. */
export type AnyLab = Lab & { entry?: CollectionEntry<'codelabs'> };

/** Slugify a display category into a filter key, e.g. "Agent Fabric" -> "agent-fabric". */
function slugifyKey(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Build a Lab from a Markdown collection entry. */
function mdToLab(entry: CollectionEntry<'codelabs'>): AnyLab {
  const cats = entry.data.categories ?? [];
  const category = cats[0] ?? null;
  const durationRaw = entry.data.duration;
  const durationMin =
    durationRaw != null ? parseInt(String(durationRaw), 10) || 0 : 0;
  const updated =
    entry.data.updated instanceof Date
      ? entry.data.updated.toISOString().slice(0, 10)
      : entry.data.updated
        ? String(entry.data.updated)
        : null;
  // Approximate step count from the "##" headings (claat step boundaries).
  const stepCount = (entry.body?.match(/^##\s+/gm) ?? []).length;

  return {
    kind: 'md',
    slug: slugFor(entry),
    title: titleFor(entry),
    category,
    categoryKey: category ? slugifyKey(category) : null,
    tags: entry.data.tags ?? [],
    durationMin,
    updated,
    stepCount,
    entry,
  };
}

/** All labs (claat + Markdown), deduped by slug (claat wins) and sorted by title. */
export async function getAllLabs(): Promise<AnyLab[]> {
  const claat: AnyLab[] = getLabs();
  const claatSlugs = new Set(claat.map((l) => l.slug));

  const md = (await getCollection('codelabs'))
    .map(mdToLab)
    .filter((l) => !claatSlugs.has(l.slug));

  return [...claat, ...md].sort((a, b) => a.title.localeCompare(b.title));
}
