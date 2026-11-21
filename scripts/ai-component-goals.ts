/**
 * Editorial discovery terms, deliberately separate from detected API facts.
 * Every tag is checked against the versioned index and its exact category.
 */
export const componentGoals: Record<string, readonly [intent: string, tags: string][]> = {
    action: [
        ['Run a command or submit a form; use an accessible name for icon-only actions', 'button'],
        ['Present several equally important actions', 'button-group'],
        ['Offer a primary action alongside secondary commands', 'split-button'],
    ],
    text: [
        ['Add a semantic heading and description', 'heading'],
        ['Display a shortcut hint; bind the command separately', 'shortcut'],
    ],
    form: [
        ['Collect single-line, multiline, or in-place text', 'text-input textarea editable-label'],
        ['Label a compatible field and associate help or validation', 'field'],
        ['Toggle a choice, toggle a live setting, or pick one visible option', 'checkbox switch radio radio-group'],
        ['Pick from a compact list or search by typing', 'select combobox'],
        ['Choose a day inline, from a popup, or choose a time of day', 'calendar date-picker time-picker'],
        ['Enter a number, click step buttons, or set a numeric value by dragging', 'number-input stepper slider range-slider'],
        ['Enter formatted values, multiple tokens, a fixed-length code, or files', 'masked-input token-input verification-code file-picker'],
        ['Edit CSS measurements or change related dimensions together', 'unit-input linked-values css-value-input'],
        ['Edit a collection of labels', 'editable-list'],
        ['Edit code, structured JSON, or rich text; compose a formatting toolbar', 'code-editor json-editor rich-text-editor rich-text-toolbar'],
    ],
    layout: [
        ['Arrange children horizontally, vertically, or in two-dimensional tracks', 'row col grid'],
        ['Add a surface or divide adjacent content', 'box divider'],
        ['Group contextual actions or provide a named control toolbar', 'action-bar toolbar'],
        ['Compose an editor shell or add a headed, side, docked, or resizable panel', 'workspace panel-header sidebar docked-panel resizable-panel'],
    ],
    navigation: [
        ['Link to a destination or show the current hierarchy', 'link breadcrumb'],
        ['Switch peer views or choose one compact view mode', 'tabs segmented-control'],
        ['Jump between numbered pages', 'pagination'],
        ['Show an inline keyboard-navigable list of commands', 'menu'],
    ],
    overlay: [
        ['Focus a task, ask for destructive confirmation, or host service-managed dialogs', 'modal alert-dialog modal-renderer'],
        ['Open a viewport-edge panel or a bottom-anchored sheet', 'drawer bottom-sheet'],
        ['Show commands from a trigger, pointer, or searchable command dialog', 'dropdown context-menu command-palette'],
        ['Show short help, rich hover content, or a manually opened anchored panel', 'tooltip tooltip-provider hover-card popover'],
    ],
    feedback: [
        ['Show context feedback, a page-wide message, or a short state', 'alert banner status'],
        ['Explain why a list is empty and provide a next step', 'empty-state'],
        ['Show brief notifications or manage a queue of messages', 'toast flashbar'],
        ['Show known progress, ongoing work, or reserve content space', 'progress spinner skeleton'],
    ],
    'data-display': [
        ['Show rows and columns, a collection, or a hierarchy', 'table list tree'],
        ['Browse files or display design layers', 'file-browser layer-tree'],
        ['Identify a person or label an item with a status', 'avatar badge'],
        ['Group content, reveal one section, or reveal several sections', 'card expandable-section accordion'],
        ['Display source code without editing it', 'code-preview'],
    ],
    media: [
        ['Play audio or video with ready-made transport controls', 'audio-player video-player'],
        ['Load a responsive visual with fallback presentation', 'image'],
    ],
    charts: [
        ['Compare series over axes or show parts of a whole', 'cartesian-chart pie-chart'],
    ],
    styling: [
        ['Choose or display a color, or edit a gradient', 'color-picker color-swatch gradient-editor'],
    ],
    editor: [
        ['Compose a canvas, a selectable artboard, or a device preview', 'viewport artboard device-frame'],
        ['Show coordinates, guide lines, or canvas selection geometry', 'rulers guide-overlay marquee-selection selection-overlay'],
        ['Build an inspector or edit animation tracks and easing', 'property-group timeline bezier'],
    ],
    collaboration: [
        ['Show collaborators and their pointers or open a threaded discussion', 'presence remote-cursor comment-pin comment-thread'],
    ],
    icons: [
        ['Render a built-in, image, or custom SVG icon', 'icon'],
    ],
    theme: [
        ['Apply a theme or appearance to a specific subtree', 'theme-provider'],
    ],
}

export const exactIntentKeywords: Record<string, string[]> = {
    'cb-button': ['icon-only remove action'],
    'cb-alert-dialog': ['before committing destructive action', 'confirm destructive action', 'confirm deletion'],
    'cb-select': ['choose one or many tags', 'pick multiple predefined options'],
    'cb-combobox': ['search and choose multiple tags', 'filter option list by typing'],
    'cb-token-input': ['enter free-form tags', 'multiple tags field', 'remove text tokens'],
    'cb-file-picker': ['disabled file picker', 'attach local files', 'select files without automatic upload'],
    'cb-file-browser': ['browse without upload', 'subfolder hierarchy', 'browse files and folders'],
    'cb-date-picker': ['date range with two single-date controls', 'pick a start date or end date'],
    'cb-table': ['large tabular data', 'sortable rows and columns'],
    'cb-tree': ['nested hierarchy', 'expand nested folders', 'expand and collapse nested nodes'],
    'cb-empty-state': ['empty view', 'no results', 'no results call to action'],
    'cb-audio-player': ['add an audio player to this HTML page', 'ready-made audio player'],
    'cb-bottom-sheet': ['bottom mobile sheet', 'mobile bottom-anchored panel'],
}
