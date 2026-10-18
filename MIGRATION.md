# Migrating from Cube 0.2

This branch is a breaking alpha, not an in-place release of the old framework.

Old templating, router, store and internationalization entrypoints are not exported by the new package. Use the maintained Before Semicolon packages (`markup`, `router`, `intl` and `web-component`) for the features moved out of Cube. Legacy `src/`, `docs/` and old build scripts are retained for comparison and excluded from the new package/build. This branch uses `components/` as its build source; destructive legacy cleanup is deferred to the broader migration review.

New concrete imports register `cb-*` custom elements. Class names have no `Cb`/`Cube` prefix. `cube-ui` supplied the category-folder and Storybook reference, but its old render-in-base design and hardcoded button labels are not copied.

Do not migrate an existing consumer by simply changing a version range. Inventory old imports and custom tags, adopt the new theme JSON and label contract, and verify behavior and accessibility in that application. Components now live in consumer-facing categories: `action`, `form`, `layout`, `navigation`, `overlay`, `feedback`, `data-display`, `media`, `charts`, `styling`, `editor`, `collaboration`, `icons`, and `theme`. Import an entire category (`@beforesemicolon/cube/form`) or one self-registering component (`@beforesemicolon/cube/form/text-input`); append `/base` for its non-registering headless base. Former visual-only tags such as autocomplete, dimension, aspect-ratio, z-index, preview-switch and theme-switch are compositions or modes of the retained primitives and no longer have public entrypoints. A stable-version release review is still required before publication.

Browser consumers load the standalone WebComponent runtime first. Chart consumers additionally provide ECharts or a configured asynchronous engine loader. Neither engine is embedded into Cube's classic browser bundles. Pin published versions when a release is approved.
