---
name: beforesemicolon-cube
description: Build and check interfaces with @beforesemicolon/cube. Use this skill to select controls, compose layouts and forms, wire accessible actions, and load Cube in npm or plain HTML projects.
---

# Build with Cube

## Select and verify the API

1. Read the installed Cube version from package metadata or the lockfile. In plain HTML, read the version from the actual script URLs. If the version is unknown, say so. Do not assume it is latest.
2. Open that release's `ai/index.json` and follow the relevant record path relative to the index. Without a local package, use `https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@VERSION/ai/index.json`. For an older release with no index, use that release's tagged source or docs.
3. Read the example, public properties, attributes, events, slots, parts, and dependency list. Do not read the full catalog when one or two records are sufficient. Use `custom-elements.json` for tools that consume a Custom Elements Manifest and `ai/tokens.json` for theme tokens.
4. Keep the existing project setup. When the shared checker is installed, run `bfs-ai check <file-or-project>`. Fix definite errors, review advisory findings, then verify the actual interaction in a browser.

Choose a Cube control when it already meets the request. For example, use `cube/cb-button` for an icon-only action and `cube/cb-audio-player` for a ready-made audio player. If the intent is to teach playback state with Markup, choose a native `<audio>` element and build the controls instead.

## npm: icon action and toggle

For a browser application with a bundler, install `npm install @beforesemicolon/cube@1.2.0`. Use these candidate versions after publication.

```js
import '@beforesemicolon/cube/icons/icon'
import '@beforesemicolon/cube/action/button'

document.body.insertAdjacentHTML('beforeend', `
  <cb-button id="remove" icon="close" icon-only
    accessible-label="Remove item"></cb-button>
  <cb-button id="pin" icon="pin" icon-only
    accessible-label="Pin item" pressed="false"></cb-button>
  <output id="status"></output>
`)
const status = document.querySelector('#status')
document.querySelector('#remove').addEventListener('action', () => {
  status.textContent = 'Removed item'
})
document.querySelector('#pin').addEventListener('change', (event) => {
  status.textContent = event.detail.pressed ? 'Pinned item' : 'Unpinned item'
})
```

- An individual public import registers its concrete tag. A `/base` import does not. Import the icon before a button that needs a rendered glyph. Keep only the imports needed by the feature.
- Use `action` alone for a normal button. Do not handle both its `click` and `action` for the same operation. Use the documented cancellable `beforeaction` event to veto an action.
- Omit `pressed` for a normal button. Set it for an on/off toggle, then listen for `change` and read `event.detail.pressed`. Set an accessible name with `accessible-label` for icon-only controls. Use visible labels where possible.
- Test with Tab and Enter or Space. Verify the focused button's name, that a normal action fires once, and that toggling changes the pressed state without firing the normal action.

## Classic HTML: audio player

Save this as an HTML file and serve it through HTTP. Use `tone.wav` next to the page. A fixture ships at `ai/assets/tone.wav` in the Cube tarball. The pinned script URLs work after the exact releases are published.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Cube audio example</title>
  <script defer src="https://cdn.jsdelivr.net/npm/@beforesemicolon/web-component@1.22.0/dist/client.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.0/dist/icons-client.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.0/dist/action-client.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.0/dist/form-client.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.0/dist/media-client.js"></script>
</head>
<body>
  <cb-audio-player src="./tone.wav" media-title="Tone sample"
    play-label="Play sample" pause-label="Pause sample" stop-label="Stop sample"
    seek-label="Seek" volume-label="Volume" mute-label="Mute" unmute-label="Unmute">
  </cb-audio-player>
</body>
</html>
```

Cube needs the existing `BFS.WebComponent`, `BFS.MARKUP`, and `BFS.css`. Do not load a second Markup runtime. Each category registers its own elements; the media category alone does not register the button, sliders, or select used by the player. Keep deferred scripts in dependency order. Do not use `async` for interdependent scripts.

For the same audio example in npm, load these imports before rendering the same markup:

```js
import '@beforesemicolon/cube/icons/icon'
import '@beforesemicolon/cube/action/button'
import '@beforesemicolon/cube/form/slider'
import '@beforesemicolon/cube/form/select'
import '@beforesemicolon/cube/media/audio-player'
```

Verify the local fixture loads, that there is a button named “Play sample,” and that activating it changes the transport control to “Pause sample.”

## Composition and theming

Start with the public control that owns the interaction. Use this pattern for a visible label and supporting text around a Cube field:

```html
<cb-theme-provider appearance="system">
  <cb-card padding="16px">
    <cb-field label="Project name" description="Shown in your workspace.">
      <cb-text-input name="project" value="Studio"></cb-text-input>
    </cb-field>
  </cb-card>
</cb-theme-provider>
```

Load the corresponding `theme/theme-provider`, `data-display/card`, `form/field`, and `form/text-input` npm entries, or the record's ordered browser categories. A card has one default slot. Compose its children; do not invent card header or footer attributes. Give layout and wrapper elements valid children rather than moving form behavior to a clickable wrapper. For a workspace, use its documented `header`, `start`, `end`, and `bottom` slots and the default main area.

Use the theme provider's documented `appearance` and theme settings. Scope CSS custom properties and published `::part()` hooks to the app or component instance, for example:

```css
.project-form {
  --component-field-padding-inline: 18px;
  --component-field-padding-block: 8px;
}
```

Read the installed record before choosing a property or part. Use the component's public properties for arrays, functions, and objects unless the record documents a serialized attribute. Do not change shadow DOM structure, rely on private selectors, or replace native semantics to restyle the UI.

## Troubleshooting and examples

- **An element does not upgrade:** Check its exact public import or script. In the browser, inspect `customElements.get('cb-button')`. Visible markup alone does not prove registration.
- **The action has a label but no icon:** Check that `cb-icon` registered and that the icon name exists. For an audio player, check each required category or import.
- **The checker reports an unexpected name or slot:** Compare the installed version's record with the code. Check actual JS properties separately from HTML attributes. Use the browser to verify behavior the checker cannot see.
- **Themes look wrong:** Compare both light and dark mode. Confirm the token is in scope; verify text and controls have sufficient contrast. Keep modal-local feedback within the modal rather than relying on z-index to cross a native top layer.

Start with the records `cube/cb-button`, `cube/cb-audio-player`, `cube/cb-field`, `cube/cb-workspace`, and `cube/cb-theme-provider`. Each links to its docs and interactive Playground example. Use the exact name, API, and setup from the record; do not treat the live Playground as the API reference for older pinned releases.
