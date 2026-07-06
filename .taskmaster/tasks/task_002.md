# Task ID: 2

**Title:** Token & Type System Rebrand

**Status:** pending

**Dependencies:** 1

**Priority:** high

**Description:** Replace night-gallery tokens with parchment palette, swap fonts to Cinzel/EB Garamond/Caveat, add WCAG contrast test

**Details:**

Before writing code, read `node_modules/next/dist/docs/` (use Glob for font-related guides) to verify `next/font/google` API is current in Next.js 16.2.7. Modify `styles/tokens.css.ts`: replace all color values with paper-world palette (bg, surface, border, accent, accentDim, textPrimary, textSecondary, monoTag, statusLive, statusWip), add new tokens (inkFaint, sheetShadow), add reserved marble-dusk tokens (duskBg, duskSurface, duskText, duskTorch), update font vars to use --font-cinzel (display), --font-eb-garamond (body), --font-caveat (hand), --font-jetbrains-mono (mono). Modify `app/layout.tsx`: import Cinzel (weights 400/700), EB_Garamond (weights 400/500, styles normal+italic), Caveat (weight 400), JetBrains_Mono; create font constants with correct variables; update <html> className. Modify `styles/typography.css.ts`: change h1-h6 fontWeight from 300 to 400 (Cinzel has no 300 weight), add letterSpacing 0.02em. Create `tests/tokens/contrast.test.ts` to compute WCAG contrast ratios for text/background pairs, asserting textSecondary on bg is ≥4.5:1 AA (currently ~4.76:1, close to floor). Use a WCAG contrast formula or library. Run `pnpm test` (expect PASS), `pnpm build` (expect success), `pnpm dev` to visually verify parchment bg, dark ink text, Cinzel headings.

**Test Strategy:**

Automated contrast test must pass (textSecondary/bg ≥ 4.5:1). All existing test suites pass. Build succeeds. Visual check: parchment background, iron-gall text, Cinzel headings visible in browser at /.

## Subtasks

### 2.1. Verify Next.js font API compatibility

**Status:** pending  
**Dependencies:** None  

Read Next.js documentation to confirm next/font/google API is compatible with version 16.2.7

**Details:**

Use Glob to search node_modules/next/dist/docs/ for font-related documentation. Read relevant files to verify that the next/font/google import and font configuration API (weights, subsets, variable, display properties) matches current Next.js 16.2.7. Confirm that Cinzel, EB_Garamond, Caveat, and JetBrains_Mono are supported Google Fonts that can be imported. Document any API changes or deprecations that affect the implementation.

### 2.2. Update color tokens in styles/tokens.css.ts

**Status:** pending  
**Dependencies:** 2.1  

Replace night-gallery color palette with parchment paper-world palette and add new token definitions

**Details:**

Modify styles/tokens.css.ts (lines 5-16). Replace existing color values: bg: '#0D0F14' → '#F3ECD8' (warm parchment), surface: '#151820' → '#F8F1E3', border: '#1E2330' → '#D4C5A9', accent: '#B8D4E8' → '#5B8C7A' (verdigris), accentDim: '#6A9AB8' → '#7FA693', textPrimary: '#E8EDF2' → '#2B2419' (iron-gall ink), textSecondary: '#6B7280' → '#5C5247', monoTag: '#3D5A73' → '#6B6356', statusLive: '#4ADE80' → '#5B8C7A', statusWip: '#F59E0B' → '#D4A574' (ochre). Add new tokens: inkFaint: '#8B8173', sheetShadow: 'rgba(43, 36, 25, 0.08)'. Add reserved marble-dusk tokens (commented with note 'Reserved for future dark mode'): duskBg: '#1A1614', duskSurface: '#231E1C', duskText: '#E8DCC8', duskTorch: '#C89B5F'.

### 2.3. Update font tokens and import new Google Fonts

**Status:** pending  
**Dependencies:** 2.1, 2.2  

Replace Space Grotesk and Instrument Sans with Cinzel, EB Garamond, and Caveat in layout.tsx and tokens.css.ts

**Details:**

Modify app/layout.tsx (lines 3, 10-26, 37). Remove Space_Grotesk and Instrument_Sans imports. Import Cinzel (weights 400/700), EB_Garamond (weights 400/500, styles ['normal', 'italic']), Caveat (weight 400), keep JetBrains_Mono. Create font constants: cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel', display: 'swap' }), ebGaramond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-eb-garamond', display: 'swap' }), caveat = Caveat({ subsets: ['latin'], weight: '400', variable: '--font-caveat', display: 'swap' }). Update <html> className to include all four font variables. Modify styles/tokens.css.ts (lines 17-21): update font.display to 'var(--font-cinzel)', font.body to 'var(--font-eb-garamond)', add font.hand: 'var(--font-caveat)', keep font.mono: 'var(--font-jetbrains-mono)'.

### 2.4. Update typography styles for new font weights

**Status:** pending  
**Dependencies:** 2.3  

Change heading font weight from 300 to 400 and add letter spacing in typography.css.ts

**Details:**

Modify styles/typography.css.ts (line 7). Change fontWeight from 300 to 400 because Cinzel does not include a 300 weight. Add letterSpacing: '0.02em' to the h1-h6 globalStyle to improve readability with the new serif display font. This gives the Cinzel headings slightly more breathing room between characters, which is appropriate for the classical museum aesthetic.

### 2.5. Create WCAG contrast ratio test

**Status:** pending  
**Dependencies:** 2.2  

Write automated test to verify textSecondary on bg meets WCAG AA standard (≥4.5:1 contrast ratio)

**Details:**

Create tests/tokens/contrast.test.ts. Import vitest describe/it/expect. Define WCAG contrast formula: relativeLuminance(rgb) = for each channel: if c ≤ 0.03928 then c/12.92 else ((c+0.055)/1.055)^2.4, then L = 0.2126*R + 0.7152*G + 0.0722*B. contrastRatio(L1, L2) = (max(L1,L2) + 0.05) / (min(L1,L2) + 0.05). Parse hex colors from tokens (textSecondary '#5C5247' and bg '#F3ECD8') to RGB, compute contrast ratio, assert ≥4.5 (WCAG AA). Expected ratio is ~4.76:1 per brief. Test should also verify textPrimary '#2B2419' on bg (expected ~13:1, well above threshold). Create a test directory tests/tokens/ to organize this test alongside the existing test structure.
