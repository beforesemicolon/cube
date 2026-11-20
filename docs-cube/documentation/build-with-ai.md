---
name: Build with AI
title: Build with AI
description: Find the exact Cube component API for your installed version.
layout: document
order: 4
---

# Build with AI

Start with your version of Cube. Read the version from your lockfile or the
URL of your browser script. Open the matching index and one component record.

- **Installed package:** `node_modules/@beforesemicolon/cube/ai/index.json`
- **Web:** [Cube 1.2.0 index](https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.0/ai/index.json) after npm publication.
- **Component tooling:** `@beforesemicolon/cube/custom-elements.json`

An older release may not have a versioned reference. Read that release's
[GitHub source](https://github.com/beforesemicolon/cube/releases) instead. Do
not mix the latest reference with an older package.

Use an existing Cube control if it already meets the request. Choose just
the import or browser category you need. For example, the button record
shows a named icon-only action and distinguishes it from a pressed toggle.

```js
import '@beforesemicolon/cube/icons/icon'
import '@beforesemicolon/cube/action/button'
document.body.innerHTML = '<cb-button icon="close" icon-only accessible-label="Remove item"></cb-button>'
document.querySelector('cb-button').addEventListener('action', () => console.log('Remove item'))
```

In a classic HTML page, load the WebComponent runtime first. No separate
Markup script or build is needed. These versioned URLs become usable after
both candidates are published.

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8">
  <title>Remove action</title>
  <script src="https://cdn.jsdelivr.net/npm/@beforesemicolon/web-component@1.22.0/dist/client.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.0/dist/icons-client.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.0/dist/action-client.js"></script>
  <cb-button id="remove" icon="close" icon-only accessible-label="Remove item"></cb-button>
  <output id="status"></output>
  <script>
    document.querySelector('#remove').addEventListener('action', () => {
      document.querySelector('#status').textContent = 'Removed'
    })
  </script>
</html>
```

Verify the button has the accessible name “Remove item,” can receive
keyboard focus, and fires one action when you press Enter.
