# Media and chart implementation / visual reference contract

## Four new families

`AudioPlayer` / `cb-audio-player`, `VideoPlayer` / `cb-video-player`, `CartesianChart` / `cb-cartesian-chart`, and `PieChart` / `cb-pie-chart` extend the original 237-entry inventory to 241. Pie and donut are variants of one component, not two separate implementations.

**Figma status: blocked, not imported.** The connected Starter account refused the read/write attempt because its tool quota was exhausted. Target file: https://www.figma.com/design/VlYmoSr1h9l4W2efP6JwoX . Preserve this blocker until native references are actually added and reviewed.

## Cloudscape functional analysis

Inspected on 2026-10-17: the public component guidance and the `cloudscape-design/chart-components` Cartesian, pie and shared-core TypeScript interfaces. The current package wraps Highcharts; Cube uses Apache ECharts under an independent adapter. This is not a drop-in Cloudscape API or a pixel-for-pixel clone.

| Capability | This increment |
| --- | --- |
| Mixed line/spline/area/bar/column series | Implemented by `cartesianModel` |
| Scatter and bubble size | Implemented; bubble size is bounded square-root mapping |
| Category/time/linear/log axes, titles/bounds/formatters | Implemented; invalid numeric/log data reported |
| Two value axes and inverted orientation | Implemented |
| Ordinary stacked columns/bars/areas | Implemented; percentage stacking is not included |
| X/Y thresholds and linked error ranges | Implemented as markLine/custom primitives |
| Controlled/uncontrolled legend filtering | Implemented with stable IDs and proposed-change events |
| Hover, click selection and pinnable details | Implemented as a DOM details region, not Cloudscape React tooltip slots |
| Zoom/reset and responsive resize | Implemented; browser/engine tests still required before release |
| Pie/donut, visible-segment percentages, center text | Implemented; zero/negative/nonfinite data never creates fake sectors |
| Loading, empty, no-match, error and retry | Implemented; application-controlled error state remains application-owned |
| Keyboard navigation and accessible data table | Implemented DOM controls; automated/manual conformance is not assumed |
| Rich React tooltip/render slots, zones, arbitrary Highcharts options | Not exposed |
| Server-side chart image rendering | Not implemented |
| Maps, network graphs, Sankey, radar and all possible chart types | Outside these two component contracts |

Source interfaces:
https://github.com/cloudscape-design/chart-components/blob/main/src/cartesian-chart/interfaces.ts
https://github.com/cloudscape-design/chart-components/blob/main/src/pie-chart/interfaces.ts
https://github.com/cloudscape-design/chart-components/blob/main/src/core/interfaces.ts

## Figma sheets to add after the quota clears

Each family needs light/dark appearances, 320px narrow and 640px comfortable examples, anatomy and part labels, state diagrams, keyboard instructions and error/empty behavior. Match the existing neutral Cube palette and 6px controls; charts use the six shared series tokens rather than Cloudscape's branded colors.

- Audio: empty, ready, playing, paused, ended, buffering, disabled seek, live and error. A quiet wrapping transport row with play/pause, stop, ±seek, time, volume, mute and speed. Preserve 36px control height and visible focus; touch layouts may enlarge targets.
- Video: the same transport states plus poster, captions, focused controls and fullscreen. Caption/track source and transcript are content responsibilities. Do not put controls over unreadable moving imagery without a stable surface.
- Cartesian: line, mixed bar/line, stacked area/columns, horizontal bars, scatter/bubble, error ranges, thresholds, selection/pinned details, zoomed, loading, empty, no-match and error. Keep series names and patterns/shapes as well as color.
- Pie: pie, donut with center text, focused/selected segment, filtering, narrow layout, loading, all-zero/empty and invalid data. The denominator is visible valid values and must be explained in documentation.

Storybook includes representative states for all four. The browser visual test creates `test-results/media-charts-light.png` and `...-dark.png` using actual component renderers when it runs successfully. These screenshots are runtime review artifacts, not claims that native editable Figma components exist.

## Verification

Pure controller/model/theme tests run without browser or chart-engine stubs. Actual component, CDN, accessibility and screenshot tests require the installed dependencies and Playwright browser. Build/Storybook/docs output must be checked in CI. Test configuration is not evidence of a passing test; record actual run results in the PR.
