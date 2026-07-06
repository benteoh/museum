# Task ID: 1

**Title:** Visual Brief v2 Documentation

**Status:** pending

**Dependencies:** None

**Priority:** high

**Description:** Rewrite visual-brief.md with locked dual-world palette, Renaissance type system, and material targets

**Details:**

Overwrite `docs/superpowers/specs/visual-brief.md` with the complete v2 visual brief containing: (1) Aesthetic-to-Constraint table with mood/sensory/constraint mappings; (2) Dual-world palette: paper world tokens (bg #E7DCC1, surface #F3ECD8, border #C7B693, inkFaint #9C8C6B, textPrimary #382C19, textSecondary #6B5C42, accent #8C4F32, accentDim #A97B5D, monoTag #7A5F38, statusLive #5F7E52, statusWip #B08A2E, sheetShadow rgba(56,44,25,0.18)) and marble-dusk reserved tokens (duskBg #171310, duskSurface #221C15, duskText #E6DCC4, duskTorch #D89B54); (3) Type system: Cinzel (400/700 display), EB Garamond (400/500 + italic body), Caveat (400 annotations), JetBrains Mono (400 code); (4) Material targets for Phase 7 R3F; (5) Camera personality, performance floor, audio, and mobile stance. Do NOT commit this file per user preference (spec docs stay uncommitted until explicitly approved). The exact content is provided in the reference plan at `docs/superpowers/plans/2026-07-02-living-codex-phase0-1.md` Task 1.

**Test Strategy:**

Manual verification: file exists at the path with complete content matching the locked design spec. No build/test required (doc-only). Verify file is NOT staged for commit.

## Subtasks

### 1.1. Create complete v2 visual brief markdown content

**Status:** pending  
**Dependencies:** None  

Write the complete v2 visual brief with all sections: Aesthetic-to-Constraint table, dual-world palette (paper + marble-dusk), Renaissance type system, material targets, camera personality, performance floor, audio, and mobile stance

**Details:**

Generate the full markdown content for the visual brief v2 as specified in the reference plan (docs/superpowers/plans/2026-07-02-living-codex-phase0-1.md Task 1, lines 56-133). Include: (1) Header with version 2.0, date 2026-07-02, and status superseding v1; (2) Aesthetic-to-Constraint table with 5 mood rows (Quiet, Archival, Heavy, Luxurious, Drawn) mapping sensory targets to constraints; (3) Dual-world palette section with paper world tokens (bg #E7DCC1, surface #F3ECD8, border #C7B693, inkFaint #9C8C6B, textPrimary #382C19, textSecondary #6B5C42, accent #8C4F32, accentDim #A97B5D, monoTag #7A5F38, statusLive #5F7E52, statusWip #B08A2E, sheetShadow rgba(56,44,25,0.18)) and marble-dusk reserved tokens (duskBg #171310, duskSurface #221C15, duskText #E6DCC4, duskTorch #D89B54) with role descriptions; (4) Type system table (Cinzel 400/700 display, EB Garamond 400/500+italic body, Caveat 400 annotations, JetBrains Mono 400 code); (5) Material targets for Phase 7 R3F (aged paper, Greek marble, torch light); (6) Camera personality, performance floor, audio, and mobile stance sections as specified in the reference content.

### 1.2. Overwrite visual-brief.md with v2 content

**Status:** pending  
**Dependencies:** 1.1  

Replace the entire contents of docs/superpowers/specs/visual-brief.md with the newly generated v2 visual brief content

**Details:**

Use the Write tool to overwrite the existing file at docs/superpowers/specs/visual-brief.md (currently contains v1.0 from 2026-06-30 with night-gallery specs) with the complete v2 visual brief content generated in subtask 1. The file path is /home/benbe/Projects/museum/docs/superpowers/specs/visual-brief.md. This replaces the dark night-gallery aesthetic specifications (grain shader, frosted glass, studio HDRI) with the Living Codex parchment aesthetic (paper noise, torn edges, manuscript sheets, Renaissance type, dual-world palette). The new version is dated 2026-07-02 and explicitly supersedes v1.

### 1.3. Verify dual-world palette tokens are documented correctly

**Status:** pending  
**Dependencies:** 1.2  

Read the updated visual-brief.md and verify all paper-world and marble-dusk tokens are present with correct hex values and role descriptions

**Details:**

Use the Read tool to read docs/superpowers/specs/visual-brief.md and verify the Dual-World Palette section contains: (1) Paper world table with 12 tokens (bg, surface, border, inkFaint, textPrimary, textSecondary, accent, accentDim, monoTag, statusLive, statusWip, sheetShadow) each with correct hex value (e.g., bg #E7DCC1, surface #F3ECD8, textPrimary #382C19, sheetShadow rgba(56,44,25,0.18)) and role description (e.g., 'Parchment ground', 'Fresh sheet', 'Iron-gall ink'); (2) Marble-dusk world table with 4 reserved tokens (duskBg #171310, duskSurface #221C15, duskText #E6DCC4, duskTorch #D89B54) with role descriptions (e.g., 'Torch-lit hall', 'Warm marble white'). These exact values will be copied verbatim into styles/tokens.css.ts in Task 2 of the parent plan.

### 1.4. Verify Renaissance type system is documented correctly

**Status:** pending  
**Dependencies:** 1.2  

Read the updated visual-brief.md and verify the Type System section specifies Cinzel (display, 400/700), EB Garamond (body, 400/500 + italic), Caveat (annotations, 400), and JetBrains Mono (code, 400) with rationales

**Details:**

Use the Read tool to read docs/superpowers/specs/visual-brief.md and verify the Type System section contains a table with 4 rows: (1) Display/headings: Cinzel, weights 400/700, rationale 'Based on Trajan's Column inscriptions — the marble voice'; (2) Body: EB Garamond, weights 400/500 + italic, rationale 'Renaissance bookface — the manuscript voice'; (3) Annotations/tags: Caveat, weight 400, rationale 'Hand-italic marginalia, used sparingly'; (4) Code: JetBrains Mono, weight 400, rationale 'Unchanged — code is code'. These exact font choices and weights will be implemented in app/layout.tsx via next/font/google in Task 2 of the parent plan.

### 1.5. Confirm file is NOT staged for commit

**Status:** pending  
**Dependencies:** 1.2  

Verify that docs/superpowers/specs/visual-brief.md remains uncommitted per user preference (spec docs stay uncommitted until explicitly approved)

**Details:**

Use the Bash tool to run 'git status --short docs/superpowers/specs/visual-brief.md' to check the file status. The file should show as untracked (status '??') or modified but unstaged (status ' M'). It must NOT show as staged for commit (status 'M ' or 'A '). According to the global constraints in the reference plan (line 14), spec and design docs stay uncommitted until the user explicitly says to commit them, while code commits are normal and frequent. This is a critical user preference that must be respected. If the file is accidentally staged, use 'git restore --staged docs/superpowers/specs/visual-brief.md' to unstage it.
