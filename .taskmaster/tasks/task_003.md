# Task ID: 3

**Title:** Procedural Parchment Ground Texture

**Status:** pending

**Dependencies:** 2

**Priority:** medium

**Description:** Add SVG fractalNoise paper-fibre layer and reading-desk vignette to body background

**Details:**

Modify `styles/global.css.ts`. Above the `globalStyle('body', ...)` call, define a const `paperNoise` with a data-URI SVG containing a fractalNoise filter (baseFrequency 0.8, numOctaves 2, stitchTiles stitch) and a feColorMatrix that produces ~5% alpha warm fibre tint (rgba values roughly 0.30, 0.24, 0.13, 0.05 per the visual brief constraint of alpha ≤0.06 to preserve text contrast). Extend the body rule to set `backgroundImage: ${paperNoise}, radial-gradient(ellipse at 50% 40%, rgba(243,236,216,0.55) 0%, rgba(56,44,25,0.08) 100%)` — this layers the noise over a warm desk vignette. Keep all existing body properties (backgroundColor vars.color.bg, color, fontFamily, lineHeight, etc.). The exact SVG/gradient strings are in the reference plan Task 3. Verify in `pnpm dev` at zoom 100%: subtle grain visible, brighter centre, darker edges, text still legible. Run `pnpm build` to confirm vanilla-extract accepts the data-URI.

**Test Strategy:**

Visual verification in browser: visible-but-subtle grain on parchment, warm vignette (bright centre, darker edges). Body text must remain comfortably legible per the brief. Build must succeed.

## Subtasks

### 3.1. Define paperNoise SVG data-URI constant

**Status:** pending  
**Dependencies:** None  

Create the SVG fractalNoise data-URI string with proper filter parameters and color matrix for warm paper fibers

**Details:**

In `styles/global.css.ts`, above the `globalStyle('body', ...)` call (line 15), define a const `paperNoise` containing the data-URI SVG string. The SVG must be 240x240px with a `<filter id='n'>` containing: (1) `<feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/>` for tiled procedural noise, and (2) `<feColorMatrix type='matrix' values='0 0 0 0 0.30 0 0 0 0 0.24 0 0 0 0 0.13 0 0 0 0.05 0'/>` to produce warm fibre tint (roughly rgba(77, 61, 33, 0.05)) within the alpha ≤0.06 constraint from the visual brief. Apply the filter to a 240x240 rect. Wrap in `url("data:image/svg+xml;utf8,...")` format. Add comment: '// Procedural paper fibre — SVG fractalNoise, tiled. Alpha kept ≤0.06 per the visual brief so text contrast is unaffected.'

### 3.2. Add reading-desk vignette gradient definition

**Status:** pending  
**Dependencies:** 3.1  

Define the radial gradient that creates the warm desk lighting effect (bright center, darker edges)

**Details:**

In the same file, create a second const or inline string for the reading-desk vignette: `radial-gradient(ellipse at 50% 40%, rgba(243, 236, 216, 0.55) 0%, rgba(56, 44, 25, 0.08) 100%)`. This creates an elliptical gradient positioned slightly above center (40% vertical) with a warm parchment-toned highlight (rgba(243,236,216,0.55)) fading to a darker brown edge (rgba(56,44,25,0.08)). The gradient will layer beneath the noise to simulate overhead desk lighting on aged paper.

### 3.3. Extend body globalStyle with backgroundImage layers

**Status:** pending  
**Dependencies:** 3.1, 3.2  

Modify the existing body rule to add the layered background (noise over vignette) while preserving all current properties

**Details:**

Update the `globalStyle('body', { ... })` call at line 15 in `styles/global.css.ts`. Keep all existing properties (backgroundColor: vars.color.bg, color: vars.color.textPrimary, fontFamily: vars.font.body, lineHeight: '1.6', overflowX: 'hidden', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale'). Add a new `backgroundImage` property set to `${paperNoise}, radial-gradient(ellipse at 50% 40%, rgba(243, 236, 216, 0.55) 0%, rgba(56, 44, 25, 0.08) 100%)`. CSS layers backgrounds left-to-right, so paperNoise renders on top of the vignette. The backgroundColor (vars.color.bg, will be #E7DCC1 after Task 2) shows through as the base parchment tone.

### 3.4. Visual verification at 100% zoom for text legibility

**Status:** pending  
**Dependencies:** 3.3  

Test the parchment texture at default browser zoom to ensure text contrast meets the visual brief constraint

**Details:**

In `pnpm dev` environment, navigate to / (home page) and at least one other text-heavy route (e.g., /projects or a project detail page). Set browser zoom to exactly 100%. Verify: (1) Paper noise grain is visible but subtle—should look like real paper fibers, not distracting visual noise. (2) Warm vignette creates a 'reading desk' effect with brighter center and naturally darker edges. (3) All body text (vars.color.textPrimary, will be #382C19 iron-gall after Task 2) remains comfortably legible against the textured background. The alpha ≤0.06 constraint in the noise filter ensures the texture doesn't compromise readability. (4) No jarring tiling seams in the noise pattern (stitchTiles='stitch' ensures seamless repeat). Check both light and dark text areas.

### 3.5. Production build verification with vanilla-extract

**Status:** pending  
**Dependencies:** 3.3  

Confirm that vanilla-extract build pipeline accepts the SVG data-URI and outputs valid CSS

**Details:**

Run `pnpm build` to execute the full production build. vanilla-extract will compile `styles/global.css.ts` and extract CSS. Verify: (1) Build completes without errors (no vanilla-extract compilation failures, no CSS syntax errors). (2) Check the build output (`.next/` directory or wherever compiled CSS lives) to confirm the data-URI SVG and gradient are properly inlined into the generated CSS—no broken escaping or mangled strings. (3) Optionally run `pnpm start` or deploy to preview environment to confirm production build renders the texture correctly in a real serving scenario (not just dev server). The data-URI format with utf8 encoding and proper quote escaping should pass through vanilla-extract cleanly.
