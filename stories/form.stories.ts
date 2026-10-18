import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/form/index.js'

const meta: Meta = { title: 'Form', tags: ['autodocs'], parameters: { docs: { description: { component: 'Form components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const TextInput: Story = componentStory('cb-text-input', { label: 'Text input', value: '12 px', placeholder: 'Text input' })

export const Textarea: Story = componentStory('cb-textarea', { label: 'Textarea', value: 'Editable content' })

export const NumberInput: Story = componentStory('cb-number-input', { label: 'Number input', value: 24, min: 0, max: 100, step: 1 })

export const UnitInput: Story = componentStory('cb-unit-input', { label: 'Unit input', value: 24, min: 0, max: 100, step: 1, unit: 'px', units: [{ value: 'px', label: 'px' }, { value: '%', label: '%' }, { value: 'rem', label: 'rem' }, { value: 'vw', label: 'vw' }], unitLabel: 'Unit' })

export const Combobox: Story = componentStory('cb-combobox', { label: 'Font family', placeholder: 'Search fonts', toggleLabel: 'Toggle options', emptyLabel: 'No fonts found', open: false, autocomplete: 'list', options: [{ value: 'inter', label: 'Inter' }, { value: 'source-sans', label: 'Source Sans 3' }] })

export const Checkbox: Story = componentStory('cb-checkbox', { label: 'Checkbox', checked: true })

export const RadioGroup: Story = componentStory('cb-radio-group', { label: 'Publishing access', value: 'team', orientation: 'vertical', options: [{ value: 'private', label: 'Only me' }, { value: 'team', label: 'Project members' }, { value: 'public', label: 'Anyone with the link' }] })

export const Switch: Story = componentStory('cb-switch', { label: 'Switch', checked: true })

export const RangeSlider: Story = componentStory('cb-range-slider', { label: 'Range slider', value: 64, min: 0, max: 100, step: 1 })

export const Stepper: Story = componentStory('cb-stepper', { label: 'Stepper', value: 24, min: 0, max: 100, step: 1, decrementLabel: 'Decrease', incrementLabel: 'Increase' })

export const DatePicker: Story = componentStory('cb-date-picker', { label: 'Date picker', value: '2026-10-18', placeholder: 'Choose a date', previousLabel: 'Previous month', nextLabel: 'Next month', native: false, open: false, min: '', max: '' })

export const TimePicker: Story = componentStory('cb-time-picker', { label: 'Time picker', value: '09:30', placeholder: 'Choose a time', step: 1800, native: false, open: false, min: '', max: '' })

export const FilePicker: Story = componentStory('cb-file-picker', { label: 'File picker', fileLabel: 'Choose a file', fileRequirements: 'Select a file from your device' })

export const TokenInput: Story = componentStory('cb-token-input', { label: 'Token input', items })

export const EditableLabel: Story = componentStory('cb-editable-label', {
    label: 'Layer name', accessibleLabel: 'Layer name', value: 'Hero section', placeholder: 'Untitled layer', editing: false,
    selectOnEdit: true, submitOnBlur: true, editLabel: 'Edit {value}', saveLabel: 'Save layer name', cancelLabel: 'Cancel editing', emptyLabel: 'Untitled layer',
})

export const MaskedInput: Story = componentStory('cb-masked-input', {
    label: 'US phone number', accessibleLabel: 'US phone number', description: 'Type digits. The mask formats the display as (617) 555-0142 while the submitted value omits punctuation.', value: '',
    mask: '(999) 999-9999', placeholder: 'Phone number', maskPlaceholder: '•', guide: true, unmask: true, inputMode: 'tel', autocomplete: 'tel',
})

export const Select: Story = componentStory('cb-select', { label: 'Select', value: 'desktop', placeholder: 'Choose a device', native: false, open: false, multi: false, searchable: 'auto', searchThreshold: 10, searchLabel: 'Filter options', searchPlaceholder: 'Search options', emptyLabel: 'No matching options', options: [{ value: 'desktop', label: 'Desktop' }, { value: 'tablet', label: 'Tablet' }, { value: 'mobile', label: 'Mobile' }, { value: 'watch', label: 'Watch' }, { value: 'television', label: 'Television' }, { value: 'laptop', label: 'Laptop' }, { value: 'desktop-wide', label: 'Wide desktop' }, { value: 'tablet-landscape', label: 'Landscape tablet' }, { value: 'phone-small', label: 'Small phone' }, { value: 'phone-large', label: 'Large phone' }, { value: 'kiosk', label: 'Kiosk' }] })

export const Slider: Story = componentStory('cb-slider', { label: 'Opacity', value: 64, min: 0, max: 100, step: 1, valueText: '64%', orientation: 'horizontal' })

export const Calendar: Story = componentStory('cb-calendar', { label: 'Calendar', value: '2026-10-18', firstDayOfWeek: 0, min: '', max: '', previousLabel: 'Previous month', nextLabel: 'Next month' })

export const Field: Story = componentStory('cb-field', {
    label: 'Project name', description: 'Used in the workspace and published URL.', helpText: 'Choose a short, recognizable name.',
    detailsLabel: 'Naming guidance', details: 'Names can contain letters, numbers, spaces, and hyphens.', optionalLabel: 'Optional',
    errorText: '', successText: '', required: false, invalid: false, success: false,
})

export const EditableList: Story = componentStory('cb-editable-list', {
    label: 'Redirect paths', description: 'Add, rename, remove, or reorder paths.', placeholder: '/new-path',
    items: [
        { id: 'home', label: '/home', value: '/home', description: 'Homepage alias' },
        { id: 'pricing', label: '/pricing', value: '/pricing', description: 'Pricing campaign' },
    ],
    minItems: 1, maxItems: 8, allowReorder: true, addLabel: 'Add path', editLabel: 'Edit {item}', saveLabel: 'Save',
    cancelLabel: 'Cancel', removeLabel: 'Remove {item}', moveUpLabel: 'Move {item} up', moveDownLabel: 'Move {item} down',
    emptyLabel: 'No redirect paths', inputLabel: 'Redirect path', minimumItemsError: 'Keep at least one path.', maximumItemsError: 'The path limit has been reached.',
})

export const CodeEditor: Story = componentStory('cb-code-editor', {
    label: 'Validation function', description: 'Edit the source, indent with Tab, and submit with Command or Control + Enter.',
    language: 'typescript', lineNumbers: true, wrap: false, tabSize: 2, minLines: 10, maxLines: 28,
    positionLabel: 'Line {line}, column {column}', submitLabel: 'Run validation', placeholder: 'Enter TypeScript',
    value: [
        'type Project = { id: string; pages: readonly string[] }',
        '',
        'export function isPublishable(project: Project): boolean {',
        "  const validId = /^cube-[a-z0-9-]+$/i.test(project.id)",
        '  return validId && project.pages.length > 0',
        '}',
    ].join('\n'),
})

export const JsonEditor: Story = componentStory('cb-json-editor', {
    label: 'Theme overrides', description: 'Edit and format a structured configuration.', indent: 2, lineNumbers: true, wrap: false,
    formatLabel: 'Format JSON', validLabel: 'Valid JSON', invalidLabel: 'Invalid JSON: {error}', positionLabel: 'Line {line}, column {column}',
    placeholder: 'Enter JSON', value: JSON.stringify({ appearance: 'dark', radius: { sm: '6px', md: '10px' }, features: ['responsive', 'accessible'] }, null, 2),
})

export const LinkedValues: Story = componentStory('cb-linked-values', {
    label: 'Dimensions', accessibleLabel: 'Linked width and height', firstValue: 320, secondValue: 180, firstName: 'width', secondName: 'height',
    firstLabel: 'Width', secondLabel: 'Height', linked: true, min: 0, max: 4096, step: 1, linkLabel: 'Link dimensions', unlinkLabel: 'Unlink dimensions',
})
