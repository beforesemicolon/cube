# Third-party software and design references

Cube's original implementation is BSD-3-Clause. Dependency licenses and notices remain applicable to their respective code. This is not a legal opinion or a replacement for the dependency license files.

- `@beforesemicolon/web-component`: Before Semicolon's runtime, consumed as a dependency and external classic browser script. Its own package license applies.
- `@beforesemicolon/builder` and `@beforesemicolon/site-builder`: build and documentation tooling, not bundled into the runtime components.
- Apache ECharts: Apache-2.0; official source https://github.com/apache/echarts and documentation https://echarts.apache.org/handbook/en/ . Preserve the distributed LICENSE/NOTICE when copying ECharts into a documentation deployment or redistributing it.
- Storybook, Vite, Playwright and axe: development/test dependencies under their respective package licenses.
- highlight.js: the existing site-builder code-highlighting implementation; its BSD-3-Clause license applies when distributed.

Cloudscape's Cartesian and pie chart APIs and interaction guidance were examined as functional references. No Cloudscape React or Highcharts runtime is included. The current Cloudscape chart package wraps Highcharts and requires appropriate Highcharts licensing; choosing ECharts does not grant rights to Highcharts or its source. Official references:

https://cloudscape.design/components/cartesian-chart/
https://cloudscape.design/components/pie-chart/
https://cloudscape.design/foundation/visual-foundation/data-visualization/charts/
https://github.com/cloudscape-design/chart-components

Web Awesome and Rueca informed the approved visual direction. Cube's layout, controls, media icons and sample vector artwork are independently authored; their branding, website artwork and logos are not copied. The included SVG assets are source graphics, not font files. No icon font is required for this increment.
