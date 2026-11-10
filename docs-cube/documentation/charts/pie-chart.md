---
name: "Pie Chart"
title: "Pie Chart"
description: "Show each part\u2019s share of a total. Set `variant=\"donut\"` for a ring and supply labeled values in `series.data`."
order: 922
layout: document
---

# Pie Chart

Show each part’s share of a total. Set `variant="donut"` for a ring and supply labeled values in `series.data`.

`<cb-pie-chart>` · `@beforesemicolon/cube/charts/pie-chart`

:::component
<cb-pie-chart accessible-label="Traffic sources" variant="donut" height="240"
    series='{"data":[{"id":"direct","name":"Direct","value":48},{"id":"search","name":"Search","value":32},{"id":"referral","name":"Referral","value":20}]}'>
</cb-pie-chart>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/charts--pie)

{{t.cube.pieApi}}

{{t.cube.commonCharts}}

## {{t.cube.access}}

{{t.cube.accessBody}}

{{t.cube.parts}}
