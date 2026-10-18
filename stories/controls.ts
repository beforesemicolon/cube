import type { StoryObj } from '@storybook/web-components-vite'
import { iconPaths } from '../components/icons/paths.js'
import { preview } from './helpers.js'

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
    'autoplay', 'busy', 'checked', 'closeOnBackdrop', 'decorative', 'destructive', 'disabled', 'dismissible',
    'expanded', 'formNoValidate', 'invalid', 'inverted', 'loading', 'loop', 'multi', 'multiple', 'muted', 'native',
    'open', 'patterns', 'popupExpanded', 'pressed', 'readOnly', 'required', 'reverse', 'wrap', 'zoomable',
])

const numberProperties = new Set([
    'delay', 'firstDayOfWeek', 'height', 'max', 'maxItems', 'maxVisible', 'min', 'page', 'playbackRate',
    'progress', 'searchThreshold', 'seekStep', 'selectionCount', 'siblings', 'step', 'totalPages', 'x', 'y',
])

const objectProperties = new Set([
    'items', 'messages', 'options', 'series', 'theme', 'tracks', 'units', 'visibleSegments', 'visibleSeries',
    'xAxis', 'yAxis',
])

const stateProperties = new Set([
    'busy', 'checked', 'disabled', 'expanded', 'invalid', 'loading', 'multi', 'multiple', 'native', 'open', 'pressed',
    'readOnly', 'required', 'status',
])

const layoutProperties = new Set([
    'align', 'autoFlow', 'background', 'blockSize', 'border', 'collapseAt', 'columns', 'gap', 'inlineSize',
    'justify', 'margin', 'maxBlockSize', 'maxInlineSize', 'minBlockSize', 'minInlineSize', 'orientation',
    'overflow', 'padding', 'radius', 'reverse', 'rows', 'size', 'wrap',
])

const dataProperties = new Set([
    'items', 'messages', 'options', 'series', 'theme', 'tracks', 'units', 'value', 'visibleSegments',
    'visibleSeries', 'xAxis', 'yAxis',
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
    modalSize: ['sm', 'md', 'lg', 'full'],
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
    'cb-button': { variant: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] },
    'cb-button-group': { variant: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] },
    'cb-link': { variant: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] },
    'cb-toggle-button': { variant: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] },
    'cb-cartesian-chart': { status: ['finished', 'loading', 'error'], stacking: [false, 'normal'] },
    'cb-pie-chart': { status: ['finished', 'loading', 'error'], variant: ['pie', 'donut'] },
}

const numberControls: Readonly<Record<string, NumberControl>> = {
    delay: { type: 'number', min: 0, max: 5000, step: 50 },
    firstDayOfWeek: { type: 'number', min: 0, max: 6, step: 1 },
    height: { type: 'number', min: 160, max: 1200, step: 10 },
    maxItems: { type: 'number', min: 1, step: 1 },
    maxVisible: { type: 'number', min: 1, max: 20, step: 1 },
    page: { type: 'number', min: 1, step: 1 },
    playbackRate: { type: 'number', min: 0.25, max: 4, step: 0.25 },
    progress: { type: 'number', min: 0, max: 100, step: 1 },
    seekStep: { type: 'number', min: 1, max: 60, step: 1 },
    searchThreshold: { type: 'number', min: 0, step: 1 },
    selectionCount: { type: 'number', min: 0, step: 1 },
    siblings: { type: 'number', min: 0, max: 5, step: 1 },
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
    code: 'Source code displayed by the preview.',
    codeLanguage: 'Syntax language passed to the highlighter.',
    description: 'Supporting text associated with the component.',
    disabled: 'Prevents interaction and exposes the disabled state.',
    emptyLabel: 'Localized message displayed when no content is available.',
    error: 'Visible validation or error message.',
    errorText: 'Validation message announced and displayed for the field.',
    firstDayOfWeek: 'Weekday used as the first calendar column, from 0 (Sunday) through 6 (Saturday).',
    icon: 'Icon name displayed by the control.',
    items: 'Editable item collection. Add, remove, reorder, label, value, or disable entries here.',
    label: 'Visible component label.',
    menuLabel: 'Accessible label for the split button menu trigger.',
    messages: 'Editable Flashbar notification queue.',
    native: 'Uses the browser-native control instead of the themed Cube renderer.',
    open: 'Controls whether the popup or overlay is open.',
    options: 'Editable option collection. Add, remove, relabel, value, or disable options here.',
    placeholder: 'Hint displayed when the component has no value.',
    multi: 'Allows more than one option to be selected while keeping the dropdown open.',
    searchable: 'Shows search automatically above the threshold, or forces it on or off.',
    searchThreshold: 'Option count above which automatic search is displayed.',
    searchLabel: 'Accessible label for the option filter field.',
    searchPlaceholder: 'Placeholder displayed in the option filter field.',
    readOnly: 'Prevents edits while preserving focus and value exposure.',
    required: 'Marks the value as required for form validation.',
    series: 'Editable chart series and data points.',
    theme: 'Site-builder-compatible theme definition applied as CSS variables.',
    tracks: 'Editable caption-track collection for media playback.',
    unit: 'Current unit displayed beside the numeric value.',
    unitLabel: 'Accessible label for the unit selector.',
    units: 'Editable units the user can choose from. A single unit is displayed as a static suffix.',
    value: 'Current controlled value.',
    valueFormatter: 'Storybook formatter preset used for chart values.',
    visibleSegments: 'Controlled list of visible pie or donut segment IDs.',
    visibleSeries: 'Controlled list of visible Cartesian series IDs.',
    xAxis: 'Editable Cartesian x-axis configuration.',
    yAxis: 'Editable Cartesian y-axis configuration.',
}

const defaultSummaries: Readonly<Record<string, string>> = {
    activation: 'automatic', align: 'stretch', appearance: 'system', autoFlow: 'row', autocomplete: 'list',
    autoplay: 'false', busy: 'false', checked: 'false', closeOnBackdrop: 'true', collapseAt: "''",
    crossOrigin: "''", decorative: 'false', destructive: 'false', disabled: 'false', dismissible: 'true',
    expanded: 'false', firstDayOfWeek: '0', height: 'auto', invalid: 'false', items: '[]',
    loading: 'false', loop: 'false', max: '100', maxVisible: '4', messages: '[]', min: '0',
    modalSize: 'md', multi: 'false', multiple: 'false', muted: 'false', native: 'false', open: 'false', options: '[]',
    orientation: 'horizontal', patterns: 'false', placement: 'bottom-start', playbackRate: '1', position: 'top-end',
    preload: 'metadata', progress: '0', readOnly: 'false', required: 'false', reverse: 'false', searchable: 'auto', searchThreshold: '10', seekStep: '10',
    series: '[]', size: 'sm', status: 'finished', step: '1', theme: 'null', tracks: '[]', units: '[]', value: "''",
    visibleSegments: 'null', visibleSeries: 'null', wrap: 'false', xAxis: '{}', yAxis: '{}', zoomable: 'false',
}

const primitiveDefaults: Readonly<Record<string, string | number | boolean | null>> = {
    accessibleLabel: '', actionLabel: '', actionValue: '', activation: 'automatic', align: 'stretch', appearance: 'system',
    autoFlow: 'row', autocomplete: 'list', autoplay: false, background: '', blockSize: '', border: '', busy: false,
    cancelLabel: '', checked: false, closeLabel: '', closeOnBackdrop: true, code: '', codeLanguage: 'html', collapseAt: '', columns: '',
    confirmLabel: '', content: '', copiedLabel: '', copyLabel: '', crossOrigin: '', decorative: false, delay: 0,
    description: '', destructive: false, disabled: false, dismissible: true, download: '', emptyLabel: '', error: '',
    errorText: '', expanded: false, firstDayOfWeek: 0, formNoValidate: false, gap: '', heading: '', height: 320,
    href: '', icon: '', inlineSize: '', innerDescription: '', innerTitle: '', invalid: false, justify: 'stretch',
    keys: '', label: '', loading: false, loop: false, margin: '', max: 100, maxBlockSize: '', maxInlineSize: '',
    maxItems: 4, maxVisible: 4, mediaTitle: '', menuLabel: '', min: 0, minBlockSize: '', minInlineSize: '',
    modalSize: 'md', multi: false, multiple: false, muted: false, name: '', native: false, open: false, orientation: 'horizontal',
    overflow: '', padding: '', page: 1, patterns: false, placement: 'bottom-start', placeholder: '', playbackRate: 1,
    popupControls: '', popupExpanded: false, popupType: '', position: 'top-end', poster: '', preload: 'metadata', searchLabel: '', searchable: 'auto', searchPlaceholder: '', searchThreshold: 10,
    pressed: false, progress: 0, query: '', radius: '', readOnly: false, required: false, reverse: false, rows: '',
    seekStep: 10, selectionCount: 0, siblings: 1, size: 'sm', src: '', status: '', step: 1, target: '_self',
    totalPages: 1, type: 'button', unit: '', unitLabel: '', value: '', valueText: '', wrap: false, x: 0, y: 0, zoomable: false,
}

const taggedDefaults: Readonly<Record<string, Readonly<Record<string, StoryValue>>>> = {
    'cb-button': { variant: 'secondary' },
    'cb-button-group': { variant: 'secondary' },
    'cb-link': { variant: 'secondary' },
    'cb-toggle-button': { variant: 'secondary' },
    'cb-cartesian-chart': { status: 'finished', stacking: false, inverted: false },
    'cb-pie-chart': { status: 'finished', variant: 'pie' },
    'cb-grid': { columns: 'minmax(0, 1fr)', autoFlow: 'row' },
}

const numericValueTags = new Set([
    'cb-number-input', 'cb-unit-input', 'cb-range-slider', 'cb-slider', 'cb-stepper',
])

const colorValueTags = new Set(['cb-color-picker', 'cb-color-swatch', 'cb-eyedropper'])
const dateBoundTags = new Set(['cb-calendar', 'cb-date-picker', 'cb-time-picker'])

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

function categoryFor(property: string): string {
    if (property === 'accessibleLabel' || property === 'searchLabel' || property === 'unitLabel') return 'Accessibility'
    if (stateProperties.has(property)) return 'State'
    if (layoutProperties.has(property)) return 'Layout'
    if (dataProperties.has(property)) return 'Data'
    return 'Content and behavior'
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
    if ((property === 'min' || property === 'max') && dateBoundTags.has(tag)) return 'text'
    if (optionsFor(tag, property)) return 'select'
    if (booleanProperties.has(property)) return 'boolean'
    if (numberProperties.has(property)) return numberControl(property)
    if (objectProperties.has(property)) return 'object'
    return 'text'
}

function typeSummary(tag: string, property: string, control: StoryControl['control'], options: readonly ControlOption[] | undefined): string {
    if (property === 'valueFormatter') return '(value: number) => string'
    if (property === 'items') return 'Item[]'
    if (property === 'options') return 'SelectOption[]'
    if (property === 'units') return 'UnitOption[]'
    if (property === 'series') return tag === 'cb-pie-chart' ? 'PieSeries' : 'Series[]'
    if (property === 'tracks') return 'CaptionTrack[]'
    if (property === 'messages') return 'FlashbarMessage[]'
    if (property === 'theme') return 'ThemeDefinition | null'
    if (property === 'xAxis' || property === 'yAxis') return 'Axis | Axis[]'
    if (property === 'visibleSeries' || property === 'visibleSegments') return 'string[] | null'
    if (options) return options.map(option => typeof option === 'string' ? `'${option}'` : String(option)).join(' | ')
    if (control === 'boolean') return 'boolean'
    if (control === 'object') return 'object'
    if (typeof control === 'object') return 'number'
    return 'string'
}

function definitionFor(tag: string, property: string): StoryControl {
    const options = property === 'valueFormatter' ? Object.keys(formatterMapping) : optionsFor(tag, property)
    const control = controlFor(tag, property)
    return {
        control,
        ...(options ? { options } : {}),
        ...(property === 'valueFormatter' ? { mapping: formatterMapping } : {}),
        description: descriptions[property] ?? `Controls the ${humanize(property)} property.`,
        table: {
            category: categoryFor(property),
            type: { summary: typeSummary(tag, property, control, options) },
            defaultValue: { summary: defaultSummaries[property] ?? "''" },
        },
    }
}

function objectDefault(tag: string, property: string): object | null | undefined {
    if (property === 'xAxis' || property === 'yAxis') return {}
    if (property === 'theme' && tag !== 'cb-theme-provider') return {}
    if (property === 'theme' || property === 'visibleSegments' || property === 'visibleSeries') return null
    if (property === 'series') return tag === 'cb-pie-chart' ? null : []
    if (objectProperties.has(property)) return []
    return undefined
}

function defaultValueFor(tag: string, property: string): StoryValue | undefined {
    const tagged = taggedDefaults[tag]?.[property]
    if (tagged !== undefined) return tagged
    if (property === 'valueFormatter') return null
    if (property === 'value' && numericValueTags.has(tag)) return 0
    if (property === 'value' && colorValueTags.has(tag)) return '#000000'
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
        if (value !== undefined) defaults[property] = value
    }
    return { ...defaults, ...args }
}

export function controlsFor(tag: string): StoryArgTypes {
    const constructor = customElements.get(tag) as ObservedElementConstructor | undefined
    if (!constructor) throw new Error(`Cannot create Storybook controls before ${tag} is registered`)
    const controls: StoryArgTypes = {}
    for (const attribute of new Set(constructor.observedAttributes ?? [])) {
        const property = attributeToProperty(attribute)
        controls[property] = definitionFor(tag, property)
    }
    return controls
}

export function componentStory(tag: string, args: StoryArgs): StoryObj {
    return {
        args: storyArgsFor(tag, args),
        argTypes: controlsFor(tag),
        parameters: { componentTag: tag },
        render: (storyArgs, context) => preview(tag, storyArgs, context.globals.appearance),
    }
}
