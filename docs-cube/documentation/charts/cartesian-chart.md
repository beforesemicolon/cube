---
name: "Cartesian Chart"
title: "Cartesian Chart"
description: "Plot series against horizontal and vertical axes. The same component supports line, bar, area, scatter, and other Cartesian series."
order: 921
layout: document
---

# Cartesian Chart

Plot series against horizontal and vertical axes. The same component supports line, bar, area, scatter, and other Cartesian series.

`<cb-cartesian-chart>` · `@beforesemicolon/cube/charts/cartesian-chart`

:::component
<cb-cartesian-chart accessible-label="Weekly visits" navigate-label="Explore chart" height="240"
    x-axis='{"type":"category","categories":["Mon","Tue","Wed","Thu","Fri"]}'
    series='[{"id":"visits","name":"Visits","type":"line","data":[12,20,17,24,31]}]'>
</cb-cartesian-chart>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/charts--line)

{{t.cube.chartApi}}

{{t.cube.commonCharts}}

## {{t.cube.access}}

{{t.cube.accessBody}}

{{t.cube.parts}}
