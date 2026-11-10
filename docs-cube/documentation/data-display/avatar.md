---
name: "Avatar"
title: "Avatar"
description: "Identify a person or team with an image or initials. Supply the person\u2019s name as the accessible label."
order: 722
layout: document
---

# Avatar

Identify a person or team with an image or initials. Supply the person’s name as the accessible label.

`<cb-avatar>` · `@beforesemicolon/cube/data-display/avatar`

:::component
<cb-avatar initials="MC" accessible-label="Maya Chen"></cb-avatar>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/data-display--avatar)

## Fallbacks and sizing

`cb-avatar` derives stable fallback initials and a stable theme-token color
from `name`. An explicit `color` still wins. Its `tiny` and `xl` sizes are 20px
and 64px respectively, and every size remains overridable through
`--component-avatar-size-*` tokens.
