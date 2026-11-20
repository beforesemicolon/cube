# Cube implementation recipes

[All components](index.md) · [Setup](setup.md) · [Theming](theming.md)

## Run the shipped examples

Each component page links to a standalone classic HTML page and an npm browser entry. The latter is JavaScript to load as an app entry in a bundler. It does not run under Node alone because the component needs a DOM.

Classic examples use exact pinned script URLs. For a network-free browser run, serve the unpacked packages over HTTP and map those URLs to the corresponding `dist` files or replace them with equivalent local HTTP URLs. Use the same script order and do not load a second Markup runtime. Do not use `file://` to test network-loaded modules or media. For charts, serve the corresponding ECharts build before mounting the chart. For audio and video, keep `examples/assets` with the example directory so the included fixture resolves. Npm examples expect these same media file paths to resolve from the document URL.

## Actions and navigation

Choose [Button](components/action/button.md) for an action and [Link](components/navigation/link.md) for navigation. Do not make an entire layout box a synthetic button. Preserve Tab order and give icon-only controls an accessible name. For a normal button handle `action`. For an on/off control set `pressed` and handle `change` with `detail.pressed`. Call `preventDefault()` on the documented `beforeaction` or `beforechange` event when the application must veto a user request.

## Forms

Compose [Field](components/form/field.md) around a compatible [Text Input](components/form/text-input.md) for a visible label, support text, and validation. Set `name` on the control that participates in form submission. Use a compatible public control for number, date, file, or options rather than swapping between unrelated controls in event handlers. For [Select](components/form/select.md), supply real option values and readable labels; verify keyboard navigation and the submitted value. Bind structured data through the public property unless a record documents a serialized attribute.

## Layout, overlays and feedback

Use [Card](components/data-display/card.md) as a styled default slot; compose its actual heading and actions. Use [Workspace](components/layout/workspace.md) when the interface needs optional regions and resizing. Give each named panel a descriptive label. Keep independent regions accessible when collapsed or on small screens.

Use [Modal](components/overlay/modal.md) and its public lifecycle instead of making a positioning container trap focus. Use [Modal Renderer](components/overlay/modal-renderer.md) for dialogs opened through the modal service. Give the dialog an accessible heading and Close control; after Escape, verify focus returns to the opener. Use inline [Alert](components/feedback/alert.md) in a dialog for modal-local news; don't rely on z-index to put an app flashbar above the native top layer. Mount [Flashbar](components/feedback/flashbar.md) once in the app theme scope.

## Media and charts

Choose the [Audio Player](components/media/audio-player.md) or [Video Player](components/media/video-player.md) for existing transport controls. Use a real local source, check the control has a useful name, and verify the Play/Pause behavior. For a Markup teaching task that specifically requests control implementation, use native media and a custom Markup UI instead.

Choose the [Cartesian Chart](components/charts/cartesian-chart.md) for categorized or ordered series and [Pie Chart](components/charts/pie-chart.md) for proportions. Supply chart data with meaningful series labels. Keep the reader's keyboard path and alternative data representation available. Test one example with actual data and a real ECharts runtime.

## Build and review

- Use the version-matched component page and verify the real installed registration.
- Test mouse and keyboard behavior, disabled states and intended action count.
- Check access names and contrast in light and dark appearance. Check native focus return for overlays.
- Use only documented events, slot names, parts, and theme properties. Avoid application behavior coupled to private descendants.

## Use the public utility APIs

The [utility signatures](utilities.md) include the public option shapes for
modals, notifications, charts, forms, themes, and styling helpers. For
example, save a notice ID when the application needs to update it later:

```js
import '@beforesemicolon/cube/icons/icon'
import '@beforesemicolon/cube/action/button'
import {
  createFlashbar,
} from '@beforesemicolon/cube/feedback'

const notice = createFlashbar({
  type: 'warning',
  heading: 'Review your changes',
  message: 'Check the project before publishing.',
  dismissible: true,
  dismissLabel: 'Dismiss review notice',
  duration: 0,
})
notice.update({ message: 'The description needs a value.' })
// Call notice.dismiss() once the notice is no longer relevant.
```

To use the modal service, keep the renderer within the application theme and
use its result rather than looking for a private close button:

```js
import '@beforesemicolon/cube/icons/icon'
import '@beforesemicolon/cube/action/button'
import '@beforesemicolon/cube/navigation/link'
import { showModal } from '@beforesemicolon/cube/overlay'

const result = await showModal({
  heading: 'Project details',
  body: 'Publish when the project is ready.',
  closeLabel: 'Close project details',
  dismissible: true,
})
console.log(result.reason)
```
