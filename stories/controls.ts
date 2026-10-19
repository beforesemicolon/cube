import type { StoryObj } from '@storybook/web-components-vite'
import { Component } from '../components/core/Component.js'
import { iconPaths } from '../components/icons/paths.js'
import { fieldControlTags, preview } from './helpers.js'

type ControlOption = string | number | boolean
type StoryValue = string | number | boolean | null | object
export type StoryArgs = Record<string, StoryValue | undefined>

interface NumberControl {
    readonly type: 'number'
    readonly min?: number
    readonly max?: number
    readonly step?: number
}

interface StoryControl {
    readonly control: 'text' | 'boolean' | 'object' | 'select' | 'color' | NumberControl | false
    readonly options?: readonly ControlOption[]
    readonly mapping?: Readonly<Record<string, ((value: number) => string) | null>>
    readonly description: string
    readonly table: {
        readonly category: string
        readonly type: { readonly summary: string }
        readonly defaultValue: { readonly summary: string }
    }
}

export type StoryArgTypes = Record<string, StoryControl>

interface ObservedElementConstructor extends CustomElementConstructor {
    readonly observedAttributes?: readonly string[]
}

const booleanProperties = new Set([
    'allowAlpha', 'allowReorder', 'allowSampler', 'animated', 'autoplay', 'bottomOpen', 'busy', 'checked', 'closeOnBackdrop', 'collapsible', 'decorative', 'destructive', 'dirty', 'disabled', 'dismissible',
    'controls', 'disableContentPadding', 'expanded', 'formNoValidate', 'grid', 'invalid', 'inverted', 'loading', 'loop', 'multi', 'multiple', 'muted', 'native',
    'editable', 'editing', 'endOpen', 'guide', 'inline', 'lineNumbers', 'linked', 'mixed', 'movable', 'open', 'patterns', 'pinned', 'popupExpanded', 'pressed', 'readOnly', 'reorderable', 'required', 'resizable', 'returnFocus', 'reverse', 'rotatable', 'rowActivation',
    'pannable', 'playing', 'searchable', 'selectable', 'selected', 'selectOnEdit', 'showCancel', 'showChrome', 'showCursor', 'showDimensions', 'showLock', 'showOrientationControl', 'showSize', 'showVisibility', 'startOpen', 'stickyHeader', 'striped', 'submitOnBlur', 'success', 'unmask', 'wrap', 'zoomable',
])

const numberProperties = new Set([
    'angle', 'bottomSize', 'currentTime', 'cursorX', 'cursorY', 'delay', 'duration', 'endSize', 'firstDayOfWeek', 'firstValue', 'headingLevel', 'height', 'indent', 'lines', 'majorStep', 'max', 'maxBottomSize', 'maxEndSize', 'maxItems', 'maxLines', 'maxRecent', 'maxStartSize', 'maxVisible', 'maxZoom', 'min', 'minBottomSize', 'minEndSize', 'minHeight', 'minItems', 'minLines', 'minStartSize', 'minWidth', 'minorDivisions', 'minZoom', 'mobileBreakpoint', 'moveStep', 'originX', 'originY', 'page', 'playbackRate',
    'loadingRows', 'progress', 'searchThreshold', 'seekStep', 'selectionCount', 'siblings', 'step', 'stickyColumns',
    'resizeStep', 'rotation', 'secondValue', 'snap', 'startSize', 'tabSize', 'threshold', 'totalPages', 'width', 'x', 'x1', 'x2', 'y', 'y1', 'y2', 'zoom', 'zoomStep',
])

const objectProperties = new Set([
    'collapsedGroupKeys', 'entries', 'expandedIds', 'expandedKeys', 'guides', 'handleLabels', 'items', 'messages', 'options', 'recentColors', 'rect', 'selectedIds', 'selectedKeys', 'series', 'swatches', 'targets', 'theme', 'tracks',
    'units', 'visibleSegments', 'visibleSeries',
    'stops', 'xAxis', 'yAxis',
])

const genericOptions: Readonly<Record<string, readonly ControlOption[]>> = {
    activation: ['automatic', 'manual'],
    align: ['start', 'center', 'end', 'stretch', 'baseline'],
    appearance: ['light', 'dark', 'system'],
    autoFlow: ['row', 'column', 'dense', 'row dense', 'column dense'],
    autocomplete: ['none', 'list', 'both'],
    collapseAt: ['', 'sm', 'md', 'lg'],
    crossOrigin: ['', 'anonymous', 'use-credentials'],
    justify: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly', 'stretch'],
    modalSize: ['sm', 'md', 'lg', 'full', 'page'],
    orientation: ['horizontal', 'vertical'],
    placement: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
    popupType: ['', 'menu', 'listbox', 'tree', 'grid', 'dialog'],
    position: ['top-start', 'top-end', 'bottom-start', 'bottom-end'],
    preload: ['none', 'metadata', 'auto'],
    searchable: ['auto', true, false],
    size: ['xs', 'sm', 'md', 'lg'],
    target: ['_self', '_blank', '_parent', '_top'],
    type: ['button', 'submit', 'reset'],
}

const tagOptions: Readonly<Record<string, Readonly<Record<string, readonly ControlOption[]>>>> = {
    'cb-avatar': { status: ['none', 'online', 'idle', 'busy', 'offline'] },
    'cb-button': { variant: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] },
    'cb-icon-button': { variant: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] },
    'cb-button-group': { variant: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] },
    'cb-link': { variant: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] },
    'cb-cartesian-chart': { status: ['finished', 'loading', 'error'], stacking: [false, 'normal'] },
    'cb-pie-chart': { status: ['finished', 'loading', 'error'], variant: ['pie', 'donut'] },
    'cb-sidebar': { placement: ['start', 'end'] },
    'cb-resizable-panel': { placement: ['start', 'end'] },
    'cb-docked-panel': { placement: ['start', 'end', 'bottom'] },
    'cb-drawer': { placement: ['start', 'end'] },
    'cb-popover': { placement: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] },
    'cb-hover-card': { placement: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] },
    'cb-skeleton': { variant: ['text', 'card', 'table'] },
    'cb-table': { density: ['comfortable', 'compact'], selectionMode: ['none', 'single', 'multiple'], sortDirection: ['asc', 'desc'] },
    'cb-accordion': { variant: ['simple', 'container'] },
    'cb-expandable-section': { variant: ['default', 'container', 'footer'] },
    'cb-gradient-editor': {
        type: ['linear', 'radial'],
        shape: ['circle', 'ellipse'],
        extent: ['closest-side', 'closest-corner', 'farthest-side', 'farthest-corner'],
        position: ['left top', 'center top', 'right top', 'left center', 'center', 'right center', 'left bottom', 'center bottom', 'right bottom'],
    },
    'cb-device-frame': { device: ['desktop', 'tablet', 'mobile', 'custom'], orientation: ['portrait', 'landscape'] },
    'cb-code-editor': { language: ['plaintext', 'html', 'css', 'javascript', 'typescript', 'json', 'shell'] },
    'cb-json-editor': { language: ['json'] },
    'cb-file-browser': { view: ['grid', 'table'], sortBy: ['name', 'type', 'size', 'modified'], sortDirection: ['asc', 'desc'], selectionMode: ['none', 'single', 'multiple'], searchable: [true, false] },
    'cb-grid': { variant: ['', 'cards', 'masonry', 'holy-grail', 'sidebar', 'header-main-footer'] },
    'cb-modal': { layer: ['top', 'document'] },
    'cb-masked-input': { autocomplete: ['off', 'on', 'tel', 'postal-code', 'cc-number'], inputMode: ['text', 'numeric', 'tel', 'decimal'] },
    'cb-workspace': { mobilePanel: ['', 'start', 'end', 'bottom'] },
}

const numberControls: Readonly<Record<string, NumberControl>> = {
    delay: { type: 'number', min: 0, max: 5000, step: 50 },
    firstDayOfWeek: { type: 'number', min: 0, max: 6, step: 1 },
    headingLevel: { type: 'number', min: 1, max: 6, step: 1 },
    height: { type: 'number', min: 160, max: 1200, step: 10 },
    width: { type: 'number', min: 160, max: 2400, step: 10 },
    angle: { type: 'number', min: -360, max: 360, step: 1 },
    currentTime: { type: 'number', min: 0, step: .1 },
    duration: { type: 'number', min: .1, max: 120, step: .1 },
    majorStep: { type: 'number', min: 1, max: 1000, step: 1 },
    minorDivisions: { type: 'number', min: 1, max: 20, step: 1 },
    minZoom: { type: 'number', min: 1, max: 400, step: 1 },
    maxZoom: { type: 'number', min: 25, max: 1600, step: 25 },
    snap: { type: 'number', min: .001, max: 10, step: .01 },
    x1: { type: 'number', min: 0, max: 1, step: .01 },
    x2: { type: 'number', min: 0, max: 1, step: .01 },
    y1: { type: 'number', min: -1, max: 2, step: .01 },
    y2: { type: 'number', min: -1, max: 2, step: .01 },
    zoom: { type: 'number', min: 1, max: 1600, step: 5 },
    zoomStep: { type: 'number', min: 1, max: 100, step: 1 },
    lines: { type: 'number', min: 1, max: 12, step: 1 },
    loadingRows: { type: 'number', min: 1, max: 20, step: 1 },
    maxItems: { type: 'number', min: 1, step: 1 },
    minItems: { type: 'number', min: 0, step: 1 },
    minLines: { type: 'number', min: 1, max: 80, step: 1 },
    maxLines: { type: 'number', min: 1, max: 200, step: 1 },
    tabSize: { type: 'number', min: 1, max: 8, step: 1 },
    indent: { type: 'number', min: 0, max: 8, step: 1 },
    threshold: { type: 'number', min: 0, max: 32, step: 1 },
    rotation: { type: 'number', min: -360, max: 360, step: 1 },
    moveStep: { type: 'number', min: .1, max: 100, step: .1 },
    mobileBreakpoint: { type: 'number', min: 320, max: 1600, step: 10 },
    resizeStep: { type: 'number', min: 1, max: 100, step: 1 },
    maxRecent: { type: 'number', min: 0, max: 24, step: 1 },
    maxVisible: { type: 'number', min: 1, max: 20, step: 1 },
    page: { type: 'number', min: 1, step: 1 },
    playbackRate: { type: 'number', min: 0.25, max: 4, step: 0.25 },
    progress: { type: 'number', min: 0, max: 100, step: 1 },
    seekStep: { type: 'number', min: 1, max: 60, step: 1 },
    searchThreshold: { type: 'number', min: 0, step: 1 },
    selectionCount: { type: 'number', min: 0, step: 1 },
    siblings: { type: 'number', min: 0, max: 5, step: 1 },
    stickyColumns: { type: 'number', min: 0, max: 10, step: 1 },
    totalPages: { type: 'number', min: 1, step: 1 },
}

const descriptions: Readonly<Record<string, string>> = {
    accessibleLabel: 'Screen-reader label used when the visible label is absent or insufficient.',
    actionLabel: 'Localized label for the component’s primary action.',
    actionValue: 'Value emitted when the split button’s primary action is activated.',
    appearance: 'Selects the light, dark, or system theme appearance.',
    autocomplete: 'Controls list suggestions and inline completion behavior.',
    closeLabel: 'Accessible text for the close button.',
    closeOnBackdrop: 'Allows a backdrop click to dismiss the dialog.',
    cancelLabel: 'Localized label for the modal-owned cancel action.',
    showCancel: 'Displays the modal-owned cancel action when the modal is dismissible.',
    code: 'Source code displayed by the preview.',
    codeLanguage: 'Syntax language passed to the highlighter.',
    description: 'Supporting text associated with the component.',
    details: 'Extended guidance displayed in the field details disclosure.',
    detailsLabel: 'Localized label for opening the field details disclosure.',
    disabled: 'Prevents interaction and exposes the disabled state.',
    emptyLabel: 'Localized message displayed when no content is available.',
    error: 'Visible validation or error message.',
    errorText: 'Validation message announced and displayed for the field.',
    success: 'Displays the field success state when no validation error is present.',
    successText: 'Confirmation message announced and displayed below the control.',
    mask: 'Formatting pattern. Use 9 for a digit, A for a letter, * for an alphanumeric character, and other characters as literals.',
    maskPlaceholder: 'Single character shown for each incomplete mask position when guide is enabled.',
    guide: 'Displays the complete mask shape as the input placeholder.',
    helpText: 'Additional guidance displayed below the wrapped control.',
    invalid: 'Marks the wrapped control invalid and exposes its validation state.',
    unmask: 'Submits only characters accepted by mask tokens while retaining the formatted display value.',
    firstDayOfWeek: 'Weekday used as the first calendar column, from 0 (Sunday) through 6 (Saturday).',
    icon: 'Icon name displayed by the control.',
    items: 'Editable item collection. Add, remove, reorder, label, value, or disable entries here.',
    name: 'Form-control name used when the value is submitted.',
    src: 'Image source. When absent or unavailable, the avatar displays initials.',
    initials: 'Optional initials override. Otherwise initials are derived from the name.',
    color: 'Avatar fallback surface color.',
    statusLabel: 'Localized description of the visible presence status.',
    decorative: 'Hides the avatar from assistive technology when adjacent text already names the person.',
    summary: 'Localized participant summary displayed beside the avatar group.',
    overflowLabel: 'Localized accessible label for hidden participants. Supports {count}.',
    label: 'Visible component label.',
    menuLabel: 'Accessible label for the split button menu trigger.',
    messages: 'Editable Flashbar notification queue.',
    allowAlpha: 'Enables transparency editing and eight-digit HEX values.',
    allowSampler: 'Shows the screen color sampler when the browser supports it.',
    addSwatchLabel: 'Localized accessible label for saving the current color as a swatch.',
    removeSwatchLabel: 'Localized keyboard-removal guidance for a selected swatch. Supports {color}.',
    native: 'Uses the browser-native control instead of the themed Cube renderer.',
    popupMaxWidth: 'Maximum popup width as a CSS length, or a number interpreted as pixels. The viewport remains the final boundary.',
    popupMaxHeight: 'Maximum popup height as a CSS length, or a number interpreted as pixels. Overflow scrolls within the popup.',
    pressed: 'When defined, gives the button persistent toggle state and exposes aria-pressed. Leave undefined for a normal action button.',
    recentColors: 'Controlled list of recent colors to display without changing it when the picker value changes.',
    open: 'Controls whether the popup or overlay is open.',
    options: 'Editable option collection. Add, remove, relabel, value, or disable options here.',
    optionalLabel: 'Localized text identifying a field as optional.',
    placeholder: 'Hint displayed when the component has no value.',
    multi: 'Allows more than one option to be selected while keeping the dropdown open.',
    searchable: 'Shows search automatically above the threshold, or forces it on or off.',
    searchThreshold: 'Option count above which automatic search is displayed.',
    searchLabel: 'Accessible label for the option filter field.',
    searchPlaceholder: 'Placeholder displayed in the option filter field.',
    readOnly: 'Prevents edits while preserving focus and value exposure.',
    required: 'Marks the value as required for form validation.',
    series: 'Editable chart series and data points.',
    swatches: 'Editable saved color palette displayed inside the picker.',
    stops: 'Editable gradient color stops. Add, remove, recolor, or reposition entries.',
    theme: 'Site-builder-compatible theme definition applied as CSS variables.',
    tracks: 'Editable track and keyframe collection for media captions or Timeline animation data.',
    unit: 'Current unit displayed beside the numeric value.',
    unitLabel: 'Accessible label for the unit selector.',
    units: 'Editable units the user can choose from. A single unit is displayed as a static suffix.',
    value: 'Current controlled value.',
    zoom: 'Current viewport or ruler magnification percentage.',
    minZoom: 'Smallest magnification allowed by the viewport.',
    maxZoom: 'Largest magnification allowed by the viewport.',
    zoomStep: 'Magnification changed by each zoom action.',
    pannable: 'Allows pointer, wheel, and keyboard panning.',
    grid: 'Displays the viewport alignment grid.',
    controls: 'Displays the viewport zoom controls.',
    selected: 'Displays the artboard as selected.',
    selectable: 'Allows the artboard to be selected by pointer or keyboard.',
    showDimensions: 'Displays the artboard dimensions label.',
    showCursor: 'Displays ruler cursor guides and coordinates.',
    majorStep: 'Distance in document units between labeled ruler ticks.',
    minorDivisions: 'Number of smaller ruler intervals inside a major step.',
    device: 'Device chrome preset used around the content.',
    showChrome: 'Displays the selected device bezel, camera, notch, or stand.',
    showOrientationControl: 'Displays an interactive orientation toggle.',
    duration: 'Total motion-preview duration in milliseconds or Timeline duration in seconds.',
    playing: 'Controls the motion preview or Timeline playback state.',
    currentTime: 'Current Timeline playhead position in seconds.',
    snap: 'Timeline keyframe movement increment in seconds.',
    selectedKeyframeId: 'Controlled ID of the selected Timeline keyframe.',
    valueFormatter: 'Storybook formatter preset used for chart values.',
    visibleSegments: 'Controlled list of visible pie or donut segment IDs.',
    visibleSeries: 'Controlled list of visible Cartesian series IDs.',
    xAxis: 'Editable Cartesian x-axis configuration.',
    yAxis: 'Editable Cartesian y-axis configuration.',
    animated: 'Enables component motion while honoring the user’s reduced-motion preference.',
    columns: 'Number of placeholder columns rendered by the table skeleton.',
    lines: 'Number of text placeholder lines rendered by text and card skeletons.',
    rows: 'Number of placeholder rows rendered by the table skeleton.',
    collapsedGroupKeys: 'Controlled group keys that are currently collapsed.',
    density: 'Controls comfortable or compact row spacing.',
    expandedKeys: 'Controlled row keys whose nested children are visible.',
    expandedIds: 'Controlled accordion item IDs whose panels are expanded.',
    headingLevel: 'Semantic heading level exposed by each accordion trigger.',
    collapsible: 'Allows every accordion panel to be collapsed. Disable it to keep one panel open.',
    multiple: 'Allows more than one accordion panel to be expanded at the same time.',
    loadingRows: 'Number of placeholder rows displayed while table data is loading.',
    parentBy: 'Nested path containing each row’s parent key.',
    childrenBy: 'Nested path containing each row’s child row array.',
    groupBy: 'Nested path used to group rows.',
    groupLabelBy: 'Nested path used to label row groups.',
    itemKey: 'Nested path containing the stable unique key for each row.',
    selectableField: 'Nested path containing whether each row can be selected.',
    selectedKeys: 'Controlled keys for selected rows.',
    selectionMode: 'Enables no selection, single selection, or multiple selection.',
    sortBy: 'ID of the column currently controlling row order.',
    sortDirection: 'Ascending or descending order for the active sort column.',
    rowActivation: 'Makes each non-interactive row area pointer and keyboard actionable.',
    resizable: 'Allows every column to be resized by pointer or keyboard.',
    stickyHeader: 'Keeps column headers visible while the table viewport scrolls.',
    stickyColumns: 'Number of leading data columns kept visible during horizontal scrolling.',
    striped: 'Alternates row surface colors for dense comparison tables.',
    selectionAnnouncement: 'Localized live-region template. Supports {count}.',
    sortAnnouncement: 'Localized live-region template. Supports {column} and {direction}.',
    expansionAnnouncement: 'Localized live-region template. Supports {row} and {state}.',
    counter: 'Optional count or short status displayed beside the section label.',
    disableContentPadding: 'Removes the built-in content padding for full-bleed tables and other surfaces.',
    entries: 'Editable file and folder records, including hierarchy, metadata, and disabled state.',
    selectedIds: 'Controlled IDs for selected files, folders, or editor layers.',
    guides: 'Editable snapping, measurement, or insertion guides rendered over an editor surface.',
    targets: 'Selectable editor target rectangles used for marquee hit testing.',
    rect: 'Controlled x, y, width, and height of the selected editor object.',
    handleLabels: 'Localized accessible labels keyed by resize-handle direction.',
    allowReorder: 'Allows list items to move earlier or later using accessible controls.',
    lineNumbers: 'Displays a line-number gutter beside the editable source.',
    tabSize: 'Number of spaces inserted or removed by Tab and Shift+Tab.',
    minLines: 'Minimum visible height of the code editing surface, measured in lines.',
    maxLines: 'Maximum visible height before the code editing surface scrolls.',
    linked: 'Keeps the two numeric values proportional while either value changes.',
    mobilePanel: 'Controlled panel displayed as a mobile workspace overlay.',
    startOpen: 'Controls the workspace start panel on larger containers.',
    endOpen: 'Controls the workspace end panel on larger containers.',
    bottomOpen: 'Controls the workspace bottom panel on larger containers.',
    persistKey: 'Optional storage key used to restore workspace panel state and dimensions.',
    editable: 'Allows inline layer renaming.',
    reorderable: 'Allows layers to be repositioned with drag and drop.',
    showVisibility: 'Displays per-layer visibility actions.',
    showLock: 'Displays per-layer locking actions.',
    movable: 'Allows the selection overlay to move by pointer or keyboard.',
    rotatable: 'Displays and enables the rotation handle.',
    showSize: 'Displays the current selection dimensions.',
    layer: 'Chooses a top-layer dialog or an in-document modal surface.',
}

const defaultSummaries: Readonly<Record<string, string>> = {
    activation: 'automatic', align: 'stretch', appearance: 'system', autoFlow: 'row', autocomplete: 'list',
    allowAlpha: 'true', allowSampler: 'true', autoplay: 'false', busy: 'false', checked: 'false', closeOnBackdrop: 'true', collapseAt: "''",
    crossOrigin: "''", decorative: 'false', destructive: 'false', disabled: 'false', disableContentPadding: 'false', dismissible: 'true',
    expanded: 'false', firstDayOfWeek: '0', height: 'auto', initials: "''", invalid: 'false', items: '[]',
    loading: 'false', loop: 'false', max: '100', maxRecent: '8', maxVisible: '4', messages: '[]', min: '0',
    modalSize: 'md', multi: 'false', multiple: 'false', muted: 'false', native: 'false', open: 'false', options: '[]', overflowLabel: "''",
    orientation: 'horizontal', patterns: 'false', placement: 'bottom-start', playbackRate: '1', position: 'top-end',
    preload: 'metadata', pressed: 'undefined', progress: '0', readOnly: 'false', required: 'false', reverse: 'false', searchable: 'auto', searchThreshold: '10', seekStep: '10',
    recentColors: '[]', series: '[]', size: 'sm', src: "''", status: 'finished', statusLabel: "''", step: '1', stops: '[]', summary: "''", swatches: '[]', theme: 'null', tracks: '[]', units: '[]', value: "''",
    visibleSegments: 'null', visibleSeries: 'null', wrap: 'false', xAxis: '{}', yAxis: '{}', zoomable: 'false',
    animated: 'true', controls: 'true', currentTime: '0', duration: '4', grid: 'true', maxZoom: '400', minZoom: '25', pannable: 'true', playing: 'false', showCancel: 'true',
    selectable: 'true', selected: 'false', showChrome: 'true', showCursor: 'true', showDimensions: 'true', showOrientationControl: 'true', snap: '0.1', zoom: '100', zoomStep: '10',
    headingLevel: '2', lines: '3', loadingRows: '5', resizable: 'true', rowActivation: 'false', selectionMode: 'none',
    sortDirection: 'asc', stickyColumns: '0', stickyHeader: 'false', striped: 'false', density: 'comfortable',
    allowReorder: 'true', bottomOpen: 'false', editable: 'true', endOpen: 'true', entries: '[]', guides: '[]', handleLabels: '{}',
    lineNumbers: 'true', linked: 'false', maxLines: '32', minItems: '0', minLines: '8', mobilePanel: "''", movable: 'true',
    rect: '{ x: 0, y: 0, width: 120, height: 80 }', reorderable: 'true', returnFocus: 'true', rotatable: 'false',
    selectedIds: '[]', showLock: 'true', showSize: 'true', showVisibility: 'true', startOpen: 'true', success: 'false', successText: "''", tabSize: '2', targets: '[]',
}

const primitiveDefaults: Readonly<Record<string, string | number | boolean | null>> = {
    accessibleLabel: '', actionLabel: '', actionValue: '', activation: 'automatic', align: 'stretch', allowAlpha: true, allowSampler: true, appearance: 'system',
    angle: 90, autoFlow: 'row', autocomplete: 'list', autoplay: false, background: '', blockSize: '', border: '', busy: false, controls: true, currentTime: 0, cursorX: 0, cursorY: 0,
    cancelLabel: '', checked: false, closeLabel: '', closeOnBackdrop: true, code: '', codeLanguage: 'html', collapsible: false, collapseAt: '', columns: '',
    color: '', confirmLabel: '', content: '', copiedLabel: '', copyLabel: '', crossOrigin: '', decorative: false, delay: 0,
    description: '', destructive: false, disabled: false, disableContentPadding: false, dismissible: true, download: '', emptyLabel: '', error: '',
    device: 'desktop', duration: 4, errorText: '', expanded: false, extent: 'farthest-corner', firstDayOfWeek: 0, formNoValidate: false, gap: '', grid: true, heading: '', height: 320,
    href: '', icon: '', initials: '', inlineSize: '', innerDescription: '', innerTitle: '', invalid: false, justify: 'stretch',
    keys: '', label: '', loading: false, loop: false, margin: '', max: 100, maxBlockSize: '', maxInlineSize: '',
    majorStep: 100, maxItems: 4, maxRecent: 8, maxVisible: 4, maxZoom: 400, mediaTitle: '', menuLabel: '', min: 0, minorDivisions: 10, minZoom: 25, minBlockSize: '', minInlineSize: '',
    modalSize: 'md', multi: false, multiple: false, muted: false, name: '', native: false, open: false, orientation: 'horizontal', originX: 0, originY: 0, overflowLabel: '',
    overflow: '', padding: '', page: 1, patterns: false, placement: 'bottom-start', placeholder: '', playbackRate: 1,
    popupControls: '', popupExpanded: false, popupType: '', position: 'top-end', poster: '', preload: 'metadata', searchLabel: '', searchable: 'auto', searchPlaceholder: '', searchThreshold: 10,
    pannable: true, playing: false, progress: 0, query: '', radius: '', readOnly: false, required: false, reverse: false, rows: '',
    seekStep: 10, selectionCount: 0, shape: 'circle', siblings: 1, size: 'sm', src: '', status: '', statusLabel: '', step: 1, summary: '', target: '_self',
    selectable: true, selected: false, showCancel: true, showChrome: true, showCursor: true, showDimensions: true, showOrientationControl: true, snap: .1,
    totalPages: 1, type: 'button', unit: '', unitLabel: '', value: '', valueText: '', width: 640, wrap: false, x: 0, x1: .25, x2: .25, y: 0, y1: .1, y2: 1, zoom: 100, zoomStep: 10, zoomable: false,
    animated: true, allowReorder: true, bottomOpen: false, dirty: false, editable: true, editing: false, endOpen: true, guide: true, headingLevel: 2, inline: false,
    lineNumbers: true, linked: false, lines: 3, loadingRows: 5, maxLines: 32, minItems: 0, minLines: 8, mixed: false,
    mobileBreakpoint: 860, mobilePanel: '', movable: true, moveStep: 1, pinned: false, reorderable: true, resizeStep: 16,
    resizable: true, returnFocus: true, rotatable: false, rowActivation: false, selectionMode: 'none', success: false, successText: '',
    selectOnEdit: true, showLock: true, showSize: true, showVisibility: true, startOpen: true, submitOnBlur: true, tabSize: 2, threshold: 3, unmask: false,
    sortDirection: 'asc', stickyColumns: 0, stickyHeader: false, striped: false, density: 'comfortable',
}

const taggedDefaults: Readonly<Record<string, Readonly<Record<string, StoryValue>>>> = {
    'cb-avatar': { status: 'none' },
    'cb-accordion': { variant: 'simple' },
    'cb-expandable-section': { variant: 'default' },
    'cb-gradient-editor': { type: 'linear', shape: 'circle', extent: 'farthest-corner', position: 'center' },
    'cb-device-frame': { device: 'desktop', orientation: 'landscape' },
    'cb-presence': { maxVisible: 2 },
    'cb-button': { variant: 'secondary' },
    'cb-button-group': { variant: 'secondary' },
    'cb-split-button': { popupMaxWidth: '320px', popupMaxHeight: '360px' },
    'cb-link': { variant: 'secondary' },
    'cb-cartesian-chart': { status: 'finished', stacking: false, inverted: false },
    'cb-pie-chart': { status: 'finished', variant: 'pie' },
    'cb-skeleton': { variant: 'text', rows: 3, columns: 3 },
    'cb-grid': { columns: 'minmax(0, 1fr)', autoFlow: 'row', variant: '' },
    'cb-select': { searchable: 'auto', popupMaxWidth: '320px', popupMaxHeight: '280px' },
    'cb-unit-input': { popupMaxWidth: '160px', popupMaxHeight: '240px' },
    'cb-combobox': { popupMaxWidth: '360px', popupMaxHeight: '240px' },
    'cb-date-picker': { popupMaxWidth: '360px', popupMaxHeight: '440px' },
    'cb-time-picker': { popupMaxWidth: '240px', popupMaxHeight: '240px' },
    'cb-dropdown': { popupMaxWidth: '320px', popupMaxHeight: '360px' },
    'cb-popover': { popupMaxWidth: '360px', popupMaxHeight: '480px' },
    'cb-hover-card': { popupMaxWidth: '360px', popupMaxHeight: '480px' },
    'cb-color-picker': { popupMaxWidth: '344px', popupMaxHeight: '640px' },
    'cb-code-editor': { language: 'plaintext', lineNumbers: true, wrap: false, tabSize: 2, minLines: 8, maxLines: 32 },
    'cb-json-editor': { indent: 2, lineNumbers: true, wrap: false },
    'cb-editable-list': { minItems: 0, maxItems: 8, allowReorder: true },
    'cb-linked-values': { firstValue: 320, secondValue: 180, linked: true, min: 0, max: 4096, step: 1 },
    'cb-sidebar': { collapsible: false, expanded: true, placement: 'start' },
    'cb-file-browser': { view: 'grid', sortBy: 'name', sortDirection: 'asc', selectionMode: 'single', searchable: true },
    'cb-guide-overlay': { zoom: 1 },
    'cb-layer-tree': { multiple: true, editable: true, reorderable: true, showVisibility: true, showLock: true },
    'cb-modal': { modalSize: 'md', layer: 'top', returnFocus: true },
    'cb-masked-input': { guide: true, unmask: false, inputMode: 'text', autocomplete: 'off' },
    'cb-editable-label': { editing: false, selectOnEdit: true, submitOnBlur: true },
    'cb-property-group': { expanded: true, collapsible: true, dirty: false, mixed: false },
    'cb-selection-overlay': { rotation: 0, movable: true, resizable: true, rotatable: false, moveStep: 1, minWidth: 1, minHeight: 1, showSize: true },
    'cb-workspace': { startOpen: true, endOpen: true, bottomOpen: false, startSize: 280, endSize: 360, bottomSize: 240, minStartSize: 180, maxStartSize: 560, minEndSize: 220, maxEndSize: 720, minBottomSize: 140, maxBottomSize: 640, resizeStep: 16, mobileBreakpoint: 860, mobilePanel: '' },
}

const numericValueTags = new Set([
    'cb-number-input', 'cb-unit-input', 'cb-range-slider', 'cb-slider', 'cb-stepper', 'cb-resizable-panel',
])

const colorValueTags = new Set(['cb-color-picker'])
const dateBoundTags = new Set(['cb-calendar', 'cb-date-picker', 'cb-time-picker'])
const cssDimensionTags = new Set(['cb-box', 'cb-row', 'cb-col', 'cb-grid'])

const formatterMapping: Readonly<Record<string, ((value: number) => string) | null>> = {
    Default: null,
    Compact: value => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value),
    Percent: value => `${new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value)}%`,
}

function attributeToProperty(attribute: string): string {
    return attribute.replace(/-([a-z])/g, (_match: string, letter: string) => letter.toUpperCase())
}

function humanize(property: string): string {
    return property.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`)
}

function descriptionFor(tag: string, property: string): string {
    if (tag === 'cb-avatar' && property === 'name') return 'Person or entity name used for fallback initials and accessible text.'
    if (tag === 'cb-sidebar' && property === 'collapsible') return 'Allows the sidebar to collapse into a compact toggle rail.'
    return descriptions[property] ?? `Controls the ${humanize(property)} property.`
}

function numberControl(property: string): NumberControl {
    return numberControls[property] ?? { type: 'number' }
}

function optionsFor(tag: string, property: string): readonly ControlOption[] | undefined {
    if (property === 'icon' || tag === 'cb-icon' && property === 'name') return ['', ...Object.keys(iconPaths).sort()]
    return tagOptions[tag]?.[property] ?? genericOptions[property]
}

function controlFor(tag: string, property: string): StoryControl['control'] {
    if (property === 'valueFormatter') return 'select'
    if (property === 'value' && numericValueTags.has(tag)) return numberControl(property)
    if (property === 'value' && colorValueTags.has(tag)) return 'color'
    if (property === 'color') return 'color'
    if (cssDimensionTags.has(tag) && ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'].includes(property)) return 'text'
    if ((property === 'min' || property === 'max') && dateBoundTags.has(tag)) return 'text'
    if (optionsFor(tag, property)) return 'select'
    if (tag === 'cb-skeleton' && (property === 'rows' || property === 'columns')) return { type: 'number', min: 1, max: 12, step: 1 }
    if (tag === 'cb-table' && property === 'columns') return 'object'
    if (booleanProperties.has(property)) return 'boolean'
    if (numberProperties.has(property)) return numberControl(property)
    if (objectProperties.has(property)) return 'object'
    return 'text'
}

function typeSummary(tag: string, property: string, control: StoryControl['control'], options: readonly ControlOption[] | undefined): string {
    if (property === 'valueFormatter') return '(value: number) => string'
    if (property === 'items') return tag === 'cb-presence' ? 'PresenceItem[]' : 'Item[]'
    if (property === 'stops') return 'GradientStop[]'
    if (tag === 'cb-table' && property === 'columns') return 'TableColumn[]'
    if (['selectedKeys', 'expandedIds', 'expandedKeys', 'collapsedGroupKeys', 'swatches', 'recentColors'].includes(property)) return 'string[]'
    if (property === 'options') return 'SelectOption[]'
    if (property === 'units') return 'UnitOption[]'
    if (property === 'series') return tag === 'cb-pie-chart' ? 'PieSeries' : 'Series[]'
    if (property === 'tracks') return tag === 'cb-timeline' ? 'TimelineTrack[]' : 'CaptionTrack[]'
    if (property === 'messages') return 'FlashbarMessage[]'
    if (property === 'theme') return 'ThemeDefinition | null'
    if (property === 'entries') return 'FileBrowserEntry[]'
    if (property === 'selectedIds') return 'string[]'
    if (property === 'guides') return 'EditorGuide[]'
    if (property === 'targets') return 'MarqueeTarget[]'
    if (property === 'rect') return 'EditorRect'
    if (property === 'handleLabels') return 'Partial<Record<SelectionHandle, string>>'
    if (property === 'popupMaxWidth' || property === 'popupMaxHeight') return 'string | number'
    if (property === 'xAxis' || property === 'yAxis') return 'Axis | Axis[]'
    if (property === 'visibleSeries' || property === 'visibleSegments') return 'string[] | null'
    if (options) return options.map(option => typeof option === 'string' ? `'${option}'` : String(option)).join(' | ')
    if (control === 'boolean') return 'boolean'
    if (control === 'object') return 'object'
    if (typeof control === 'object') return 'number'
    return 'string'
}

function definitionFor(tag: string, property: string, category: string): StoryControl {
    const options = property === 'valueFormatter' ? Object.keys(formatterMapping) : optionsFor(tag, property)
    const control = controlFor(tag, property)
    const taggedDefault = taggedDefaults[tag]?.[property]
    const defaultSummary = taggedDefault === undefined
        ? defaultSummaries[property] ?? "''"
        : typeof taggedDefault === 'string' ? `'${taggedDefault}'` : String(taggedDefault)
    return {
        control,
        ...(options ? { options } : {}),
        ...(property === 'valueFormatter' ? { mapping: formatterMapping } : {}),
        description: descriptionFor(tag, property),
        table: {
            category,
            type: { summary: typeSummary(tag, property, control, options) },
            defaultValue: { summary: defaultSummary },
        },
    }
}

interface ControlLayer {
    readonly category: string
    readonly attributes: readonly string[]
}

function componentTitle(tag: string): string {
    const words = tag.replace(/^cb-/, '').split('-')
    return words.map((word, index) => index === 0 ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word).join(' ')
}

function familyTitle(constructor: ObservedElementConstructor): string {
    return `${constructor.name.replace(/Base$/, '').replace(/([a-z])([A-Z])/g, '$1 $2')} family`
}

function parentConstructor(constructor: ObservedElementConstructor): ObservedElementConstructor | null {
    return Object.getPrototypeOf(constructor) as ObservedElementConstructor | null
}

function controlLayers(tag: string, constructor: ObservedElementConstructor, wrapper = false): readonly ControlLayer[] {
    const layers: ControlLayer[] = []
    const componentBase = parentConstructor(constructor)
    let current: ObservedElementConstructor | null = constructor
    while (current && current !== Function.prototype) {
        const parent = parentConstructor(current)
        if (Object.hasOwn(current, 'observedAttributes')) {
            const inherited = new Set(parent?.observedAttributes ?? [])
            const attributes = (current.observedAttributes ?? []).filter(attribute => !inherited.has(attribute))
            if (attributes.length) {
                const category = current === Component
                    ? 'Component'
                    : wrapper
                        ? 'Field wrapper'
                        : current === componentBase || current === constructor
                            ? componentTitle(tag)
                            : familyTitle(current)
                layers.push({ category, attributes })
            }
        }
        if (current === Component) break
        current = parent
    }
    return layers
}

function objectDefault(tag: string, property: string): object | null | undefined {
    if (tag === 'cb-table' && property === 'columns') return []
    if (property === 'xAxis' || property === 'yAxis') return {}
    if (property === 'theme' && tag !== 'cb-theme-provider') return {}
    if (property === 'theme' || property === 'visibleSegments' || property === 'visibleSeries') return null
    if (property === 'series') return tag === 'cb-pie-chart' ? null : []
    if (property === 'rect') return { x: 0, y: 0, width: 120, height: 80 }
    if (property === 'handleLabels') return {}
    if (objectProperties.has(property)) return []
    return undefined
}

function defaultValueFor(tag: string, property: string): StoryValue | undefined {
    const tagged = taggedDefaults[tag]?.[property]
    if (tagged !== undefined) return tagged
    if (property === 'valueFormatter') return null
    if (property === 'value' && numericValueTags.has(tag)) return 0
    if (property === 'value' && colorValueTags.has(tag)) return '#000000'
    if (cssDimensionTags.has(tag) && ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'].includes(property)) return ''
    if ((property === 'min' || property === 'max') && dateBoundTags.has(tag)) return ''
    const structured = objectDefault(tag, property)
    if (structured !== undefined) return structured
    const primitive = primitiveDefaults[property]
    if (primitive !== undefined) return primitive
    return controlFor(tag, property) === 'text' ? '' : undefined
}

export function storyArgsFor(tag: string, args: StoryArgs): StoryArgs {
    const defaults: StoryArgs = {}
    for (const property of Object.keys(controlsFor(tag))) {
        const value = defaultValueFor(tag, property)
        if (value !== undefined || property === 'pressed') defaults[property] = value
    }
    return { ...defaults, ...args }
}

export function controlsFor(tag: string): StoryArgTypes {
    const constructor = customElements.get(tag) as ObservedElementConstructor | undefined
    if (!constructor) throw new Error(`Cannot create Storybook controls before ${tag} is registered`)
    const fieldConstructor = fieldControlTags.has(tag) ? customElements.get('cb-field') as ObservedElementConstructor | undefined : undefined
    const controls: StoryArgTypes = {}
    const layers = [
        ...controlLayers(tag, constructor).filter(layer => layer.category !== 'Component'),
        ...(fieldConstructor ? controlLayers('cb-field', fieldConstructor, true).filter(layer => layer.category !== 'Component') : []),
        ...controlLayers(tag, constructor).filter(layer => layer.category === 'Component'),
    ]
    for (const layer of layers) {
        for (const attribute of layer.attributes) {
            const property = attributeToProperty(attribute)
            if (controls[property]) continue
            controls[property] = definitionFor(tag, property, layer.category)
        }
    }
    return controls
}

export function componentStory(tag: string, args: StoryArgs): StoryObj {
    return {
        args: storyArgsFor(tag, args),
        argTypes: controlsFor(tag),
        parameters: { componentTag: tag },
        render: storyArgs => preview(tag, storyArgs),
    }
}
