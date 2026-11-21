---
name: beforesemicolon-cube
description: Build and check interfaces with @beforesemicolon/cube. Use this skill to select controls, compose layouts and forms, wire accessible actions, and load Cube in npm or plain HTML projects.
---

# Build with Cube

## Find the right component

1. Identify the job first. Is this an action, navigation, input, collection,
   overlay, feedback message, layout, or visualization? Is the user asking
   for a ready-made control or asking to learn how to build one?
2. Start at the [intent and component catalog](references/catalog/index.md).
   Open the matching category and compare the closest controls by purpose.
   Then open the specific component page. Do not guess component names from
   other libraries. A simple native button, link, input, table, or layout can
   be the correct choice if it already satisfies the requirement.
3. Read the installed Cube version from package metadata or the lockfile. In
   plain HTML, read the actual script URLs. Match the offline guide's version
   to that consumer. If a version is unknown, say so. If an older release has
   no release-specific reference, use its tagged source or documentation.
4. Read the component's markup example, installation, properties, events,
   slots, and CSS hooks. Choose the smallest working imports or ordered
   browser bundles. Use the existing setup; do not introduce a bundler into a
   page that works with classic scripts.
5. Implement the behavior with public properties and events. Run
   `bfs-ai check <file-or-project>` when the checker is installed. Fix
   verifiable errors, review advisory findings, and test the interaction in a
   real browser before declaring it fixed.

### Common choices

| What the interface needs | Start with | Prefer something else when |
| --- | --- | --- |
| Run a command or submit a form | [Button](references/components/action/button.md) | Use a link for navigation. Use a native button when you need no Cube conventions. |
| Navigate to another page | [Link](references/components/navigation/link.md) or [Menu](references/components/navigation/menu.md) | Use [Tabs](references/components/navigation/tabs.md) for peer panels, not browser routes. |
| Pick a value to submit | [Select](references/components/form/select.md) or [Radio Group](references/components/form/radio-group.md) | Use [Dropdown](references/components/overlay/dropdown.md) for a menu of commands, not a form value. |
| Show a collection | [List](references/components/data-display/list.md) for items or cards; [Table](references/components/data-display/table.md) for columns | Use a native list or table for static content that needs no component interaction. Use [File Browser](references/components/data-display/file-browser.md) for files and folders. |
| Show a hint or supporting content | [Tooltip](references/components/overlay/tooltip.md) for a short hint; [Popover](references/components/overlay/popover.md) for anchored content | Use [Modal](references/components/overlay/modal.md) when a task needs focus and a clear return path. |
| Show the result of an action | [Alert](references/components/feedback/alert.md) in the relevant section; [Flashbar](references/components/feedback/flashbar.md) for app-level progress | Put validation near the field. Put modal-local errors inside the modal. |
| Arrange interface regions | [Row](references/components/layout/row.md), [Col](references/components/layout/col.md), [Grid](references/components/layout/grid.md) | Use CSS flex or grid for simple native layouts. Use [Workspace](references/components/layout/workspace.md) for coordinated, labeled, resizable regions. |
| Play sound or video | [Audio Player](references/components/media/audio-player.md) or [Video Player](references/components/media/video-player.md) | Use native media and custom Markup-controlled UI when teaching how playback state works. |

## Read the public API correctly

- **Attributes** are strings in HTML. Use only attribute names and literals the
  record lists. Use a JavaScript **property** for functions, nodes, arrays or
  objects unless the component documents a serialized attribute.
- **Inherited APIs** still need verification on the concrete element. Some
  subtypes do not support a parent API's behavior. For example, Cube Button
  has an optional `pressed` toggle, but Link is navigation and does not
  observe `pressed`. A universal property such as `label` does not replace a
  component's documented dialog heading or field label contract.
- **Events** name user requests or state changes. Read the exact event name,
  detail and whether it is cancellable. Do not wire both a generic
  `click` and a semantic `action` to the same mutation. Do not use a
  private descendant as an event target.
- **Slots and parts** are different API surfaces. A slot composes light-DOM
  children; a CSS part styles a published shadow hook. A component page can
  describe generated slot names, such as a tab item's ID. Do not invent a
  header slot on Card or assume every variant renders the same parts.
- **Registration** is not the same as styling. A tag that appears in markup
  may not have upgraded. Check `customElements.get('cb-button')` and
  separately verify the accessible control, keyboard path, and icon.

## Browse the complete offline references

The [component index](references/index.md) has every category. Each
component page combines the public guide, API tables and separate npm and
classic example files. Start with [installation](references/setup.md),
[theming and tokens](references/theming.md),
[practical patterns with before-and-after examples](references/patterns.md),
[implementation recipes](references/recipes.md), or the
[entry-point catalog](references/public-exports.md). These guides work offline.

For programmatic lookup, read the matching package's `ai/index.json` and
follow its relative record path. Without the local package, open
`https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@VERSION/ai/index.json`.
Use `custom-elements.json` for tooling that reads Custom Elements Manifests
and `ai/tokens.json` for machine-readable theme values. Load one component page
and example at a time rather than giving an agent the full catalog.

## Companion packages

Use these packages when their capabilities are needed. Match each package's
installed version and read its own skill before using its API.

- `@beforesemicolon/markup` (`beforesemicolon-markup`): reactive templates, state, and helpers for custom behavior.
- `@beforesemicolon/web-component` (`beforesemicolon-web-component`): author, register, and manage custom elements. It supplies Cube's runtime.
- `@beforesemicolon/router` (`beforesemicolon-router`): route views and handle navigation and browser history.
- `@beforesemicolon/intl` (`beforesemicolon-intl`): translations, formatting, and runtime locale changes.

Do not add Router or Intl for an isolated Cube control. In classic pages,
the WebComponent script already supplies its matching Markup runtime as
`BFS.MARKUP`. Do not install or load a separate classic Markup script for Cube.

## npm: icon action and toggle

For a browser application with a bundler, install `npm install @beforesemicolon/cube@1.2.1`. Use these candidate versions after publication.

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
  <script defer src="https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.1/dist/icons-client.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.1/dist/action-client.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.1/dist/form-client.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@1.2.1/dist/media-client.js"></script>
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
