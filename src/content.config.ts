import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Coerce claat's comma-separated metadata (e.g. `categories: web,tools`) OR a
 * YAML list into a clean string[]. Empty/blank values collapse to [].
 */
const csvOrList = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (!val) return [];
    const arr = Array.isArray(val) ? val : val.split(',');
    return arr.map((s) => s.trim()).filter(Boolean);
  });

const codelabs = defineCollection({
  // Read every claat-generated Markdown file under ./jumpstarts.
  // The glob loader only matches the `pattern`, so non-Markdown assets
  // (./jumpstarts/index.html, ./jumpstarts/assets/*, per-lab img/*) are
  // ignored automatically. The explicit `!` negations are belt-and-suspenders.
  loader: glob({
    base: './jumpstarts',
    pattern: ['**/*.md', '!assets/**', '!**/img/**', '!node_modules/**'],
    // Derive the entry id (and therefore the URL slug) from the folder path,
    // e.g. "add-flex-gateway-to-kubernetes/index.md" -> "add-flex-gateway-to-kubernetes".
    // This ignores claat's frontmatter `id:` field, so two labs that happen to
    // reuse an `id` can never overwrite each other.
    generateId: ({ entry }) =>
      entry.replace(/\.md$/i, '').replace(/\/index$/i, '').replace(/\/+$/, ''),
  }),

  // claat metadata block fields. All optional so a lab still builds even if the
  // author omitted something — the title falls back to the first `# H1`.
  schema: z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    id: z.string().optional(),
    categories: csvOrList,
    tags: csvOrList,
    status: z.union([z.string(), z.array(z.string())]).optional(),
    authors: z.union([z.string(), z.array(z.string())]).optional(),
    // Total time — accept "23", "23 min", or a number. Displayed verbatim-ish.
    duration: z.union([z.string(), z.number()]).optional(),
    // claat uses "Feedback Link"; YAML-safe alias also supported.
    feedback: z.string().optional(),
    updated: z.union([z.string(), z.coerce.date()]).optional(),
  }),
});

export const collections = { codelabs };
