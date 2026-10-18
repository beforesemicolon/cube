# Cube by Before Semicolon

A TypeScript, headless-first web-component library for visual editors. This is the **0.3.0 alpha implementation branch**, not a published release.

The eleven Studio boards contain 217 visual references. An explicit audit separates those references into 91 independently loadable component entries and application-level composition examples; a Figma card is no longer treated as a component merely because it has a name. Preview and theme switching are usage contexts for `Switch`; autocomplete is a `Combobox` mode; multi-selection and searchable option lists are modes of `Select`; dimensions, aspect ratio and z-index are examples assembled from form and layout primitives. Each concrete component registers its `cb-*` element when imported, has a headless base, exposes styling parts, and consumes site-builder-compatible theme variables.

## Develop

```sh
npm install
npm run build:package
npm run test:exports
npm run storybook
npm run build:docs
npx playwright install chromium
npm run test:browser
```

`npm test` covers DOM-independent models and controllers. Browser tests use the actual WebComponent runtime and ECharts, exercise keyboard/ARIA behavior, run axe checks, and produce light/dark reference screenshots. See the PR/CI results for which checks have actually run. Test files and a successful syntax check alone are not accessibility certification.

## Module usage

```ts
import '@beforesemicolon/cube/theme/theme-provider'
import '@beforesemicolon/cube/media/audio-player'
import { loadComponent } from '@beforesemicolon/cube'

// Load only when needed. Concrete imports register themselves.
await loadComponent('cartesian-chart')
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

Import a whole category when an application uses most of it, or import a single component to keep registration lazy and explicit:

```ts
import '@beforesemicolon/cube/form'
import '@beforesemicolon/cube/navigation/menu'
import { MenuBase } from '@beforesemicolon/cube/navigation/menu/base'
```

The package root is DOM-independent and exports pure models, controllers, tokens and a lazy loader. Node and Deno can import those utilities without `HTMLElement`. Concrete classes and their headless WebComponent bases still require a DOM: Node compatibility does **not** imply server-side HTML rendering. ESM and CJS builds are provided. Deno can use its npm compatibility layer; no separate Deno runtime test is claimed yet.

## Browser scripts

Build the package first. These are distribution paths, not a claim that this alpha has been published to a CDN:

```html
<script src="/vendor/web-component/dist/client.js"></script>
<script src="/vendor/cube/dist/theme/theme-provider/client.js"></script>
<script src="/vendor/cube/dist/media/audio-player/client.js"></script>
<cb-theme-provider appearance="dark">
  <cb-audio-player src="/media/recording.mp3" media-title="Recording"></cb-audio-player>
</cb-theme-provider>
```

Use `dist/client.js` for the complete implemented catalog, a category path such as `dist/form/client.js`, or an independent path such as `dist/navigation/menu/client.js`. The public categories are `action`, `form`, `layout`, `navigation`, `overlay`, `feedback`, `data-display`, `media`, `charts`, `styling`, `editor`, `collaboration`, `icons`, and `theme`. Every component receives its own browser bundle. Browser exports live in `BFS.CUBE`. Repeated same-version scripts do not register tags twice. Do not mix different Cube versions in one custom-element registry.

`Select`, `DatePicker` and `TimePicker` use consistent Cube-rendered controls by default. Set `native` only when the browser-provided selector is desired. `Calendar` can also be imported independently, while `Combobox` supports list and autocomplete behavior through its `autocomplete` property.

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
await player.play() // false on a rejected play attempt; cb-error reports the cause
player.stop()
```

Back/forward seek within the current media; they are not playlist navigation. Stop pauses and resets to the earliest available seekable time. Unknown duration and live/disjoint seekable ranges are handled without assigning invalid times. Provide captions and a transcript (`slot="transcript"`) when the content requires them. Fullscreen and codecs remain browser capabilities, not emulated guarantees.

## Charts

The two chart components use an independent Apache ECharts adapter inspired by Cloudscape's functional contracts, not its React implementation or Highcharts dependency. See [the parity matrix](design/media-and-charts.md).

- Cartesian: mixed line/spline, area, column/bar, scatter/bubble, error ranges and thresholds; category/time/linear/log axes; two value axes; inversion; normal stacking; filtering and zoom.
- Pie: pie/donut, center text, segment visibility and selection. All-zero data produces an empty state, not equal fake wedges. Percentages describe **visible data**.
- Both: stable IDs, explicit empty/loading/error/no-match states, DOM legend controls, keyboard point exploration, pinnable details, selectable data table and container resizing. Missing values stay gaps, not zero.

`visibleSeries` / `visibleSegments` arrays make visibility controlled. Handle `cb-visibility-change` and assign the proposed `visibleItems` to accept a change. Omit these properties for internal control. Data changes should use a new array/object or call `refresh()` after intentional in-place edits. `cb-select` reports the selected point; `cb-zoom-change` reports zoom bounds.

The chart graphic is decorative to assistive technology; Cube owns the textual exploration and table. Keyboard instructions are localized. Rich HTML tooltip rendering is intentionally not exposed, avoiding untrusted HTML interpretation. Chart animation honors reduced motion.

## Styling and extension

Import bases through a component's `/base` export, for example `@beforesemicolon/cube/navigation/menu/base`, `.../layout/grid/base`, `.../overlay/modal/base`, or `.../charts/cartesian-chart/base`. A custom renderer extends the base and registers a different `cb-*` tag. Base imports do not register elements.

Action parts include semantic surfaces such as `control`, `trigger`, `popup`, `menu`, `item`, `tab`, `navigation`, `page`, `tooltip`, `shortcut` and `key`. Layout primitives expose `content` or `line`; overlay parts include `dialog`, `header`, `heading`, `description`, `body`, `footer`, `message` and `message-actions`. Media and chart parts retain their documented control and data surfaces. Use `::part` for structural overrides and theme variables for appearance. Third-party engine descendants are not stable Cube parts.

## Scope and status

This remains an alpha increment of the larger Cube rewrite. The full 217-item Studio inventory remains indexed as design references in `components/studio/catalog.ts`; only the audited reusable subset is published as components. Storybook provides one interaction-ready story per component plus a separate application-composition gallery, and the localized documentation site provides category-level visualizers. The source boards in `design/figma-layers/Studio` remain the visual acceptance reference. Legacy `src/`, `docs/` and old build scripts remain for comparison but are excluded from the new package and build.

No npm release, production deployment or main-branch merge is performed by this implementation.
