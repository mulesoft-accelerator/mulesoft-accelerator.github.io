// Build-time index of the claat-generated codelabs under ./jumpstarts.
//
// Every lab is a Google-Codelabs (claat) export: an index.html containing a
// <google-codelab> custom element whose <google-codelab-step> children carry a
// per-step `duration`. We embed that element as-is inside the Astro theme shell
// (see [...slug].astro) so claat's own step navigation + "time remaining"
// countdown work natively — we only supply the surrounding chrome, dark mode,
// and the grid landing page.
//
// This module runs in Node during the build (getStaticPaths / page frontmatter),
// so it reads the source files directly with node:fs.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'jumpstarts');

export interface Lab {
  /** How this lab renders: a legacy claat HTML export, or a Markdown source. */
  kind: 'claat' | 'md';
  slug: string;
  title: string;
  /** Display category, e.g. "Salesforce" (from the legacy grid), or null. */
  category: string | null;
  /** Lower-cased category key used by the filter buttons, e.g. "sfdc". */
  categoryKey: string | null;
  tags: string[];
  /** Total duration in minutes (sum of per-step durations). */
  durationMin: number;
  /** ISO-ish "Updated" date from the legacy grid, or null. */
  updated: string | null;
  stepCount: number;
}

/** Slug -> { category, tags, updated } parsed from the legacy jumpstarts/index.html. */
function legacyMeta(): Record<
  string,
  { category: string | null; categoryKey: string | null; tags: string[]; updated: string | null }
> {
  const file = path.join(ROOT, 'index.html');
  const meta: ReturnType<typeof legacyMeta> = {};
  if (!fs.existsSync(file)) return meta;
  const html = fs.readFileSync(file, 'utf8');
  // Each card is an <a href="./<slug>/index.html" ...> block.
  for (const block of html.split('<a href="./').slice(1)) {
    const slug = block.match(/^([^/]+)\/index\.html/)?.[1];
    if (!slug) continue;
    const categoryKey = block.match(/data-cat="([^"]*)"/)?.[1] || null;
    const tagsRaw = block.match(/data-tags="([^"]*)"/)?.[1] || '';
    const category = block.match(/<span[^>]*>([^<]+)<\/span>/)?.[1]?.trim() || null;
    const updated = block.match(/Updated ([0-9-]+)/)?.[1] || null;
    meta[slug] = {
      category,
      categoryKey,
      tags: tagsRaw.split(',').map((t) => t.trim()).filter(Boolean),
      updated,
    };
  }
  return meta;
}

function titleize(slug: string): string {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Read + lightly parse one lab's index.html. Returns null if it isn't a claat lab. */
function readLab(slug: string, meta: ReturnType<typeof legacyMeta>): Lab | null {
  const file = path.join(ROOT, slug, 'index.html');
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, 'utf8');
  if (!/<google-codelab[\s>]/.test(html)) return null;

  const title =
    html.match(/<google-codelab[^>]*\stitle="([^"]*)"/)?.[1]?.trim() || titleize(slug);
  const durations = [
    ...html.matchAll(/<google-codelab-step[^>]*\sduration="([0-9]+)"/g),
  ].map((m) => Number(m[1]));

  const m = meta[slug] ?? { category: null, categoryKey: null, tags: [], updated: null };
  return {
    kind: 'claat',
    slug,
    title,
    category: m.category,
    categoryKey: m.categoryKey,
    tags: m.tags,
    durationMin: durations.reduce((a, b) => a + b, 0),
    updated: m.updated,
    stepCount: durations.length,
  };
}

/** All labs, sorted by title. */
export function getLabs(): Lab[] {
  const meta = legacyMeta();
  const labs: Lab[] = [];
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'assets') continue;
    const lab = readLab(entry.name, meta);
    if (lab) labs.push(lab);
  }
  return labs.sort((a, b) => a.title.localeCompare(b.title));
}

/** Distinct display categories across all labs (for the filter bar). */
export function getCategories(labs: Lab[]): { label: string; key: string }[] {
  const seen = new Map<string, string>();
  for (const l of labs) {
    if (l.category && l.categoryKey && !seen.has(l.categoryKey)) {
      seen.set(l.categoryKey, l.category);
    }
  }
  return [...seen.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Extract the embeddable portion of a lab's index.html: the <google-codelab>
 * custom element plus the analytics element and any inline <style> from the
 * original <head>. Image `src="img/..."` and asset `../assets/...` references
 * are left untouched — they resolve against the staged files in public/
 * (see scripts/stage-claat.mjs).
 */
export function getLabEmbed(slug: string): { title: string; html: string; durationMin: number } {
  const file = path.join(ROOT, slug, 'index.html');
  const html = fs.readFileSync(file, 'utf8');

  const codelab = html.match(/<google-codelab[\s>][\s\S]*?<\/google-codelab>/)?.[0] ?? '';
  const analytics = html.match(/<google-codelab-analytics[\s\S]*?<\/google-codelab-analytics>/)?.[0] ?? '';
  const style = html.match(/<style>[\s\S]*?<\/style>/)?.[0] ?? '';
  const title = html.match(/<google-codelab[^>]*\stitle="([^"]*)"/)?.[1]?.trim() || titleize(slug);
  const durationMin = [...html.matchAll(/<google-codelab-step[^>]*\sduration="([0-9]+)"/g)].reduce(
    (sum, m) => sum + Number(m[1]),
    0,
  );

  return { title, durationMin, html: `${style}\n${analytics}\n${codelab}` };
}
