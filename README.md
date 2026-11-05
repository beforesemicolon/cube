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
import '@beforesemicolon/cube'
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

To load selected categories, import them directly:

```ts
import '@beforesemicolon/cube/action'
import { TextInputBase } from '@beforesemicolon/cube/form'
```

The package root, category and individual component entrypoints register their custom elements synchronously when imported, using the installed WebComponent package. For one component, use `import '@beforesemicolon/cube/form/text-input'`. Classes and bases are normal named exports; no initializer, runtime argument, or ready promise is required. Component entrypoints require a DOM, like `@beforesemicolon/router`. ESM and CJS builds are provided. Browser script clients instead receive the WebComponent runtime already available on `BFS`.

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

The public categories are `action`, `text`, `form`, `layout`, `navigation`, `overlay`, `feedback`, `data-display`, `media`, `charts`, `styling`, `editor`, `collaboration`, `icons`, and `theme`. Individual component browser bundles are no longer emitted. Each category registers only its own components. Load the categories used by composed controls at the application level; for example, form steppers use buttons from `action`, and media players use controls from `action` and `form`. Components do not import or register the components they render. Only utility APIs, such as `showModal`, `showFlashbar`, and `configureChartEngine`, are exposed in `BFS.CUBE`—not component classes. Tags are immediately available through `customElements`, without a `ready` promise. Repeated same-version scripts register tags idempotently.

`Select`, `DatePicker` and `TimePicker` use consistent Cube-rendered controls by default. Set `native` only when the browser-provided selector is desired. `Calendar` belongs to the form category, while `Combobox` supports list and autocomplete behavior through its `autocomplete` property.

Anchored menus and pickers size themselves to their content and stay within the viewport. Use `popupMaxWidth` and `popupMaxHeight` with a CSS length or a numeric pixel value to override a component’s defaults; constrained content scrolls inside the popup.

Menus and popups also light-dismiss when focus moves into an outside iframe, including cross-origin frames. An iframe embedded inside the popup remains interactive without dismissing it.

The WebComponent runtime is **external**, not compiled into Cube's browser scripts. Chart scripts also keep ECharts external: load `echarts/dist/echarts.min.js` before mounting a chart, or configure a promise-based loader with `BFS.CUBE.configureChartEngine`. Module consumers lazily import the ECharts dependency on the first chart render. Media-only scripts never load charting code.

## Native rich-text surfaces

`RichTextController` from `@beforesemicolon/cube/form/rich-text-editor/base` attaches the same editing engine used by `cb-rich-text-editor` to an existing `HTMLElement` or text node, including in a same-origin iframe. It changes no typography, dimensions or layout. Supply `value`, a synchronous `commit(value, event)` returning whether the draft was accepted, optional `blocked`, `formatsChanged`, `inline`, `plainText`, and `inlineRun` (only when the authored source represents the whole inline run). `focus(options, point)` optionally places the caret at iframe-local screen coordinates. `format(format, event)` operates on the remembered selection; `sync()` applies external values; `dispose()` removes listeners and restores original attributes/content. Pass `false` to disposal only for a surface owned by a field that is being removed. The controller owns native DOM editing interop, not rendering or persistence.

The standalone `cb-rich-text-toolbar` accepts `activeFormats`, `disabled`, an accessible label and the six formatting labels. It emits one `format` event with `{ format, originalEvent }`. Its default slot accepts extra actions. Import the toolbar, button and toolbar/layout dependencies explicitly. The full `cb-rich-text-editor` now composes this toolbar and controller, retaining its form value, validation, variants, selection and input events. For source-backed page authoring, keep revision checks, source ownership and save/cancel outside Cube.

## Custom tab headers

`cb-accordion` items accept an optional `renderItem: () => HtmlTemplate | Node` factory for lazy panel content. It runs once on first expansion; loaded content remains mounted while collapsed so field values and focusable controls are retained (but hidden and inert). Use `multiple` to allow several panels open at once. Assign items containing factories through the JavaScript `items` property, not JSON attributes. Without `renderItem`, existing `renderContent` and `content` behavior is unchanged. Replacing an item object creates fresh lazy content; `renderItem` takes precedence over either fallback.

`cb-tabs` items accept an optional `renderItem: () => HtmlTemplate | Node` factory. Omit it to display `label`. Keep `label` as the accessible tab name even when the header contains icons or badges. Cube retains selection, disabled state, keyboard navigation, dirty markers and `closable` actions; the active indicator spans the whole header, including its close button. Render non-interactive label content with the factory and use `closable` for the native close action rather than nesting buttons inside a tab.

```ts
tabs.items = [
    { id: 'pages', label: 'Pages' },
    { id: 'component', label: 'HelloWorld', closable: true,
        renderItem: () => html`<span>HelloWorld <small>Component</small></span>` },
]
```

## Workspace panels

`cb-workspace` defaults to single slotted `start`, `end`, and `bottom` panels with toggle buttons. Use `variant="tabbed"` for persistent side rails and horizontal bottom tabs:

```ts
import '@beforesemicolon/cube/action'
import '@beforesemicolon/cube/icons'
import '@beforesemicolon/cube/layout/panel-header'
import { Workspace } from '@beforesemicolon/cube/layout/workspace'
import { html } from '@beforesemicolon/web-component'

const workspace = document.createElement('cb-workspace') as Workspace
workspace.variant = 'tabbed'
workspace.startLabel = 'Navigation panels'
workspace.startItems = [
    { id: 'pages', name: 'Pages', iconName: 'file', renderContent: () => html`<p>Pages</p>` },
    { id: 'layers', name: 'Layers', iconName: 'layers', renderContent: () => document.createElement('div') },
]
document.body.append(workspace)
```

Assign `startItems`, `endItems`, and `bottomItems` as JavaScript properties; functions cannot be supplied as HTML attributes or JSON. Each item has `id`, `name`, optional `description`, `iconName` and `collapsedName`, and a `renderContent()` factory returning a Markup template or DOM Node. Open panels render a `cb-panel-header` with the item's name and description. Rails show only the icon when provided, otherwise the name (or `collapsedName`); side fallback names are vertical and bottom names horizontal. Accessible tab names remain available in icon-only mode. Do not repeat the panel heading inside `renderContent`. The first valid item is selected by default; `startValue`, `endValue`, and `bottomValue` select IDs explicitly. Invalid/duplicate items are ignored (first valid ID wins), and a missing active ID falls back to the first valid item.

Only each open panel's active factory is called. Switching tabs or collapsing unmounts its content; reopening calls the factory again. Keep any state you want to preserve outside the factory. An empty item array removes that region. Clicking an active tab collapses its panel; clicking another selects and opens it. Tab actions emit one `change` with `{ panel, value, previousValue, open, previousOpen, originalEvent }`; `beforechange` can cancel them. Arrow keys/Home/End move focus; Enter/Space activate. On narrow containers, rails remain visible and only one panel opens as an overlay. `startOpen`, `endOpen`, and `bottomOpen` retain desktop visibility; `mobilePanel` controls the mobile overlay. `persistKey` also remembers tab selection alongside existing panel sizes and visibility.

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

Fields use flat white backgrounds and soft grayscale borders in light mode, with equivalent neutral surfaces in dark mode. Resting and hover states have no inset shading or accent tint; accent color is reserved for focus and checked/active states. The `component.field` theme group controls `background`, `hover`, `border`, `borderHover`, and `radius` (CSS: `--component-field-*`). Applications can override these tokens. This treatment preserves control sizing and is scoped to input surfaces and neutral buttons, not layout panels or editor canvases; opt-in native selectors retain their native behavior.

Cube is localization-agnostic: it does not own a `locale` attribute, translation catalog, or dependency on `@beforesemicolon/intl`. Applications provide final translated visible and ARIA text through the component’s explicit text properties. Native number, date, and time formatting uses the document’s `lang` as a formatting hint. The documentation itself is available in five languages and uses the `fading-citrus` site-builder theme as Markup. The `:::cube component-name` markdown extension renders a fixed, safe example visualizer; it does not evaluate arbitrary pasted code. Markdown highlighting uses site-builder's existing highlight.js integration.

### Multi-select combobox and compact actions

`cb-combobox` supports `multi` with an array `value`. Selected options appear as removable chips, typing filters independently of the selections, and the dropdown stays open after choosing an option. Provide `remove-label="Remove {label}"` (or translated equivalent) for the × buttons. There is no comma-separated entry syntax: commas remain ordinary characters. Each add/remove emits one `change` with the new and previous values. Multi selections submit repeated form entries under `name`.

A sole enabled match is highlighted automatically; Enter or Space accepts it without moving focus out of the input. Add `allow-custom` (JS: `allowCustom = true`) to let Enter commit unmatched text as a value. This flag is off by default. Custom values are trimmed, duplicate selections are not added again, and the supplied options remain unchanged. Space is still ordinary text when there is no sole match.

Use `<cb-button size="tiny" icon="close" icon-only accessible-label="Remove item"></cb-button>` for compact contextual actions: 1px padding, 10px icons, and a 14px default height. Normal button variants, focus, disabled and toggle behavior are unchanged.

### Custom icons

`cb-icon` accepts an SVG child, an image `src`, or a built-in `name`, in that order of precedence:

```html
<cb-icon accessible-label="Company mark">
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 2h20v20H2z" /></svg>
</cb-icon>
<cb-icon src="/icons/company.svg" accessible-label="Company mark"></cb-icon>
<cb-button icon-src="/icons/company.svg" label="Company"></cb-button>
```

Inline SVG inherits `currentColor` and scales to the icon size. Supply trusted SVG markup as children. External SVG sources load as inert images, retain their file colors, and are never injected into the page. Relative, HTTP(S), blob and image data URLs are supported. Provide `accessible-label` for standalone meaningful icons; omit it for decorative icons beside text.

Controls with an `icon` property also accept `iconSrc` (`icon-src` in HTML). Item/action records with `icon` or workspace tab records with `iconName` accept `iconSrc` too. Sources take precedence over built-in names. When loading individual components or categories, load the icons category as well as their other composed dependencies; the full Cube import/client includes it.

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

`cb-rich-text-editor` is a small WYSIWYG form field with bold, italic, underline, strikethrough, superscript, and subscript controls. Its `value` consumes/emits canonical HTML (`strong`, `em`, `u`, `s`, `sup`, `sub`, `br` only, no attributes). Unsupported wrappers become plain text; executable/embedded content is discarded. Pasted HTML goes through the same allowlist. `variant="inline"` is a one-row editor by default and flattens pasted line breaks to spaces; `variant="box"` supports line breaks and vertical resizing. It submits its HTML value under `name`, supports required/read-only/disabled/reset/restoration and cancelable live `beforechange`/`change` transactions with both `value` and `previousValue`. Assigning `value` does not emit `change`.

Provide `accessible-label`, `toolbar-label`, `bold-label`, `italic-label`, `underline-label`, `strikethrough-label`, `superscript-label`, and `subscript-label`. Use `cb-field` for external labels/messages. Formatting applies to the selection or subsequent typing at the caret; superscript and subscript are mutually exclusive. Keyboard shortcuts support Ctrl/Cmd+B/I/U and undo/redo. Load the `action` and `layout` categories alongside `form` for the toolbar/buttons. CSS parts include `shell`, `toolbar`, `control`, `format`, and `format-bold`/`format-italic`/`format-underline`/`format-strikethrough`/`format-superscript`/`format-subscript`.

Layer-tree nodes accept `actions: [{ id, icon, name, label, disabled }]` (only `id` and `label` are required). Actions are application-owned commands; `name` is the button name and `label` is its accessible text, also shown when no icon is supplied. Listen to `action` on `cb-layer-tree`: `detail` contains `{ id, item, action, originalEvent }`. These commands do not select, rename, or drag the node. Cancel `beforeaction` to veto a command. Existing visibility/lock/rename controls remain available independently.

Selection overlays accept the same `actions` array and an `actionsLabel` for the toolbar's accessible name. Their `action` detail is `{ action, rect, rotation, originalEvent }`. The toolbar flips above/below and shifts sideways within the nearest `cb-viewport` (intersected with the browser viewport). It stays unscaled and upright during zoom, pan, rotation, resizing, and scrolling; oversized action lists scroll. With no actions, no toolbar is shown. Load the `action` and `layout` categories alongside `editor` for the composed toolbar and buttons.

Selection borders are CSS-customizable, not a fixed set of variant props. Both `cb-selection-overlay` and `cb-marquee-selection` expose `::part(selection)`; existing `::part(outline)` and `::part(marquee)` remain available. For example:

```css
cb-selection-overlay::part(selection) { border-style: dashed; border-color: #be185d; }
cb-marquee-selection::part(selection) { border-style: dotted; border-color: #0891b2; }
/* Or theme all selection chrome, including handles and size labels: */
cb-selection-overlay {
  --component-selection-border-style: solid;
  --component-selection-color: #7c3aed;
  --component-selection-width: 2px;
}
```

Style the selection toolbar with `::part(controls)` and `::part(toolbar)`; its actions expose `action`, `action-control`, `action-icon`, and `action-label`. Node commands expose the same action parts on `cb-layer-tree` plus `node-action`.

Artboards size themselves to the full content extent by default, without internal scrolling. Set `name` for the editable title; provide `nameLabel`, `saveLabel`, and `cancelLabel` for its controls. Selected artboards show right, bottom, and corner resize handles. Resizing fixes both dimensions; clear `width` and `height` (or set them to `0`) to return to content sizing. Confirmed name edits emit `change` with `value` and `previousValue`; resizing emits `resize` with previous and next size objects. Single-click the name to select and center the artboard at 100% zoom inside `cb-viewport`; double-click the name (or press F2) to edit it. Double-clicking the artboard surface also centers it. Composed artboards require the `form` and `action` categories for their name editor and handles.

Enable artboard guides with `guidesEnabled`; `showGuides` hides the UI without deleting saved guides. Supply `guides` as `{ id, axis, position }[]` in document pixels (`x`: horizontal line, `y`: vertical line). Provide `horizontalGuideLabel`, `verticalGuideLabel`, and `guideLabel` (supports `{id}`, `{axis}`, `{position}`) for accessible controls. Drag from the top/left edge to create, drag a line to reposition, or drag past an edge to remove. Lines snap to edges, the center, and other parallel guides. Escape restores the starting guides. Focused guides support arrows (Shift: 10px), Home, End, and Delete; activating a creation edge by keyboard adds a centered guide. `guideDistanceLabel` supports `{start}` and `{end}` distances from opposing edges. `guideschange` reports live `value`, `previousValue`, `guide`, and `operation`; `guideend` reports the completed gesture, its original `previousValue`, and `cancelled`. Persist `event.detail.value` to restore guides later. Programmatic assignment emits no interaction event. Guides use the editor category's `cb-guide-overlay` and the action category's `cb-button`.

Reusable component styles live in `.css` files, imported directly into each renderer's `stylesheet` property. Local CSS `@import` rules share normalization and family styles. Vite handles these during development; the package build flattens imports and emits stylesheet text modules for ESM/CJS and browser clients, so consumers do not need a CSS loader or import-assertion support.

Component hosts, their shadow DOM elements, and their pseudo-elements use `box-sizing: border-box` without relying on a page-wide reset. Slotted application content remains styled by the application.

Import concrete classes and headless bases directly, for example `import { MenuBase } from '@beforesemicolon/cube/navigation'` or `import { Component } from '@beforesemicolon/cube/core'`. A custom renderer extends the base, returns an `HtmlTemplate`, and registers its own custom-element tag. Individual component paths register their own tags; `/base` paths load only headless behavior, without registering tags or rendered dependencies.

Action parts include semantic surfaces such as `control`, `trigger`, `popup`, `menu`, `item`, `tab`, `navigation`, `page`, `tooltip`, `shortcut` and `key`. Layout primitives expose `content` or `line`; overlay parts include `dialog`, `header`, `heading`, `description`, `body`, `footer`, `message` and `message-actions`. Media and chart parts retain their documented control and data surfaces. Use `::part` for structural overrides and theme variables for appearance. Third-party engine descendants are not stable Cube parts.

### Automatic button tooltips

Opt in by wrapping an application or panel in `<cb-tooltip-provider>`. Register both `@beforesemicolon/cube/overlay/tooltip-provider` and `@beforesemicolon/cube/overlay/tooltip` when using individual imports. The provider uses existing accessible labels, button labels, or native titles, including buttons rendered inside composed Cube components. It does not change button layout, actions, or selection styling. Website content inside an iframe is outside the scope.

The provider supports pointer hover, keyboard navigation, disabled controls, and dynamic buttons. `delay` defaults to 400ms; set `enabled="false"` to disable the scope. Escape, activation, focus blur, document scrolling, window blur, and removal dismiss hints. Composed hover/focus ownership is also checked while a hint is active, so entering an iframe or a trimmed shadow-boundary event cannot retain stale hints. Original titles and accessibility descriptions are restored on dismissal; explicit `cb-tooltip` wrappers and nested providers take precedence. Supply labels for icon-only controls, as usual.

Provider hints reuse `cb-tooltip` with its optional `anchorRect` (`{ left, top, right, bottom }` in viewport pixels). The provider supplies `boundaryRect` in the same shape, intersecting the visual viewport with composed `overflow:auto`/`scroll` ancestors (including shadow roots and slots). Anchored hints flip and shift inside those visible scrollports, remain unscaled in the browser top layer, and dismiss when their trigger scrolls fully outside. Decorative `overflow:hidden` wrappers do not create a scroll boundary. Standalone anchored tooltips can supply `boundary-rect` explicitly; ordinary slotted tooltips retain their existing placement and API.

## Scope and status

This is an alpha increment of the Cube rewrite. The 216-item Studio design-reference inventory is indexed in `components/studio/catalog.ts`; only the audited reusable subset is published as components. Storybook provides interaction-ready component stories plus a separate application-composition gallery, and the localized documentation site provides category-level visualizers. The source boards in `design/figma-layers/Studio` remain the visual acceptance reference. Legacy `src/`, the old `docs/`, and their unused tooling have been removed; current source and documentation live in `components/` and `docs-cube/`.

No npm release, production deployment or main-branch merge is performed by this implementation.

Artboard headers accept `nameIcon` and `nameDescription` (for example, a page type icon and route). With `editable=false`, the name and description form a selectable button with no inline editor. Pointer or keyboard activation honors the normal selection veto, selects the artboard, and emits `headeractivate` even when it was already selected. Applications can open their own Details inspector from this event. Double-clicking the non-editable name emits `headerdoubleactivate`, honoring the same selection veto, so applications can open a focused editing view. The `header-actions` slot aligns an application's menu at the opposite end of the existing header; it does not select, center, rename, or resize the artboard. Empty header space remains transparent to border hit testing. Existing `editable=true` consumers retain inline renaming.

`cb-viewport` accepts a `top-center` slot for consumer toolbars. Slotted content stays fixed in viewport coordinates through pan and zoom, above the hand-tool capture surface. The `top-center` part provides the same raised control surface as positioned actions and is hidden when its slot is empty. Pointer, keyboard and wheel interactions in this slot do not pan the viewport.

### Mentions

Text inputs, textareas and rich text editors accept an optional `mentions` property. Options are data, never executable expressions:

```js
field.mentions = {
  trigger: '@',
  options: [{ id: 'total', label: 'Total', group: 'State', insertText: '{{state.total}}' }],
  onSelect: ({ option, range }) => console.log(option.id, range)
}
```

Typing a trigger at a word boundary opens the default accessible suggestion list. Arrow keys navigate, Enter inserts, Escape or Tab dismisses; email addresses and composition input are left alone. The popup follows the caret and fits the viewport. Disabled/read-only fields do not insert mentions. Rich-text insertion preserves formatting and joins the controller's Undo/Redo history. Values remain ordinary serialized strings. To show resolved reference labels while preserving source strings, supply `references` to text inputs, textareas or rich-text editors:

```ts
field.references = [{ value: '{{data.version}}', text: '1.3.6' }]
field.value = 'Version {{data.version}}' // displays “Version 1.3.6”
```

The application supplies and refreshes these labels; Cube does not evaluate expressions. Native fields preserve reference identities during surrounding edits, mention insertion, deletion and Undo/Redo, and emit/submit source strings. Rich text also preserves references through formatting.

For an existing rich editing surface, pass `mentions: () => configuration` to `RichTextController`. For another editor, import `MentionController` and `MentionAdapter` from `@beforesemicolon/cube/core`; the adapter supplies text, selection, transactional replacement, caret bounds and a blocked predicate. A custom view callback can replace the default suggestion renderer. Call `dispose()` when detaching. Configuration may change dynamically; `refresh()` updates an open list. Applications own context, expression syntax, type validation and persistence.

Rich text supports host-resolved references through `references: [{ value: '{{data.version}}', text: '1.3.6' }]` on `cb-rich-text-editor`, or a `references` supplier on `RichTextController`. The editor shows `text` in an inline reference span while its public value and change events retain the original `value`. References keep identity through formatting, Undo/Redo, deletion and same-context paste. Selecting part of a reference formats or replaces that whole value. Cube never evaluates expressions; hosts supply resolved text, which is escaped before display.
