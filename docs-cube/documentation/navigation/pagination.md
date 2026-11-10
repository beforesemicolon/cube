---
name: "Pagination"
title: "Pagination"
description: "Navigate a numbered set of pages. Set `page` and `total-pages`; the `change` event exposes the selected page."
order: 424
layout: document
---

# Pagination

Navigate a numbered set of pages. Set `page` and `total-pages`; the `change` event exposes the selected page.

`<cb-pagination>` · `@beforesemicolon/cube/navigation/pagination`

:::component
<cb-pagination label="Results pages" page="2" total-pages="8"
    previous-label="Previous page" next-label="Next page" page-label="Page {page}">
</cb-pagination>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/navigation--pagination)
