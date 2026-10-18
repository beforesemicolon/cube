# Cube Studio design QA

- final result: passed
- audited: 2026-10-18
- visual source of truth: `design/figma-layers/Studio/` (11 Studio boards)
- implementation under test: Storybook at `http://127.0.0.1:6006/`
- browser: Google Chrome via Playwright and the live Storybook session
- viewport: 1100 × 760 CSS pixels
- appearances: light and dark
- public component stories checked: 92
- Studio design references retained: 217
- stories with visible output: 92
- stories with console or page errors: 0

## Verdict

The audited public catalog passes render, interaction, accessibility, theming, and package-structure checks. Every public component has one closed/default, interaction-ready Storybook story and was captured in light and dark mode. Overlay-only components are opened through their public APIs by the audit harness; their normal stories remain closed so developers can exercise the real interaction.

The original 217 Studio cards remain available as design references. They are no longer treated as 217 component requirements: cards that only show a property combination, field state, app-specific assembly, or minor visual variation are documented under `Examples/*`. The package API contains only reusable atoms, purposeful composites, layout utilities, and headless bases.

Visual checks establish that every public component renders with the Cube theme and the intended Studio anatomy. The generated board crops are navigation aids rather than pixel-diff baselines because several Studio boards contain grouped examples instead of one isolated component per cell.

## Focused visual QA — Expandable section

- final result: passed
- audited: 2026-10-18
- source visual truth: user-provided `Screenshot 2026-10-18 at 12.44.52 PM.png`, `12.45.00 PM.png`, `12.46.05 PM.png`, and `12.46.11 PM.png`
- implementation: `http://127.0.0.1:6006/?path=/story/data-display--expandable-section`
- browser: Google Chrome
- viewport: 1100 × 760 CSS pixels, 1100 × 760 output pixels, device scale factor 1
- states checked: collapsed, expanded, hover, keyboard expansion, light appearance, and dark appearance
- full comparison evidence: `design-qa-artifacts/comparison/expandable-section.png`
- focused implementation evidence: `design-qa-artifacts/implementation/data-display/expandable-section-light.png`, `expandable-section-light-hover.png`, `expandable-section-light-expanded.png`, `expandable-section-dark.png`, and `expandable-section-dark-expanded.png`

Findings and iteration history:

1. P1 — The interactive story used the filled `container` variant and placed another bordered demo surface inside it. Resolved by using the transparent default disclosure and natural body copy.
2. P1 — The shared button hover rule painted the full trigger background. Resolved with a component-specific transparent hover/active surface and primary text/icon feedback.
3. P1 — Rotating the icon host clipped the expanded chevron. Resolved by switching the composed `cb-icon` between the `right` and `down` glyphs.
4. P2 — The default presentation lacked the quiet divider shown by the reference. Resolved with a theme-token divider below the collapsed header and between the open header and content.

Primary interactions were exercised by pointer and keyboard. `aria-expanded`, region linkage, cancelable expansion, public expansion methods, and the right/down glyph states are covered by browser tests. The focused live Storybook console had zero errors. The repository-wide visual capture also recorded zero errors for `data-display/expandable-section`; it reported a separate existing Gradient Editor recursion error outside this focused change.

## Focused visual QA — Color picker

- final result: passed
- audited: 2026-10-18
- source visual truth: user-provided `Screenshot 2026-10-18 at 12.48.59 PM.png` and the ordered anatomy described with it
- implementation: `http://127.0.0.1:6006/?path=/story/styling--color-picker`
- browser: Google Chrome
- appearances checked: light and dark
- states checked: closed trigger, open editor, HEX edit, saved-current-color action, selected swatch, Delete-key removal, focus recovery, and Storybook Actions output

Findings and iteration history:

1. P1 — The HEX toolbar preceded the color plane and included a redundant color-preview box. Resolved by putting the plane and compact hue/alpha rails first and rendering the standalone HEX field afterward.
2. P1 — The hue and alpha rails repeated visible labels and values already represented by the numeric channels. Resolved by keeping their localized accessible names while removing the duplicate visual copy.
3. P1 — The trigger-width container query collapsed the popup channels into an awkward two-column layout. Resolved by making the popup the responsive container, keeping Hue/Saturation/Brightness/Alpha in one row and Red/Green/Blue in a distinct row at the default width.
4. P1 — Saved colors had no authoring or removal behavior. Resolved with a composed `cb-icon-button` add action, focus-preserving selection, Delete/Backspace removal, and cancellable `cb-before-swatch-add` / `cb-before-swatch-remove` events followed by completion events.
5. P1 — Committing the HEX input during a pointer transition could rerender or shift the target and swallow the add action. Resolved with keyed palette updates and explicit focus recovery; the real click-edit-save workflow is covered by the browser test.

The live Storybook Actions panel recorded the picker input/change lifecycle and all four swatch events. Storybook exposes controls for all 41 reactive picker and field props, including the editable `swatches` and `recentColors` arrays plus localized add/remove labels. The focused browser tests include an open-state Axe audit.

## Focused visual QA — Gradient editor

- final result: passed
- audited: 2026-10-18
- source visual truth: user-provided `Screenshot 2026-10-18 at 12.56.13 PM.png` and the four requested removals/interactions described with it
- implementation: `http://127.0.0.1:6006/?path=/story/styling--gradient-editor`
- browser: Google Chrome
- implementation viewport/output: 1555 × 1117 pixels
- appearances checked: light and dark
- states checked: linear, radial, selected stop, add/remove, pointer color editing, keyboard color editing, arrow-key movement, live alpha color update, Escape focus recovery, Storybook Actions output, and Axe scan
- visual evidence: live Chrome screenshots were captured and displayed during the audit; the named source attachment was not present at its local path, so no synthetic local comparison artifact was created

Findings and iteration history:

1. P1 — The component repeated the gradient in a large preview above the editable rail. Resolved by making the stop rail the single live visual result.
2. P1 — The selected stop repeated its position in a separate numeric editor even though the handle already communicates and edits that position. Resolved by removing the block and preserving drag plus Arrow, Shift+Arrow, Home, and End controls on the slider.
3. P1 — The component exposed a generated CSS string that applications do not need in the editing UI. Resolved by removing the visible readout while preserving the form value and public `value` property.
4. P1 — Stop color editing required a separate visible trigger. Resolved by opening the composed Cube color picker from a stop handle with double-click or Enter/Space, updating the rail in real time, and restoring focus on Escape or the picker close action.
5. P1 — Normalizing `stops` by reassigning the reactive property from its own update callback caused a maximum-call-stack loop. Resolved by normalizing at model and mutation boundaries without recursively assigning during `update`.
6. P1 — Slider handles initially carried popup-only ARIA attributes. Resolved by keeping native slider semantics and describing the color-edit interaction through the localized help text.

The focused Storybook accessibility scan reports zero violations. The post-reload interaction pass produced no console errors. `npm run typecheck`, all 51 unit tests, `npm run test:catalog`, `npm run test:exports`, `npm run build:storybook`, and `npm run build` pass.

## Focused visual QA — Presence

- final result: passed
- audited: 2026-10-18
- source visual truth: user-provided `/Users/ecorreia/Desktop/screengrabs/Screenshot 2026-10-18 at 1.08.12 PM.png` (1226 × 208) and `Screenshot 2026-10-18 at 1.09.50 PM.png` (806 × 208)
- implementation: `http://127.0.0.1:6006/?path=/story/collaboration--presence`
- browser: Google Chrome
- implementation viewport/output: 1555 × 1117 pixels at device scale factor 1; focused component capture 520 × 128 pixels
- states checked: light default, light hover, dark hover, participant action, overflow action, focus, and Axe scan
- visual evidence: the source images and focused Chrome captures were opened and displayed during the audit; Chrome provided the capture in-session without a persistent filesystem path
- comparison scope: component geometry and interaction styling were normalized around the default 32 CSS-pixel avatar; the reference portrait content is example data rather than a required asset baseline

Findings and iteration history:

1. P1 — The Presence stylesheet targeted the button's exported `participant-control` alias from inside the same shadow root. That alias is for external consumers, so the reset never reached the actual `control` part. The resulting control measured 58 × 42 pixels with `4px 12px` padding and a 6px rectangular radius. Resolved by targeting the composed button's real `control` part.
2. P1 — The padded buttons kept avatar centers roughly 52 pixels apart. Resolved with controls that exactly match the 32 × 32 avatar and a tokenized 4px overlap, producing a compact 28px center interval and the grouped treatment shown by the reference.
3. P1 — Hover painted the generic ghost-button rectangle around the avatar. Resolved by keeping the control background transparent in hover/active states and applying the visual feedback to the circular avatar through a theme-token halo and surface brightness change.
4. P2 — Applying brightness to the avatar host would also dim its presence-status dot. Resolved by applying brightness only to the avatar `surface` part while leaving the status indicator unchanged.

Fidelity surfaces: typography and copy retain the theme caption tokens and localized participant text; spacing now follows the compact overlapping anatomy; hover, separation rings, and dark/light colors use semantic theme tokens; image avatars and initials remain data-driven through `cb-avatar`, with no raster or masking regression. Focus stays circular and visible, the native button semantics remain intact, the Storybook Axe scan reports zero violations, and the focused console check reports no errors.

## Resolved findings

- Removed generated pseudo-components such as Width/Height, Min/Max, Aspect Ratio, Z-index, Search, Autocomplete, Preview Switch, Theme Switch, app-shell assemblies, and single-purpose asset/editor views.
- Consolidated Autocomplete behavior into `Combobox` through its `autocomplete` mode and consolidated all switch variants into `Switch`.
- Added `Calendar` as a reusable form component.
- Replaced browser-dependent Select, DatePicker, and TimePicker presentation with themed Cube controls by default. Their `native` flag opts into the platform control when an application wants it.
- Kept popups and dropdowns closed by default. Their component stories are interactive; open, native, validation, layout, asset-browser, editor, publishing, async, and collaboration compositions live under `Examples/*`.
- Flattened Storybook so components are direct children of understandable categories such as Form, Layout, Media, Navigation, Overlay, Data display, Charts, and Feedback.
- Reorganized source folders and exports by the same categories. Consumers can import the full client, a category, a component, or its headless base.
- Preserved `part` hooks and theme variables in the new controls, including composed Calendar and picker internals.
- Added keyboard navigation, screen-reader naming, form association, graceful defaults, validation states, and localized labels to the custom controls.
- Fixed document-level pointer handling across nested shadow roots so Select and picker popups work when composed inside media and higher-level components.
- Derived each interaction story's controls from the component's full reactive public API. Structured props such as dropdown `items`, select `options`, chart data, messages, tracks, labels, and themes use editable object controls rather than being hidden from Storybook.
- Made ButtonGroup a purposeful composite: it renders its own buttons from `items`, owns their action events and disabled state, and joins borders and corners in either orientation. SplitButton now uses the same continuous-control geometry.

## Category render audit

| Category | Stories | Visible | Console/page failures |
| --- | ---: | ---: | ---: |
| Action | 7 | 7 | 0 |
| Charts | 2 | 2 | 0 |
| Collaboration | 4 | 4 | 0 |
| Data display | 9 | 9 | 0 |
| Editor | 7 | 7 | 0 |
| Feedback | 9 | 9 | 0 |
| Form | 20 | 20 | 0 |
| Icons | 1 | 1 | 0 |
| Layout | 9 | 9 | 0 |
| Media | 2 | 2 | 0 |
| Navigation | 6 | 6 | 0 |
| Overlay | 10 | 10 | 0 |
| Styling | 5 | 5 | 0 |
| Theme | 1 | 1 | 0 |
| **Total** | **92** | **92** | **0** |

The generated one-row-per-story evidence includes measured dimensions and light/dark screenshot paths in `design-qa-artifacts/results.json`. The artifact directory is intentionally ignored by Git and can be regenerated with `npm run test:visual-audit`.

## Component and example model

Public components are retained when they have reusable behavior or semantics beyond a one-off arrangement:

- atoms: Button, Input, Select, Combobox, Calendar, Switch, Badge, Icon, and similar independent controls or content elements;
- composites: DatePicker, TimePicker, Modal, AlertDialog, media players, charts, editor primitives, and other controls with a distinct purpose;
- utility components: Box, Row, Col, Grid, Divider, resizable/docked layout utilities, and ThemeProvider;
- headless components: each rendered component's `*Base` class, which holds behavior independently of the concrete renderer.

Examples demonstrate composition without adding package tags. They currently cover autocomplete, native controls, dimensions, field states, box-model controls, flex controls, an inspector panel, appearance and typography controls, an asset browser, canvas selection, a publish flow, async states, and a review workflow.

## Verification

- `npm run typecheck` — passed
- `npm test` — 42 passed
- `npx playwright test` — 58 passed, including full-prop coverage for all 92 public components, the live Split Button add-item control, and joined-control geometry for ButtonGroup and SplitButton
- `npm run test:catalog` — 92 public entry points, 58 audited Studio components, all 217 design references, and eight chart stories verified
- `npm run test:exports` — ESM/CJS SSR-safe imports and 107 external-runtime browser entries verified
- `npm run build:storybook` — passed
- `npm run build:docs` — 17 pages across English, Portuguese, Spanish, French, and Chinese
- `npm run build` — passed
- `npm run test:visual-audit` — 92 stories captured in both themes; 0 render or console failures

## Audit method

1. Classify each Studio card as a real component, a reusable headless behavior, a utility, or an example.
2. Remove example-only tags and exports while keeping every board card in the design-reference catalog.
3. Exercise each public component through its Storybook controls and public interaction APIs.
4. Capture each story in light and dark appearances and reject blank output or console/page errors.
5. Run focused keyboard, form, dialog, media, chart, localization, theme, and axe checks in Chrome.
6. Verify category, component, CDN, ESM/CJS, documentation, Storybook, and full-package builds.
