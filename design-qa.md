# Cube Studio design QA

- final result: blocked
- audited: 2026-10-17
- visual source of truth: `design/figma-layers/Studio/` (11 Studio boards)
- implementation under test: Storybook at `http://127.0.0.1:6006/`
- browser: Google Chrome via Playwright and the live user Chrome session
- viewport: 1100 × 760 CSS pixels
- appearances: light and dark
- component stories checked: 230
- Studio-board cards represented: 219
- stories with visible output: 230
- stories with console or page errors: 0

## Verdict

Render health, navigation structure, theming, and representative interaction states now pass. Every registered component story was opened in Chrome in light and dark mode, every story produced visible output, and no application console or page errors were recorded.

The audit remains blocked on exact Studio fidelity. The new shared renderer now distinguishes native fields, switches, collections, tables, trees, assets, status views, editors, canvas tools, shell regions, and collaboration views, but some specialized Studio cards still have richer anatomy and behavior than their current implementation. Generated component bases also still rely heavily on the common `StudioComponentBase` contract instead of expressing all component-specific state in their own headless base.

## Resolved findings

- Removed the 13 blank Storybook visualizations. Layout primitives have representative slotted content; overlays are opened for inspection; ThemeProvider and Flashbar have visible examples.
- Replaced checkbox-like Switch output with a native switch-semantic track and thumb.
- Added design-oriented state matrices. Fields now show empty, filled, focus, invalid, disabled, and read-only states. Switches include off, on, focus, loading, and disabled states. Collections include default, selected, empty, and disabled states.
- Added realistic per-component example data instead of the former Primary/Secondary/Disabled placeholder list.
- Added distinct render structures for tables, trees, segmented controls, breadcrumbs, asset grids, presence, status views, progress, editors, panels, app shell, and canvas tooling.
- Added reactive updates for editor, display, panel, and shell content after initial mount.
- Added invalid/read-only behavior and accessible error relationships.
- Localized runtime field actions, table headings, and file-picker text through the shared editor message catalog.
- Flattened Storybook navigation so components are direct children of user-facing categories. `Form/Text Input`, `Media/Audio`, `Charts/Line`, and `Design references/Inputs` no longer have intermediate Catalog or Players folders.
- Organized source folders and package exports by category, with both category imports and per-component imports.

## Category render audit

| Category | Stories | Visible | Console/page failures |
| --- | ---: | ---: | ---: |
| Action | 12 | 12 | 0 |
| Assets | 16 | 16 | 0 |
| Charts | 2 | 2 | 0 |
| Collaboration | 15 | 15 | 0 |
| Data display | 12 | 12 | 0 |
| Editor | 48 | 48 | 0 |
| Feedback | 12 | 12 | 0 |
| Form | 23 | 23 | 0 |
| Icons | 1 | 1 | 0 |
| Layout | 33 | 33 | 0 |
| Media | 3 | 3 | 0 |
| Navigation | 15 | 15 | 0 |
| Overlay | 14 | 14 | 0 |
| Styling | 23 | 23 | 0 |
| Theme | 1 | 1 | 0 |
| **Total** | **230** | **230** | **0** |

The exhaustive one-row-per-story evidence, including measured dimensions and light/dark screenshot paths, is in [results.json](design-qa-artifacts/results.json).

## Focused comparison evidence

Each comparison stacks the Studio reference crop, Storybook light mode, and Storybook dark mode.

- [Button](design-qa-artifacts/comparison/button.png): now includes default, hover, focus, pressed, disabled, and loading states with icon and primary emphasis.
- [Text input](design-qa-artifacts/comparison/text-input.png): now includes empty, filled, focus, invalid, disabled, and read-only states.
- [Switch](design-qa-artifacts/comparison/switch.png): now uses switch semantics and distinct state visuals.
- [Gradient editor](design-qa-artifacts/comparison/gradient-editor.png): now includes a gradient surface and structured values, but still needs component-specific gradient-type editing behavior.
- [Table](design-qa-artifacts/comparison/table.png): now has table headers, rows, selected, empty, and disabled states.
- [Viewport](design-qa-artifacts/comparison/viewport.png): now has a grid canvas, artboard, selection handles, and panning/zoomed visual states.
- [Presence](design-qa-artifacts/comparison/presence.png): now renders collaborator avatars and collection states.
- [Modal](design-qa-artifacts/comparison/modal.png): now opens in Storybook with representative body and footer content.

## Remaining findings

### P1 — specialized headless behavior is incomplete

Several generated component bases are currently thin identifiers over `StudioComponentBase`. The rendered output is differentiated, but advanced controls such as Gradient editor, Timeline, Bezier, Data binding, Action editor, and conflict/review workflows still need component-specific typed models and headless behavior before they can be considered production-complete.

### P1 — some Studio anatomy and interaction variants remain approximate

The broad state matrices cover the common interaction states, but some design cards specify specialized variants that are not yet modeled—for example gradient-type editing, timeline/keyframe manipulation, resizable panel dragging, and full canvas transforms. Their screenshots are useful and reviewable, but they are not exact behavioral equivalents of the boards.

### P2 — automated reference crops are approximate

Reference evidence uses the boards' repeated three-column layout. A few crops include adjacent headings or extra whitespace, so final pixel-level sign-off still requires manual comparison against the full board.

## Verification

- `npm run typecheck`
- `npm test` — 42 passed
- `npx playwright test` — 50 passed
- `npm run test:catalog` — 230 entry points, 219 Studio cards, and eight chart stories verified
- `npm run test:exports` — ESM/CJS SSR-safe imports and 246 external-runtime browser entries verified
- `npm run build`
- `npm run test:visual-audit` — 230 stories captured in both themes; 0 render/console failures

## Iteration history

1. Initial audit: 13 blank stories, 3 resource/console flags, placeholder examples, and broad design mismatches.
2. Render repair: seeded open overlays and layout content, added typed examples and component-kind renderers, and fixed visibility measurement for display-contents hosts.
3. State repair: added field, switch, collection, action, and viewport matrices plus invalid/read-only semantics.
4. Runtime repair: made structured content reactive and moved remaining shared runtime strings into the localized message catalog.
5. Final health pass: all 230 stories render in light and dark with no recorded application errors; exact specialized fidelity remains blocked as listed above.
