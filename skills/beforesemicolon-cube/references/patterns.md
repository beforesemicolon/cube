# Choose and compose Cube controls

[Find a component](catalog/index.md) · [All categories](index.md) · [Set up Cube](setup.md) · [Recipes](recipes.md)

This guide compares similar controls, then shows how to replace an
application workaround with a supported component pattern. Each linked
component page supplies the exact version's API and npm/classic examples.

## Start from the job, not the screenshot

Use a native element when it already handles the job: `button` for a command,
`a` for a link, `label` and `input` for a simple field, `ul` for static items,
and `table` for static tabular data. Prefer Cube when its existing control
adds the required interaction, shared theme, known keyboard behavior, or
composition. Keep CSS flex and grid for simple native layouts.

Do not insert Cube into code that teaches the internals of an interaction.
For example, select the Cube Audio Player for a working transport UI. To
teach how playback affects state and rendering, bind a native `audio`
element to Markup. Do not add Cube just to simulate a native primitive.

A fast decision path:

1. Identify the thing the user will do and what changes afterward.
2. Compare two closely related rows in the [intent catalog](catalog/index.md).
3. Open the component page and read its setup and example before other sections.
4. Confirm the input, event, and accessible output. If the user expects a
   controlled update, check which value lives in the app and which lives in Cube.
5. Follow the exact import paths or ordered browser scripts. Verify the result
   by mouse and keyboard. Keep application state, I/O, and error handling outside
   of component rendering.

## Actions, links, and commands

| User job | Component | Boundary |
| --- | --- | --- |
| Apply a command | [Button](components/action/button.md) | Ordinary interaction emits `action`. Persistent toggles use `pressed` and `change`. |
| Go to an address | [Link](components/navigation/link.md) | Preserve a real destination and anchor semantics; do not replace it with a command that manually changes the URL. |
| Offer one primary and several secondary commands | [Split Button](components/action/split-button.md) | Do not give several equally important choices that one command's overflow menu. |
| Offer related actions on the same row | [Button Group](components/action/button-group.md) or [Action Bar](components/layout/action-bar.md) | Use Action Bar when leading context and trailing actions need separate regions. |
| Switch peer sections of the same view | [Tabs](components/navigation/tabs.md) | Tabs display panels; they are not an application's URL router. |

**Before:** an unnamed icon inside a generic clickable box. Keyboard behavior
must be recreated manually, and a user cannot tell what the icon does.

```html
<div class="close-icon" onclick="removeCurrentItem()"></div>
```

**After:** use the component's button semantics and one action listener.

```html
<cb-button id="remove-item" icon="close" icon-only
  accessible-label="Remove item"></cb-button>
<output id="remove-status"></output>
```

```js
import '@beforesemicolon/cube/icons/icon'
import '@beforesemicolon/cube/action/button'

const button = document.querySelector('#remove-item')
button.addEventListener('action', () => {
  document.querySelector('#remove-status').textContent = 'Removed item'
})
```

Keep the listener tied to the form or item that it acts on. For a destructive
action that needs confirmation, intercept the documented cancellable request
or follow the modal pattern below. Do not handle both `click` and `action`
for one mutation. A toggle does not use this handler: it listens for `change`
and reads `event.detail.pressed`. Test that Enter or Space triggers one
operation and that an ordinary action has no pressed state.

## Form values, labels, and submission

| Need | Component |
| --- | --- |
| A label, supporting text and validation presentation for a compatible control | [Field](components/form/field.md) |
| A single text value with app styling | [Text Input](components/form/text-input.md) |
| A short, always-visible set of exclusive options | [Radio Group](components/form/radio-group.md) |
| A longer or optional list of values | [Select](components/form/select.md). Use its documented native mode when native UI works better. |
| A list of commands, with no submitted value | [Dropdown](components/overlay/dropdown.md), not Select |
| Choose files from the device | [File Picker](components/form/file-picker.md). To browse app-owned records, use [File Browser](components/data-display/file-browser.md). |

**Before:** a placeholder is the only label, then disappears when the user types.

```html
<input name="project" placeholder="Project name">
```

**After:** preserve a visible label, name the actual form control, and let the
form handle submission. Load the documented component entries and their
companions before using this markup.

```html
<form id="project-form">
  <cb-field label="Project name" description="Shown in your workspace." required="true">
    <cb-text-input name="project" value="Studio"></cb-text-input>
  </cb-field>
  <button type="submit">Save project</button>
  <output id="project-status"></output>
</form>
```

```js
import '@beforesemicolon/cube/form/field'
import '@beforesemicolon/cube/form/text-input'

document.querySelector('#project-form').addEventListener('submit', (event) => {
  event.preventDefault()
  const data = new FormData(event.currentTarget)
  document.querySelector('#project-status').textContent =
    'Project: ' + data.get('project')
})
```

Use the form control's real value and validation rules. Keep the visible
label outside placeholder content. Read the concrete type before using
optional inheritance features, e.g. a compatible form field's `name` and
`required` do not imply every Cube component participates in the form.
When using Field, set `required="true"` on the wrapper. The wrapper
propagates its validation presentation to the wrapped control. Set `name` on
the control itself, so the form can read its value.
Check the submitted value and required/empty behavior, not just what appears
in the field.

## Lists, tables, trees, and file browsers

| Data shape | Component | Keep in the app |
| --- | --- | --- |
| Flat cards or variable-length rows | [List](components/data-display/list.md) | Items and the renderer, page fetching, filters, and the domain action |
| Rows with reusable column definitions | [Table](components/data-display/table.md) | Columns, row data, app selection/navigation, and grouped cell rendering |
| Arbitrary hierarchical nodes | [Tree](components/data-display/tree.md) | Parent/child data and whatever a node action means |
| Asset and folder records | [File Browser](components/data-display/file-browser.md) | Data, path and selection state, file operations and upload results |

**Before:** CSS creates a scrolling collection, but the code assumes
Cube provides a general-purpose card layout with built-in item fields.

```html
<cb-list><cb-card heading="Home" footer="Published"></cb-card></cb-list>
```

**After:** Card's single default slot is yours. Supply headings and actions
as children. For dynamic lists use the list's public properties.

```html
<cb-list id="pages" accessible-label="Project pages" gap="8px"></cb-list>
```

```js
import '@beforesemicolon/cube/data-display/card'
import '@beforesemicolon/cube/data-display/list'

const list = document.querySelector('#pages')
list.renderItem = (page) => {
  const card = document.createElement('cb-card')
  card.setAttribute('padding', '8px')
  const heading = document.createElement('h3')
  heading.textContent = page.title
  card.append(heading)
  return card
}
list.items = [{ title: 'Home' }, { title: 'Support' }]
```

If each item needs multiple comparable fields, use Table and typed
`columns` rather than rebuilding row semantics out of layout containers.
Assign structured lists, callbacks, and options through documented
properties. Do not stringify a callback into HTML. Where an attribute accepts
serialized data, use that variant only for a static fixture or a simple page.

## Overlays, focus, and feedback

| Need | Component |
| --- | --- |
| A short hint for a control with an existing name | [Tooltip](components/overlay/tooltip.md) |
| Anchored supplemental content that does not need a modal workflow | [Popover](components/overlay/popover.md) |
| A focused workflow users must close or complete | [Modal](components/overlay/modal.md) |
| An explicit confirmation for a consequential action | [Alert Dialog](components/overlay/alert-dialog.md) |
| Feedback local to a section or overlay | [Alert](components/feedback/alert.md) |
| Progress or outcome across the current app view | [Flashbar](components/feedback/flashbar.md) |

**Before:** a positioned container looks like a dialog, but background
interaction and focus remain active.

```html
<div class="overlay">Project settings</div>
```

**After:** use a real modal and its documented `show()` API.

```html
<cb-button id="open-settings" label="Open project settings"></cb-button>
<cb-modal id="settings" heading="Project settings"
  dismissible="true" close-label="Close settings">
  <p>Choose project settings before publishing.</p>
</cb-modal>
```

```js
import '@beforesemicolon/cube/icons/icon'
import '@beforesemicolon/cube/action/button'
import '@beforesemicolon/cube/navigation/link'
import '@beforesemicolon/cube/overlay/modal'

document.querySelector('#open-settings').addEventListener('action', () => {
  document.querySelector('#settings').show()
})
```

Name the dialog and its dismiss control. Verify focus enters it, Escape
closes it when enabled, and focus returns to the opener. Do not use a tooltip
to reveal the only way to understand or operate a control. For hints that
must contain structured content, use Popover and its `trigger` slot; put
content in its default slot. For errors while a dialog is still open, use an
inline Alert inside it, not a global Flashbar behind the browser's top layer.

## Layout and styling

Use Row for items that flow side by side, Col for vertical stacks, Grid for
repeated regions, and Box or Card for a surface. Use Workspace when the
shell needs named optional panels and resize behavior. Do not replace
semantic headings, lists, or forms with layout components only.

**Before:** hard-coded margins and wrappers duplicate layout at every layer.

```html
<div class="toolbar"><div class="toolbar-copy">One draft</div><div class="toolbar-save">Save</div></div>
```

**After:** use the slots supplied by [Action Bar](components/layout/action-bar.md).
Use the leading slot for status or context and the default slot for actions.

```html
<cb-action-bar accessible-label="Project actions">
  <span slot="start">One draft</span>
  <cb-button label="Save" variant="primary"></cb-button>
</cb-action-bar>
```

Use [Theme Provider](components/theme/theme-provider.md) to scope appearance
to the app, when needed. Prefer documented CSS tokens and public parts to
selectors into shadow DOM. A slot and a part are not interchangeable.
Read the [theme guide](theming.md) and check both appearances. CSS parts and
slots can be variant-specific, so verify a styling hook in the actual
control rather than assuming every subclass has the same shadow structure.

## Map the same feature to npm or classic scripts

For npm, read the component's import snippet plus companions. The public
component entry registers it in a browser. The `/base` entry exposes shared
behavior for authors but does not register the concrete element. Do not
instantiate a browser component in a Node-only process. Use a real browser
test for focus, composition, and event behavior.

For classic scripts, start with the matching WebComponent runtime, then the
Cube categories in the order listed for the example. Add companion categories
when one element renders another. For the icon button above, load WebComponent,
then Icons, then Action. For Audio Player, also load Form and Media. Use
deferred scripts in order or normal ordered scripts; do not use `async` for
interdependent scripts. The WebComponent script already contains the matching
Markup runtime, so do not load Markup again solely for Cube.

Verify registration with `customElements.get(tag)`, then test the actual
interaction. A correctly registered outer element does not guarantee it has
every needed nested component. Check an icon is visible, a form reports its
real value, a list shows updated item data, and a modal preserves focus.

## Never infer an API from a related element

Read the concrete record for its **observed attribute**, **public property**,
**methods**, **slots**, **events** and **CSS parts**. Inherited properties can be
listed without identical behavior, and protected lifecycle methods are not
consumer APIs. For example, use Button's `pressed` for a toggle, not Link's
navigation behavior. Use Tab's documented item ID as a panel slot name rather
than assuming all components with a slot define it in static markup.

The browser checker catches recognized mistakes but cannot infer every
dynamic attribute, property, or application renderer. Treat an unrecognized
name as a reason to inspect the exact component reference and test the
behavior, not a reason to access internals.
