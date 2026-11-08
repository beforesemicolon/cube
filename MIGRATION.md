# Migrating from Cube 0.2

This branch is a breaking alpha, not an in-place release of the old framework.

Old templating, router, store and internationalization entrypoints are not exported by the new package. Use the maintained Before Semicolon packages (`markup`, `router`, `intl` and `web-component`) for the features moved out of Cube. Legacy `src/`, the old `docs/`, and their Jest/ESLint/build setup have been removed. The build source is `components/`, and the current documentation source is `docs-cube/`. Historical implementations remain recoverable from Git history.

Category imports register `cb-*` custom elements synchronously. Class names have no `Cb`/`Cube` prefix. `cube-ui` supplied the category-folder and Storybook reference, but its old render-in-base design and hardcoded button labels are not copied.

Event names are unprefixed and follow the lowercase DOM convention. For example, listen for `change`, `action`, `beforechange`, `openchange`, and `selectionchange`; the former `cb-*` event names are no longer dispatched. The `cb-*` prefix remains exclusive to custom-element tag names.

Popover emits `open` and `close` for visibility transitions, not the redundant `openchange` alias. Storybook component previews log only events dispatched by the demonstrated component, excluding helper controls; composition examples continue to log their participating components.

Feedback components now use their dedicated design patterns rather than the generic Studio notification layout. Messages and progress accept `tone="neutral|info|success|warning|danger"`. Status is an inline indicator; Toast, Alert, and Banner retain their heading/message copy and accept default-slot actions. Empty State uses the centered heading/icon/slot composition described below. Progress accepts `indeterminate` when completion cannot be measured. Spinner and Skeleton respect reduced motion and use their small/medium/large sizes. Existing message `value`, `status`, `label`, and `description` inputs are retained outside Empty State.

Every component-dispatched `change` includes both `detail.value` and `detail.previousValue`. Existing domain fields (for example pagination's `page` or viewport's `zoom`, `x`, and `y`) remain available. Compound values use snapshots: viewport values are `{zoom,x,y}` and ruler cursor values are `{x,y}`. File-picker changes include `files` and `previousFiles` as well as filename-based values; selecting a different same-named file is a change.

Date-picker changes also include `detail.date`: a local-calendar `Date` at noon, matching Calendar's date construction, or `null` when cleared. `value` and `previousValue` remain `YYYY-MM-DD` strings for native form submission.

Linked-values now uses grouped pair inputs: `values="320,180"`, `field-labels="Width,Height"`, and `names="width,height"`. JavaScript accepts arrays via `values`, `fieldLabels`, and `names`. It still renders exactly two numeric fields; missing numeric entries default to zero and entries after the second are ignored. Quote CSV captions containing commas and double embedded quotes, or use JS string arrays. The native-like `.labels` property still returns associated HTML labels.

Replace `firstValue`/`secondValue`, `firstLabel`/`secondLabel`, and `firstName`/`secondName` with those grouped inputs. Replace `setFirst(n)`/`setSecond(n)` with `setValueAt(0,n)`/`setValueAt(1,n)`. Changes expose numeric pair snapshots in `value` and `previousValue`, plus the edited `index` and `linked` state; the old per-field detail keys and string `source` are removed. Named fields submit independently, and reset restores the initial pair without emitting a change.

Editable-label keeps drafts separate from its committed/form value. Confirming with Save or Enter emits one `change`; typing or cancelling emits none. `submitOnBlur` now defaults to `false` (including Storybook); opt in explicitly to commit on blur. Combobox focus alone no longer opens suggestions: typing, the toggle button, or arrow keys opens them, and selecting an option closes them.

Icon-only buttons now use the boolean `icon-only` attribute (or `iconOnly` property) alongside a normal visual `variant`. Replace `variant="icon"` with `icon-only variant="ghost"` to preserve the former transparent appearance, or combine `icon-only` with any other button variant.

Grid now accepts `empty` for centered, full-track empty content. Avatar adds 20px `tiny` and 64px `xl` sizes plus deterministic theme-token fallback colors. Badge now accepts slotted content and `tone="neutral|info|success|warning|danger"`; Spinner's `lg` size is a distinct 40px token-backed ring. Action Bar accepts `wrap`, an `actions-only` mode, named `start` and `actions` composition, and a final `overflow` slot, while Segmented Control accepts `icon-only-at="sm|md|lg"`. The icon registry adds `table`, `list`, `calendarRange`, `users`, `userAdd`, `attachment`, `checkCircle`, `expand`, and `asterisk`.

The broad `InputBase` and `InputProps` exports were removed. Text, textarea, and file-picker bases now extend `FieldControlBase` directly, while numeric controls share `NumericInputBase`, whose value is typed as `number | null`.

`Toolbar` and `ActionBar` are layout components. Their imports moved from `@beforesemicolon/cube/action/toolbar` and `@beforesemicolon/cube/action/action-bar` to `@beforesemicolon/cube/layout/toolbar` and `@beforesemicolon/cube/layout/action-bar`. The `<cb-toolbar>` and `<cb-action-bar>` tag names are unchanged.

Layout-capable controls that previously accepted `orientation="horizontal|vertical"` now use the boolean `stacked` property and attribute. Use `stacked` for the former vertical layout and omit it for the default horizontal layout. The unused collection `orientation` prop was removed. Device frames retain `orientation="portrait|landscape"` because that describes the simulated device rather than a component layout.

Do not migrate an existing consumer by simply changing a version range. Inventory old imports and custom tags, adopt the new theme JSON and label contract, and verify behavior and accessibility in that application. Components live in consumer-facing categories: `action`, `text`, `form`, `layout`, `navigation`, `overlay`, `feedback`, `data-display`, `media`, `charts`, `styling`, `editor`, `collaboration`, `icons`, and `theme`. Import an entire category (`@beforesemicolon/cube/form`) and use its named class and headless-base exports. Former visual-only tags such as autocomplete, dimension, aspect-ratio, z-index, preview-switch and theme-switch are compositions or modes of retained primitives. A stable-version release review is still required before publication.

Browser consumers load the standalone WebComponent runtime first. Chart consumers additionally provide ECharts or a configured asynchronous engine loader. Neither engine is embedded into Cube's classic browser bundles. Pin published versions when a release is approved.

## Category initialization and rendering

Load WebComponent once, followed by `cube/dist/client.js` or category scripts such as `cube/dist/action-client.js` and `cube/dist/form-client.js`. The former per-component `dist/<category>/<component>/client.js` paths are removed.

Module entrypoints initialize themselves, matching Router: `import '@beforesemicolon/cube'` loads the complete catalog, while `import { TextInput } from '@beforesemicolon/cube/form'` loads only the form category. The installed WebComponent runtime is imported automatically. Remove calls to `initializeCube`, category initializers, `loadCategory`, and browser `ready` promises. Component entrypoints require a DOM and export classes directly.

Individual component imports now self-register their own tags, just like category and whole-library imports. Headless `/base` imports do not register tags. Applications load every component or category used by their compositions. Render bodies return Markup `HtmlTemplate` instances through `html`; the local `core/editor-dom` and `core/dom` builders are removed.

Component-owned markup binds props and state directly with lazy template expressions, `when`, and keyed `repeat`. Internal presentation state uses reactive signals rather than rebuilding or manually synchronizing child DOM. Imperative effects are reserved for native interoperability such as focus, selection, pointer capture, popup positioning, media playback, and the chart engine. Regression tests verify reactive updates independently of synchronization hooks and reject imperative DOM builders in component renderers.

Pass reactive getters directly: `${this.props.label}` for props, `${this.accessibleName}` for a bound derived arrow function, and `repeat(this.visibleDates, ...)` for a derived collection. Do not add `() => getter()` wrappers or eagerly invoke getters in template interpolations. Use a callback only when the binding actually computes a value or forwards event/item arguments.

Component styles use WebComponent's `stylesheet` property and `css` utility rather than rendered `<style>` elements. Conditions compose `when`, `is`, `isNot`, `and`, `or`, and `oneOf`; nested reactive reads use `pick`. A keyed `repeat` mapper returns an `html` template, including when its content uses `when`, so helper functions are evaluated as interpolations rather than rendered as array values. Static discriminated-union checks remain ordinary TypeScript where necessary for narrowing.

Use Markup refs for component-owned controls and repeated items, including document-order keyboard navigation. Handle bubbling `slotchange` on concrete containers, not on slots. Document-level modal/flashbar host discovery and ECharts-owned SVG are the only selector-query exceptions. Native form synchronization, focus/caret, media, popup positioning, geometry measurement, and engine cleanup remain lifecycle effects. Cube retains its public parts, domain-specific data/formatting contracts, and category initialization rather than adopting BOS's CMS-only API/registration restrictions.

ARIA boolean states passed through custom elements use explicit string tokens, for example `${when(this.props.open, 'true', 'false')}`, so a false state is not mistaken for attribute removal. Cube's event boundary retains bubbling/composed flags and cancelable request events; the runtime's default `dispatch` does not supply those flags.

## Stylesheet files

Static component styles now live in CSS files, not TypeScript template literals.
Components import `*.css?inline` and assign the imported text directly to
`stylesheet`. Shared normalization and family rules use local CSS `@import`
statements. Vite processes those imports for Storybook; the package build
flattens them for category clients and ESM/CJS CSS text modules. No global page
stylesheet is injected, and consumers do not need support for native CSS import
assertions. Runtime `@import` is not used because constructed shadow sheets
discard it. Reactive values stay in Markup bindings or CSS custom properties.
The CSS extraction does not change component attributes, slots, events or parts.

## List rendering and scrolling

`cb-list` now extends `Component` directly, not `CollectionBase`. Remove
`value`, `multiple`, `emptyLabel`, and selection/action listeners. Its only
list-specific inputs are `items`, `renderItem`, `gap`, `orientation`, and
`offset`. Supply your own item markup through the JavaScript `renderItem`
property (Element or Markup HtmlTemplate), or use its default slot. No label
row, item buttons, border, surface or padding is generated. Set host dimensions
with normal CSS and handle the native `scroll` event and `loadmoreitems`
CustomEvent. Arrays, Sets and iterables receive numeric indices; Maps receive
their original keys. Replace collections to trigger updates. Fetching/loading
and end-of-data state remain application concerns. See the data-display docs
and the Infinite list example for threshold details.

## Empty state composition

`cb-empty-state` now extends `Component`, not the message family. Replace
`label` with `heading`; move `value`/`status` copy into its default slot (or use
the inherited `description` for heading supporting text). `tone` is removed.
The icon tile and `cb-heading` are centered; the default slot accepts arbitrary
body content and zero or more consumer-owned actions. Import/register the text,
layout and icon categories used by its composition at application level.

```html
<cb-empty-state icon="search" heading="No matching pages">
    <p>Try another search or clear your filters.</p>
    <cb-button>Clear filters</cb-button>
</cb-empty-state>
```

## Card surface

`cb-card` now inherits `BoxBase` and renders only a default slot. It supplies a
themed surface, border, radius, padding and shadow, not an internal layout.
Remove `value`, `items` and `actionLabel`; supply headings, images, metadata,
actions and any application-specific layout as children. Inherited global
`label`/`description` are not rendered as a generated header or body. Existing
generated `panel`, `panel-header`, `card-media` and action parts are removed;
`content` is the only slot part. Box-family props control the surface and sizing.

## Removed Description Row

`cb-description-row`, `DescriptionRow`, `DescriptionRowBase`, and
`DescriptionRowProps` are removed. Render display-only metadata with native
`dl`/`dt`/`dd` or application-owned content. Use a read-only form control only
when the value should retain form-control behavior.
