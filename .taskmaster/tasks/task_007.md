# Task ID: 7

**Title:** Dual-World Codex Specimen Page

**Status:** pending

**Dependencies:** 2, 5

**Priority:** low

**Description:** Create unlinked dev-only route rendering both palettes, full type system, and live TornSheet demo

**Details:**

Create `app/dev/tokens/page.tsx` (server component, no data dependencies). Render two side-by-side sections: (1) Paper World: swatch grid showing all paper-world color tokens (bg, surface, border, inkFaint, textPrimary, textSecondary, accent, accentDim, monoTag, statusLive, statusWip, sheetShadow) as colored divs with hex labels, type specimens at a few sizes (h1-h3, p, code) using vars.font.* to showcase Cinzel/Garamond/Caveat/Mono, and a live <TornSheet seed="specimen-demo"><div>Sample sheet content with foxing</div></TornSheet> demo; (2) Marble-Dusk World (reserved): swatch grid for duskBg, duskSurface, duskText, duskTorch with labels, type specimens in the dusk palette (textPrimary → duskText, bg → duskBg). Style everything inline or via a local `page.css.ts` using vars.* exclusively (no hardcoded colors). This page is NEVER linked from Nav or any other page — it's a dev-only QA specimen for the site owner/implementer to verify both palettes render correctly before Phase 5 activates the dusk world. The marble-dusk tokens are reserved-but-unused until Phase 5; this page surfaces any palette/type problems in the dusk world now instead of during Phase 5. Next's static export will pre-render the route at build time even though it's unlinked, which is acceptable (it won't leak as a discoverable page unless someone guesses the URL).

**Test Strategy:**

Manual verification in `pnpm dev`: navigate to /dev/tokens. Verify: (1) both paper and dusk palettes render side-by-side with correct hex values; (2) type specimens show correct fonts at various sizes; (3) live TornSheet demo displays torn edges and foxing overlay. Confirm page is NOT linked from Nav. Build succeeds (page is statically exported but unlinked).

## Subtasks

### 7.1. Create app/dev/tokens directory and page structure

**Status:** pending  
**Dependencies:** None  

Set up the unlinked dev-only route at app/dev/tokens/page.tsx with basic server component structure and two-column layout scaffolding

**Details:**

Create directory app/dev/tokens/ and add page.tsx as a server component (no 'use client' directive, no data dependencies). Set up basic structure with two side-by-side sections using flexbox or grid layout: (1) Paper World section and (2) Marble-Dusk World section. Each section should have a header and placeholder content. This establishes the foundation for the specimen page that will showcase both color palettes side-by-side.

### 7.2. Build paper-world swatch grid with all color tokens

**Status:** pending  
**Dependencies:** 7.1  

Render complete paper-world color palette as a swatch grid showing all 12 tokens (bg, surface, border, inkFaint, textPrimary, textSecondary, accent, accentDim, monoTag, statusLive, statusWip, sheetShadow) with hex labels

**Details:**

In the Paper World section of app/dev/tokens/page.tsx, create a grid of color swatches. For each paper-world token from vars.color.* (bg, surface, border, inkFaint, textPrimary, textSecondary, accent, accentDim, monoTag, statusLive, statusWip, sheetShadow), render a colored div with the token value as background and display the hex code below it. Use inline styles or create page.css.ts with vanilla-extract style() calls, referencing vars.color.* exclusively. Layout should be a responsive grid (e.g., 3-4 columns) with adequate spacing between swatches.

### 7.3. Add type specimens showcasing Renaissance font system

**Status:** pending  
**Dependencies:** 7.2  

Create type specimens at multiple sizes (h1, h2, h3, p, code) using vars.font.* to demonstrate Cinzel/Garamond/Caveat/Mono across the paper-world palette

**Details:**

Below the paper-world swatch grid, add type specimens showcasing the Renaissance font system. Create examples for: h1/h2/h3 headings (vars.font.display - Cinzel) with sample text, paragraph text (vars.font.body - EB Garamond) at body size, hand-italic annotations (vars.font.hand - Caveat) for tag/annotation samples, and code blocks (vars.font.mono - JetBrains Mono). Use actual HTML heading/p/code elements styled with vars.font.* and vars.color.textPrimary/textSecondary. Include labels identifying which font is being shown at each specimen.

### 7.4. Integrate live TornSheet demo with foxing visualization

**Status:** pending  
**Dependencies:** 7.3  

Add a live <TornSheet> component demo in the paper-world section showing torn edges and a foxing overlay pattern to visualize the aged-paper effect

**Details:**

Import TornSheet from @/components/paper/TornSheet (created in Task 5). Below type specimens, render <TornSheet seed="specimen-demo"><div className={demoSheetStyle}>Sample sheet content with foxing</div></TornSheet>. Style the inner div with vars.color.surface background, padding, and min-height to make the torn edges visible. Add a foxing overlay using either CSS (::before pseudo-element with radial-gradient spots) or inline SVG to create 3-5 age spots/stains (brown/sepia tones at low opacity ~0.1-0.15). The foxing pattern references the 'aged paper' material from the visual brief and demonstrates how sheets will look with archival authenticity.

### 7.5. Build marble-dusk swatch grid and type specimens

**Status:** pending  
**Dependencies:** 7.4  

Create the Marble-Dusk World section with swatch grid for reserved tokens (duskBg, duskSurface, duskText, duskTorch) and type specimens styled in the dusk palette

**Details:**

In the Marble-Dusk World section, create a swatch grid showing the 4 reserved dusk tokens (vars.color.duskBg, duskSurface, duskText, duskTorch) with hex labels, following the same pattern as paper-world swatches. Below swatches, add type specimens using the same font system but styled with dusk palette colors: set background to duskBg, text to duskText, and accents to duskTorch. Include a note/label stating 'Reserved for Phase 5 - Detail Pages' to clarify these tokens are not yet active in the live site. This section ensures the dusk palette renders correctly even though it won't be used until Phase 5, surfacing any palette issues early.
