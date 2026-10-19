# Migrating from Cube 0.2

This branch is a breaking alpha, not an in-place release of the old framework.

Old templating, router, store and internationalization entrypoints are not exported by the new package. Use the maintained Before Semicolon packages (`markup`, `router`, `intl` and `web-component`) for the features moved out of Cube. Legacy `src/`, `docs/` and old build scripts are retained for comparison and excluded from the new package/build. This branch uses `components/` as its build source; destructive legacy cleanup is deferred to the broader migration review.

Category initializers register `cb-*` custom elements. Class names have no `Cb`/`Cube` prefix. `cube-ui` supplied the category-folder and Storybook reference, but its old render-in-base design and hardcoded button labels are not copied.

Event names are unprefixed and follow the lowercase DOM convention. For example, listen for `change`, `action`, `beforechange`, `openchange`, and `selectionchange`; the former `cb-*` event names are no longer dispatched. The `cb-*` prefix remains exclusive to custom-element tag names.

Icon-only buttons now use the boolean `icon-only` attribute (or `iconOnly` property) alongside a normal visual `variant`. Replace `variant="icon"` with `icon-only variant="ghost"` to preserve the former transparent appearance, or combine `icon-only` with any other button variant.

The broad `InputBase` and `InputProps` exports were removed. Text, textarea, and file-picker bases now extend `FieldControlBase` directly, while numeric controls share `NumericInputBase`, whose value is typed as `number | null`.

`Toolbar` and `ActionBar` are layout components. Their imports moved from `@beforesemicolon/cube/action/toolbar` and `@beforesemicolon/cube/action/action-bar` to `@beforesemicolon/cube/layout/toolbar` and `@beforesemicolon/cube/layout/action-bar`. The `<cb-toolbar>` and `<cb-action-bar>` tag names are unchanged.

Layout-capable controls that previously accepted `orientation="horizontal|vertical"` now use the boolean `stacked` property and attribute. Use `stacked` for the former vertical layout and omit it for the default horizontal layout. The unused collection `orientation` prop was removed. Device frames retain `orientation="portrait|landscape"` because that describes the simulated device rather than a component layout.

Do not migrate an existing consumer by simply changing a version range. Inventory old imports and custom tags, adopt the new theme JSON and label contract, and verify behavior and accessibility in that application. Components live in consumer-facing categories: `action`, `text`, `form`, `layout`, `navigation`, `overlay`, `feedback`, `data-display`, `media`, `charts`, `styling`, `editor`, `collaboration`, `icons`, and `theme`. Initialize an entire category (`@beforesemicolon/cube/form`) and use the returned classes and headless bases. Former visual-only tags such as autocomplete, dimension, aspect-ratio, z-index, preview-switch and theme-switch are compositions or modes of retained primitives. A stable-version release review is still required before publication.

Browser consumers load the standalone WebComponent runtime first. Chart consumers additionally provide ECharts or a configured asynchronous engine loader. Neither engine is embedded into Cube's classic browser bundles. Pin published versions when a release is approved.

## Category initialization and rendering

Load WebComponent once, followed by `cube/dist/client.js` or category scripts such as `cube/dist/action-client.js` and `cube/dist/form-client.js`. The former per-component `dist/<category>/<component>/client.js` paths are removed.

Module entrypoints expose category initializers: `import initializeForm from '@beforesemicolon/cube/form'; await initializeForm(runtime)`. Pass the same `@beforesemicolon/web-component` runtime to every initializer, or initialize the complete catalog with the package's default export. `loadCategory` replaces the individual `loadComponent` helper.

Components no longer self-register or import sibling registration modules. Applications load every category used by their compositions. Render bodies return Markup `HtmlTemplate` instances through the injected `html` function; the local `core/editor-dom` and `core/dom` builders are removed.

Component-owned markup binds props and state directly with lazy template expressions, `when`, and keyed `repeat`. Internal presentation state uses reactive signals rather than rebuilding or manually synchronizing child DOM. Imperative effects are reserved for native interoperability such as focus, selection, pointer capture, popup positioning, media playback, and the chart engine. Regression tests verify reactive updates independently of synchronization hooks and reject imperative DOM builders in component renderers.

Pass reactive getters directly: `${this.props.label}` for props, `${this.accessibleName}` for a bound derived arrow function, and `repeat(this.visibleDates, ...)` for a derived collection. Do not add `() => getter()` wrappers or eagerly invoke getters in template interpolations. Use a callback only when the binding actually computes a value or forwards event/item arguments.
