# Media and charts — implementation and review contract

## Source of truth

Use the user-uploaded references in `design/figma-layers/Studio`, especially `01/Actions.png`, `02/Inputs.png`, and `03/Color & style.png`. Live Figma access is not required. The exported sheets cover the original editor families; dedicated media/chart sheets are not present in this upload. Do not claim a pixel-for-pixel media/chart sign-off based only on these files.

Storybook exposes the uploaded sheets under **Design references**, the working primitives under **Shared controls**, and runtime compositions under **Media**, **Charts**, and **Examples**. Runtime screenshots are generated from the actual components in browser tests, not substituted static mockups.

## Eight required chart options, two public components

| Story | Tag | Configuration |
| --- | --- | --- |
| Bar | `cb-cartesian-chart` | `series[].type = 'bar'` |
| Line | `cb-cartesian-chart` | `series[].type = 'line'` |
| Mixed line and bar | `cb-cartesian-chart` | Different `type` values within the same series array |
| Area | `cb-cartesian-chart` | `series[].type = 'area'` |
| Bubble | `cb-cartesian-chart` | `series[].type = 'bubble'`, data includes `x`, `y`, `size` |
| Scatter | `cb-cartesian-chart` | `series[].type = 'scatter'`, data includes `x`, `y` |
| Pie | `cb-pie-chart` | `variant = 'pie'` |
| Donut | `cb-pie-chart` | `variant = 'donut'`, optional center title and description |

`inverted = true` also supports horizontal bars. Both chart classes use the same `ChartBase`, `ChartView`, theme adapter and lazy Apache ECharts engine. There are no separate plotting implementations for each story. A machine-checked fixture feeds both the stories and tests so that examples cannot silently drift from the documented contract.

Cloudscape's public Cartesian and pie interfaces are functional references, not copied React components or a promise of drop-in API compatibility. Cube remains web-component-based and uses Apache ECharts. No Highcharts dependency is added.

## Composition rules

- Audio/video transport buttons use `cb-icon-button`.
- Seek and volume controls use the same `cb-slider` available independently in the library.
- Playback speed and captions use the same `cb-select` available independently.
- Chart legend filtering and keyboard exploration use `cb-toggle-button`.
- Chart retry, show-all and unpin actions use `cb-button`; zoom uses `cb-icon-button`.
- Native audio/video nodes retain playback state. ECharts remains responsible for plotting geometry; do not implement a second chart renderer.
- Keep the semantic native data table until the library's table component is implemented. Do not invent a placeholder `cb-table` solely to claim composition.
- Composite components translate child events to their domain API and forward styling with `exportparts`. Shared changes to focus, disabled behavior, labels, icons and tokens must update composites automatically.

## Visual behavior

Shared tokens define neutral surfaces, 6px control and 10px panel corners, 28px compact controls, 12px UI text and 16px outline icons. Themes provide light/dark values and native `color-scheme`; media rate/caption popups inherit that appearance. Player controls wrap on narrow containers. Chart engines receive the same text/series colors and 160ms motion token; reduced motion disables animation. Solid fills are the default; optional patterns supplement color when requested. All series remain legible before interaction; emphasis and keyboard instructions appear only when relevant. Editor appearance must not change the contents of a video poster or source media.

## Validation gates

- Pure tests validate all eight model configurations, shared input normalization, theme colors and motion policy.
- Actual-browser tests exercise every chart type in light and dark with ECharts SVG output, shared legend controls, keyboard navigation, data tables, axe checks and narrow-container screenshots.
- Built Storybook is launched in the test run. Each required chart's `play` function must finish successfully; a catalog entry alone is insufficient.
- Audio and video stories include playable, original offline fixtures, not just empty media panels. The checked-in original four-second WebM has a finite seekable duration. No camera, microphone, external media service or MediaRecorder permission is required.
- Per-component/category CDN output keeps WebComponent and ECharts external. SSR-safe root imports and all package export targets are checked.

A configured test is not a passing result. Record the actual workflow outcome on PR #62. The full editor component inventory is still being implemented; this contract does not claim the other families are finished.
