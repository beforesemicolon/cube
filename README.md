# Cube by Before Semicolon

A TypeScript, headless-first web-component library for visual editors. This is the **0.3.0 alpha implementation branch**, not a released or complete 241-entry design system.

This increment implements `AudioPlayer`, `VideoPlayer`, `CartesianChart`, `PieChart` and their shared foundations, including `ThemeProvider`. Each concrete component registers its `cb-*` element when imported. Every component has a headless base, exposes styling parts, and consumes site-builder-compatible theme variables.

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

Use `dist/client.js` for all currently implemented components, or independent `dist/media/audio-player/client.js`, `dist/media/video-player/client.js`, `dist/charts/cartesian-chart/client.js`, and `dist/charts/pie-chart/client.js`. Category scripts are also emitted. Browser exports live in `BFS.CUBE`. Repeated same-version scripts do not register tags twice. Do not mix different Cube versions in one custom-element registry.

The WebComponent runtime is **external**, not compiled into Cube's browser scripts. Chart scripts also keep ECharts external: load `echarts/dist/echarts.min.js` before mounting a chart, or configure a promise-based loader with `BFS.CUBE.configureChartEngine`. Module consumers lazily import the ECharts dependency on the first chart render. Media-only scripts never load charting code.

## Themes and localization

```html
<cb-theme-provider src="/themes/brand.json" appearance="system">
  <cb-video-player locale="pt" src="/media/film.mp4"></cb-video-player>
</cb-theme-provider>
```

Theme JSON follows site-builder's `schemaVersion: "1.0"`, `name`, `tokens` contract, including mode-aware leaves and uppercase `DEFAULT` scales. Built outputs include `themes/cube.json`, `light.json`, `dark.json` and CSS equivalents. Nested providers scope variables; an explicit inner theme defines its own palette. External theme loads are abortable and stale responses cannot replace a newer theme. Token files reject stylesheet/network injection; use authored stylesheets for fonts, images and `@keyframes`.

Built-in control labels are available in English, Portuguese, Spanish, French and Chinese. All labels, including ARIA names, can be overridden with the `labels` property before or after mounting. Unknown locales fall back to English. Documentation uses the same five locales and the `fading-citrus` site-builder theme as Markup. The `:::cube component-name` markdown extension renders a fixed, safe example visualizer; it does not evaluate arbitrary pasted code. Markdown highlighting uses site-builder's existing highlight.js integration.

## Media

Simple native media with play/pause, stop, configurable backward/forward seeking, seek and volume sliders, mute and playback rate. Video additionally supports poster, caption tracks and fullscreen when supported. Playback is not autoplaying by default. The native media node and focused controls survive property updates.

```ts
player.seekStep = 15
player.labels = { backward: 'Back 15 seconds', forward: 'Ahead 15 seconds' }
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

Import bases from `@beforesemicolon/cube/media/audio-player/base`, `.../video-player/base`, `.../charts/cartesian-chart/base`, or `.../pie-chart/base`. A custom renderer extends the base, supplies its media element or chart view, and registers a different `cb-*` tag. Base imports do not register elements.

Media parts include `player`, `media`, `controls`, `play`, `stop`, `backward`, `forward`, `seek`, `volume`, `mute`, `rate`, `captions`, `fullscreen`, `status`, `transcript` and `icon`. Chart parts include `chart`, `title`, `description`, `legend`, `legend-item`, `plot`, `graphic`, `actions`, `navigator`, `details`, `data`, `table` and `table-cell`. Use `::part` for structural overrides and theme variables for appearance. ECharts-owned SVG descendants are engine internals, not individually stable Cube parts.

## Scope and status

This is the media/chart increment of the larger Cube rewrite. The other component families, BOS-style global modal/flashbar services, layout utilities, full design inventory and release migration remain outside this increment. Legacy `src/`, `docs/` and old build scripts are retained in the repository for comparison, but excluded from the new package and build. Their final cleanup belongs to the broader migration review.

The Figma Starter tool quota blocked insertion of these four new references. They are **not yet added to Figma**. Browser reference screenshots are separate review artifacts, not a substitute for editable Figma component states. No npm release, production deployment or main-branch merge is performed by this implementation.
