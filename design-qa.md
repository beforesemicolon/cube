# Feedback design fidelity

Empty state's raster-specimen comparison below is historical: the subsequent
user-requested centered, slotted composition supersedes those three visual
variants. Storybook now has one Empty State story, using `icon`, `heading`, an
internal `cb-heading`, and arbitrary default-slot body/actions. The comparison
capture script excludes those obsolete specimens rather than claiming the new
composition matches the old left-aligned design.

final result: passed

## 2026-10-20 recheck

Fresh source-versus-Storybook comparisons are in `design-qa-artifacts/feedback-recheck-2026-10-20/comparison-light.png` and `comparison-dark.png` (26 measured specimens). The remaining empty-state icon differences were corrected locally: the filtered-state search handle now faces the reference direction, and the plus glyph has the reference's heavier stroke. Shared icons outside empty states are unchanged. Feedback browser checks (5 tests), typecheck, and `git diff --check` pass. This recheck does not claim pixel equality or a dedicated Flashbar design match; the source limitation below still applies.

## Comparison target and evidence

- Source: `design/figma-layers/Studio/05/Data & feedback.png` (3376 × 7728).
- Implementation: Storybook feedback stories, local browser viewport 1100 × 800, deviceScaleFactor 1, light/dark, reduced motion.
- Final paired evidence: `design-qa-artifacts/feedback-fidelity-final/comparison-light.png` and `comparison-dark.png` (940 × 2800, 1×).
- Focused captures and dimensions: `design-qa-artifacts/feedback-fidelity-final/metrics.json` (26 component/theme specimens).
- Source specimens are cropped at their native pixel size, without resizing. Each comparison places source and rendered component together at 1×. Source status/spinner regions include unused reference-panel width; intrinsic component widths need not fill that region.
- `scripts/capture-feedback-design-qa.ts` recreates these paired comparisons.

## Findings and comparison history

1. P1: Skeleton did not reproduce its design specimens: stretched text lines, oversized card media, and filled table cells instead of short placeholder bars. Corrected to 288px reference width, 16px insets, measured line widths/heights, 76px media at the reference width, and separated rounded table bars.
2. P2: Progress percentage alignment and track color differed. Corrected to inline `Uploading assets · 60%`, primary-blue 4px track, and measured 8px label-to-track gap.
3. P2: Spinner used a mostly-gray ring and its default story showed the small size. Corrected to a primary-blue open ring, 2px stroke, 24px working specimen and separate 16px small specimen.
4. P2: Empty-state glyph scale and stroke differed. Corrected the 24px symbol allocation within a 32px tile, optical 18px plus/search SVG paint box, full 24px exclamation SVG, 8px tile-to-title gap, 16px inset/radius, and 152px blank / 168px filtered-error heights. The error icon uses the standard Tabler exclamation-mark asset, not a hand-drawn approximation; attribution/license is included in `components/icons/tabler.ts`.
5. P2: Message line heights, heading weight, dot sizes, and gaps differed. Corrected to 14px/20px, weight 600 headings, 12px/16px copy, 8px dots/gaps, and the supplied reference widths. Toast, alert, banner, and empty-state reference specimen heights now agree.
6. First paired comparison: remaining P2 footprint mismatch in status/spinner hosts and overly rounded Skeleton bars. Fixed compact inline-flex host display and measured bar corner treatment. Post-fix captures show a 28px status row and 24px working spinner without full-width empty hosts.
7. Second paired comparison: corrected the remaining optical glyph sizes and the feedback action font weight. Feedback slots request weight 400 through the button's CSS variable; other button consumers retain their existing default weight 500. Re-captured both themes and inspected source and implementation together after the fixes. No actionable P0/P1/P2 differences remain in the supplied specimens.

## Required fidelity surfaces

- Typography: compare heading/body/button family, optical weight, sizes, line heights, wrapping, and baseline alignment in paired captures. Existing theme font stack is retained; antialiasing and rasterized-reference differences are not treated as pixel equality.
- Spacing/layout: measured native reference widths, insets, gaps, element heights, radii, borders, and all three Skeleton variants. Narrow-container checks and dynamic action slots remain required.
- Colors/tokens: source primary/semantic colors and light/dark surfaces are retained. Story-only specimen backdrop is normalized to the reference panel so transparent components can be compared fairly.
- Assets: no raster illustrations occur in these specimens. Existing registered icon primitive is used, with actual rendered SVG dimensions checked; no screenshot is substituted for a component.
- Copy: default and error/filter/loading stories use corresponding reference copy; percent and loading states must not invent completion.

## Final measured reference agreement

| Specimen | Source size | Rendered size |
| --- | --- | --- |
| Empty state, blank | 288 × 152 | 288 × 152 |
| Empty state, filtered/error | 288 × 168 | 288 × 168 |
| Skeleton text/table | 288 × 78 | 288 × 78 |
| Skeleton card | 288 × 146 | 288 × 146 |
| Progress, determinate | 288 × 28 | 288 × 28 |
| Toast, success | 352 × 106 | 352 × 106 |
| Toast, error | 352 × 122 | 352 × 122 |
| Alert, information | 320 × 84 | 320 × 84 |
| Banner, offline | 400 × 104 | 400 × 104 |

Status and spinner source captures include a 288px reference region, not a required intrinsic control width. Their visible row/ring geometry is compared at native size. Flashbar has no dedicated specimen in either supplied Data & feedback board; its existing service-level notification region is functionally/theme-tested, not claimed as an exact visual recreation of a missing source.

## Implementation checklist

- [x] Correct the enumerated component mismatches.
- [x] Recapture after the second pass and inspect both combined sheets.
- [x] Verify geometry, accessibility, slots, themes, reduced motion, and regression tests.
- [x] Record remaining minor optical/raster differences and final result.

Browser verification: local Storybook is open in the in-app browser. Automated browser captures use the previously approved Playwright workflow. The full 216-test suite passed; final feedback/button-specific checks (9 tests), 56 unit tests, typecheck, export verification, and package/Storybook builds passed. Core checks exercise dynamic slot content, live prop updates, narrow containers, both themes, progress semantics, reduced motion, and keyboard-accessible slotted actions. The comparison capture throws on missing/incorrect story hosts and missing rendered content; full browser tests cover render-error reporting.

## Follow-up polish

- A pixel-identical claim is not supported by the raster board alone: font rasterization and animated intermediate frames can differ. Acceptance requires no substantive geometry, state, content, color, or hierarchy mismatch.
