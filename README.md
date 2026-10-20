# Cube by Before Semicolon

A TypeScript, headless-first web-component library for visual editors. Current version: **0.3.0-alpha.1** (prerelease).

The eleven Studio boards contain 216 visual references. The audited component catalog is organized into 15 categories, alongside application-level composition examples. Preview and theme switching are usage contexts for `Switch`; autocomplete is a `Combobox` mode; multi-selection and searchable option lists are modes of `Select`; dimensions, aspect ratio and z-index are examples assembled from form and layout primitives. Categories register their `cb-*` elements explicitly. Components use WebComponent and Markup templates, have headless bases, expose styling parts, and consume site-builder-compatible theme variables.

## Develop

Use Node 24.11+ (or Node 22.18+) with npm. The lockfile pins the verified toolchain.

```sh
npm ci
npm run build:package
npm run test:exports
npm run storybook
npm run build:docs
npx playwright install chromium
npm run test:browser
npm run test:pack
```

`npm test` covers DOM-independent models and controllers. Browser tests use the actual WebComponent runtime and ECharts, exercise keyboard/ARIA behavior, run axe checks, and produce light/dark reference screenshots. See the PR/CI results for which checks have actually run. Test files and a successful syntax check alone are not accessibility certification.

Every component has a colocated browser contract. `npm run verify:release` runs the full release gate, including an actual tarball installed into an isolated consumer to check ESM, CJS and declarations. `npm pack` rebuilds the package first; `test:pack` writes its inspected archive to `release-artifacts/` without publishing it. The npm payload is limited to compiled modules, declarations, category clients, themes, icons and package documentation.

This prerelease sets `publishConfig` to public access and the `alpha` tag, not `latest`. CI runs the same `verify:release` command as the prepublish hook. See [npm's publishConfig documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#publishconfig) for the publishing configuration. Verification does not publish the package.

## Module usage

```ts
import * as runtime from '@beforesemicolon/web-component'
import initializeCube from '@beforesemicolon/cube'

await initializeCube(runtime)
const chart = document.createElement('cb-cartesian-chart')
Object.assign(chart, {
    heading: 'Weekly activity',
    xAxis: { type: 'category', categories: ['Mon', 'Tue', 'Wed'] },
    series: [
        { id: 'actual', name: 'Actual', type: 'column', data: [12, 18, 15] },
        { id: 'target', name: 'Target', type: 'line', data: [15, 17, 19] },
    ],
})
document.body.append(chart)
```

To initialize selected categories, pass the same runtime to their initializers:

```ts
import * as runtime from '@beforesemicolon/web-component'
import initializeAction from '@beforesemicolon/cube/action'
import initializeForm from '@beforesemicolon/cube/form'

await initializeAction(runtime)
const { TextInputBase } = await initializeForm(runtime)
```

The package root and category entrypoints can be imported without a DOM. They export initialization functions and types; the root also exports pure models, controllers and tokens. Initializing components requires a DOM. `loadCategory('form')` is available when module consumers want Cube to load the installed WebComponent package. ESM and CJS builds are provided.

## Browser scripts

Build the package first. These are distribution paths, not a claim that this alpha has been published to a CDN:

```html
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>
<script src="https://unpkg.com/@beforesemicolon/cube/dist/client.js"></script>
<cb-theme-provider appearance="dark">
  <cb-audio-player src="/media/recording.mp3" media-title="Recording"></cb-audio-player>
</cb-theme-provider>
```

Use `dist/client.js` for the complete catalog or flat category clients:

```html
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>
<script src="https://unpkg.com/@beforesemicolon/cube/dist/action-client.js"></script>
<script src="https://unpkg.com/@beforesemicolon/cube/dist/form-client.js"></script>
```

The public categories are `action`, `text`, `form`, `layout`, `navigation`, `overlay`, `feedback`, `data-display`, `media`, `charts`, `styling`, `editor`, `collaboration`, `icons`, and `theme`. Individual component browser bundles are no longer emitted. Each category registers only its own components. Load the categories used by composed controls at the application level; for example, form steppers use buttons from `action`, and media players use controls from `action` and `form`. Components do not import or register the components they render. Browser exports live in `BFS.CUBE`, including a `ready` promise. Repeated same-version scripts register tags idempotently.

`Select`, `DatePicker` and `TimePicker` use consistent Cube-rendered controls by default. Set `native` only when the browser-provided selector is desired. `Calendar` belongs to the form category, while `Combobox` supports list and autocomplete behavior through its `autocomplete` property.

Anchored menus and pickers size themselves to their content and stay within the viewport. Use `popupMaxWidth` and `popupMaxHeight` with a CSS length or a numeric pixel value to override a component’s defaults; constrained content scrolls inside the popup.

The WebComponent runtime is **external**, not compiled into Cube's browser scripts. Chart scripts also keep ECharts external: load `echarts/dist/echarts.min.js` before mounting a chart, or configure a promise-based loader with `BFS.CUBE.configureChartEngine`. Module consumers lazily import the ECharts dependency on the first chart render. Media-only scripts never load charting code.

## Themes and application-supplied text

```html
<cb-theme-provider src="/themes/brand.json" appearance="system">
  <cb-video-player
    src="/media/film.mp4"
    play-label="Reproduzir"
    pause-label="Pausar"
  ></cb-video-player>
</cb-theme-provider>
```

Theme JSON follows site-builder's `schemaVersion: "1.0"`, `name`, `tokens` contract, including mode-aware leaves and uppercase `DEFAULT` scales. Built outputs include `themes/cube.json`, `light.json`, `dark.json` and CSS equivalents. Nested providers scope variables; an explicit inner theme defines its own palette. External theme loads are abortable and stale responses cannot replace a newer theme. Token files reject stylesheet/network injection; use authored stylesheets for fonts, images and `@keyframes`.

Cube is localization-agnostic: it does not own a `locale` attribute, translation catalog, or dependency on `@beforesemicolon/intl`. Applications provide final translated visible and ARIA text through the component’s explicit text properties. Native number, date, and time formatting uses the document’s `lang` as a formatting hint. The documentation itself is available in five languages and uses the `fading-citrus` site-builder theme as Markup. The `:::cube component-name` markdown extension renders a fixed, safe example visualizer; it does not evaluate arbitrary pasted code. Markdown highlighting uses site-builder's existing highlight.js integration.

Every original icon is emitted as an individual SVG, as a combined `dist/icons/sprite.svg`, and through `dist/icons/icons.css` mask classes. The CSS form behaves like an icon font while retaining SVG geometry and `currentColor`: `<span class="cb-icon cb-icon--undo" aria-hidden="true"></span>`. Use `<cb-icon>` when you need the component API and styling parts.

## Media

Simple native media with play/pause, stop, configurable backward/forward seeking, seek and volume sliders, mute and playback rate. Video additionally supports poster, caption tracks and fullscreen when supported. Playback is not autoplaying by default. The native media node and focused controls survive property updates.

```ts
player.seekStep = 15
player.backwardLabel = 'Back 15 seconds'
player.forwardLabel = 'Ahead 15 seconds'
player.tracks = [{ src: '/captions/en.vtt', language: 'en', label: 'English', default: true }]
await player.play() // false on a rejected play attempt; the error event reports the cause
player.stop()
```

Back/forward seek within the current media; they are not playlist navigation. Stop pauses and resets to the earliest available seekable time. Unknown duration and live/disjoint seekable ranges are handled without assigning invalid times. Provide captions and a transcript (`slot="transcript"`) when the content requires them. Fullscreen and codecs remain browser capabilities, not emulated guarantees.

## Charts

The two chart components use an independent Apache ECharts adapter inspired by Cloudscape's functional contracts, not its React implementation or Highcharts dependency. See [the parity matrix](design/media-and-charts.md).

- Cartesian: mixed line/spline, area, column/bar, scatter/bubble, error ranges and thresholds; category/time/linear/log axes; two value axes; inversion; normal stacking; filtering and zoom.
- Pie: pie/donut, center text, segment visibility and selection. All-zero data produces an empty state, not equal fake wedges. Percentages describe **visible data**.
- Both: stable IDs, explicit empty/loading/error/no-match states, DOM legend controls, keyboard point exploration, pinnable details, selectable data table and container resizing. Missing values stay gaps, not zero.

`visibleSeries` / `visibleSegments` arrays make visibility controlled. Handle `visibilitychange` and assign the proposed `visibleItems` to accept a change. Omit these properties for internal control. Data changes should use a new array/object or call `refresh()` after intentional in-place edits. `select` reports the selected point; `zoomchange` reports zoom bounds.

The chart graphic is decorative to assistive technology; Cube owns the textual exploration and table. Keyboard instructions are localized. Rich HTML tooltip rendering is intentionally not exposed, avoiding untrusted HTML interpretation. Chart animation honors reduced motion.

## Styling and extension

Reusable component styles live in `.css` files, imported directly into each renderer's `stylesheet` property. Local CSS `@import` rules share normalization and family styles. Vite handles these during development; the package build flattens imports and emits stylesheet text modules for ESM/CJS and browser clients, so consumers do not need a CSS loader or import-assertion support.

Category initializers return concrete classes and their headless bases, for example `const { MenuBase } = await initializeNavigation(runtime)`. The core initializer returns the shared `Component` base. A custom renderer extends the base, returns an `HtmlTemplate`, and registers its own custom-element tag. Individual class and `/base` module paths require the runtime to have been initialized first and do not register elements.

Action parts include semantic surfaces such as `control`, `trigger`, `popup`, `menu`, `item`, `tab`, `navigation`, `page`, `tooltip`, `shortcut` and `key`. Layout primitives expose `content` or `line`; overlay parts include `dialog`, `header`, `heading`, `description`, `body`, `footer`, `message` and `message-actions`. Media and chart parts retain their documented control and data surfaces. Use `::part` for structural overrides and theme variables for appearance. Third-party engine descendants are not stable Cube parts.

## Scope and status

This is an alpha increment of the Cube rewrite. The 216-item Studio design-reference inventory is indexed in `components/studio/catalog.ts`; only the audited reusable subset is published as components. Storybook provides interaction-ready component stories plus a separate application-composition gallery, and the localized documentation site provides category-level visualizers. The source boards in `design/figma-layers/Studio` remain the visual acceptance reference. Legacy `src/`, the old `docs/`, and their unused tooling have been removed; current source and documentation live in `components/` and `docs-cube/`.

No npm release, production deployment or main-branch merge is performed by this implementation.
