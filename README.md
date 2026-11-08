# Cube

A TypeScript web component library for building visual editors and application interfaces. Explore interactive components and examples in [Storybook](#storybook), or browse the [Cube documentation](docs-cube/documentation/index.md).

## Usage

```js
import '@beforesemicolon/cube'
```

```html
<cb-button label="Save"></cb-button>
```

Import the full library, a category such as `@beforesemicolon/cube/action`, or an individual component such as `@beforesemicolon/cube/action/button`. For classic browser scripts, load WebComponent first, then Cube's full or category client.

## Components

| Category | Custom elements |
| --- | --- |
| Action | `cb-button-group`, `cb-button`, `cb-split-button` |
| Text | `cb-heading`, `cb-shortcut` |
| Form | `cb-calendar`, `cb-checkbox`, `cb-code-editor`, `cb-combobox`, `cb-css-value-input`, `cb-date-picker`, `cb-editable-label`, `cb-editable-list`, `cb-field`, `cb-file-picker`, `cb-json-editor`, `cb-linked-values`, `cb-masked-input`, `cb-number-input`, `cb-radio-group`, `cb-radio`, `cb-range-slider`, `cb-rich-text-editor`, `cb-rich-text-toolbar`, `cb-select`, `cb-slider`, `cb-stepper`, `cb-switch`, `cb-text-input`, `cb-textarea`, `cb-time-picker`, `cb-token-input`, `cb-unit-input`, `cb-verification-code` |
| Layout | `cb-action-bar`, `cb-box`, `cb-col`, `cb-divider`, `cb-docked-panel`, `cb-grid`, `cb-panel-header`, `cb-resizable-panel`, `cb-row`, `cb-sidebar`, `cb-toolbar`, `cb-workspace` |
| Navigation | `cb-breadcrumb`, `cb-link`, `cb-menu`, `cb-pagination`, `cb-segmented-control`, `cb-tabs` |
| Overlay | `cb-alert-dialog`, `cb-bottom-sheet`, `cb-command-palette`, `cb-context-menu`, `cb-drawer`, `cb-dropdown`, `cb-hover-card`, `cb-modal`, `cb-modal-renderer`, `cb-popover`, `cb-tooltip-provider`, `cb-tooltip` |
| Feedback | `cb-alert`, `cb-banner`, `cb-empty-state`, `cb-flashbar`, `cb-progress`, `cb-skeleton`, `cb-spinner`, `cb-status`, `cb-toast` |
| Data display | `cb-accordion`, `cb-avatar`, `cb-badge`, `cb-card`, `cb-code-preview`, `cb-expandable-section`, `cb-file-browser`, `cb-layer-tree`, `cb-list`, `cb-table`, `cb-tree` |
| Media | `cb-audio-player`, `cb-image`, `cb-video-player` |
| Charts | `cb-cartesian-chart`, `cb-pie-chart` |
| Styling | `cb-color-picker`, `cb-gradient-editor` |
| Editor | `cb-artboard`, `cb-bezier`, `cb-device-frame`, `cb-guide-overlay`, `cb-marquee-selection`, `cb-property-group`, `cb-rulers`, `cb-selection-overlay`, `cb-timeline`, `cb-viewport` |
| Collaboration | `cb-comment-pin`, `cb-comment-thread`, `cb-presence`, `cb-remote-cursor` |
| Icons | `cb-icon` |
| Theme | `cb-theme-provider` |

## Storybook

```sh
npm ci
npm run storybook
```

Open [Storybook on localhost](http://localhost:6006) for live controls and usage examples.
