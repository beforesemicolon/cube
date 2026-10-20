---
name: '{{t.cube.categoryFeedback}}'
title: '{{t.cube.categoryFeedback}}'
path: /documentation/feedback
layout: document
order: 26
---

# {{t.cube.categoryFeedback}}

{{t.cube.studioCatalogBody}}

Storybook's Feedback category contains one prop-driven story per component.
Alternate states and compositions are demonstrated in Examples → Feedback /
Variants and Examples → Feedback / Async states.

:::cube studio-feedback
:::

| Component | Custom element | Category entry |
| --- | --- | --- |
| Status | `<cb-status>` | `@beforesemicolon/cube/feedback` |
| Empty state | `<cb-empty-state>` | `@beforesemicolon/cube/feedback` |
| Skeleton | `<cb-skeleton>` | `@beforesemicolon/cube/feedback` |
| Progress | `<cb-progress>` | `@beforesemicolon/cube/feedback` |
| Spinner | `<cb-spinner>` | `@beforesemicolon/cube/feedback` |
| Toast | `<cb-toast>` | `@beforesemicolon/cube/feedback` |
| Alert | `<cb-alert>` | `@beforesemicolon/cube/feedback` |
| Banner | `<cb-banner>` | `@beforesemicolon/cube/feedback` |
| Flashbar | `<cb-flashbar>` | `@beforesemicolon/cube/feedback` |

{{t.cube.flashbarServiceBody}}

## API

### Empty state

One centered component handles blank, filtered, and error content. Set `icon`
and `heading`; optional `description` is rendered by the internal `cb-heading`.
The default slot is entirely consumer-owned body content and optional actions.
An empty `icon` hides the tile. It does not expose message `value`, `status`,
or `tone` props.

```html
<cb-empty-state icon="plus" heading="Create your first page">
  <p>Start from scratch or choose a template.</p>
  <cb-button variant="primary">Create page</cb-button>
</cb-empty-state>
```

When loading categories individually, also register `text`, `layout`, and
`icons` (and `action` if providing buttons). The complete Cube client includes
these categories.

{{t.cube.studioCatalogApi}}
