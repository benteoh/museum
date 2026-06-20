@AGENTS.md

## Adding a project

Projects are MDX files compiled by Velite (schema in `velite.config.ts`). To add one:

1. Create `content/projects/<slug>.mdx` — frontmatter (below) plus a short case-study body in MDX. `slug` must match the filename.
2. _(Optional)_ Drop a hero asset at `public/projects/<slug>/hero.<png|jpg|gif|svg>` and point `heroImage` at it (a GIF works). **Omit `heroImage`** to fall back to the animated `DefaultPreview` tinted by `heroColour` — no asset needed to ship.
3. _(Optional)_ For a bespoke animated preview, write a client component and register it by slug in `PREVIEW_COMPONENTS` (`components/projects/previews/index.ts`). It takes priority over `heroImage`.
4. `pnpm dev` / `pnpm build` regenerates Velite automatically (or run `npx velite build`).

**Where it appears**
- `featured: true` → shows in the home gallery, ordered by `featuredOrder` ascending.
- Always shows in the `/projects` index; `tags` populate the filter bar.
- The lowest-`featuredOrder` featured project's `curatorNote` becomes the home "curator" line (falls back to a default if unset).
- Preview resolution order everywhere: bespoke component → `heroImage` → animated `DefaultPreview`.

**Frontmatter fields**

| Field | Required | Notes |
|---|---|---|
| `type` | yes | `iframe` (only supported type today) |
| `title` | yes | Display name |
| `slug` | yes | Must match the filename |
| `description` | yes | One-liner for cards and meta |
| `status` | yes | `live` \| `wip` \| `archived` — drives the status badge |
| `publishedAt` | yes | ISO date `YYYY-MM-DD`; sorts the index |
| `tags` | yes | `string[]`; powers the index filter |
| `heroColour` | no | Hex; tints the `DefaultPreview` fallback |
| `heroImage` | no | `/projects/<slug>/…`; static image or GIF |
| `featured` / `featuredOrder` | no | Feature on the home gallery (lower order = earlier) |
| `curatorNote` | no | Candidate for the home curator line |
| `links` | no | `{ github?, live?, source? }` |
| `iframeUrl` / `iframeHeight` / `iframeMobileNote` | no | Live embed on the detail page (`/projects/<slug>`) |
