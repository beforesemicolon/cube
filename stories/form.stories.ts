import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/form/index.js'

const meta: Meta = { title: 'Form', tags: ['autodocs'], parameters: { docs: { description: { component: 'Form components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const TextInput: Story = { args: { label: 'Text input', value: '12 px', placeholder: 'Text input' }, render: (args, context) => preview('cb-text-input', args, context.globals.appearance) }

export const Textarea: Story = { args: { label: 'Textarea', value: 'Editable content' }, render: (args, context) => preview('cb-textarea', args, context.globals.appearance) }

export const NumberInput: Story = { args: { label: 'Number input', value: 24, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-number-input', args, context.globals.appearance) }

export const UnitInput: Story = { args: { label: 'Unit input', value: 24, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-unit-input', args, context.globals.appearance) }

export const Combobox: Story = { args: { label: 'Font family', placeholder: 'Search fonts', open: false, autocomplete: 'list', options: [{ value: 'inter', label: 'Inter' }, { value: 'source-sans', label: 'Source Sans 3' }] }, render: (args, context) => preview('cb-combobox', args, context.globals.appearance) }

export const MultiSelect: Story = { args: { label: 'Multi select', value: 'one', items }, render: (args, context) => preview('cb-multi-select', args, context.globals.appearance) }

export const Checkbox: Story = { args: { label: 'Checkbox', checked: true }, render: (args, context) => preview('cb-checkbox', args, context.globals.appearance) }

export const Radio: Story = { args: { label: 'Radio', checked: true }, render: (args, context) => preview('cb-radio', args, context.globals.appearance) }

export const Switch: Story = { args: { label: 'Switch', checked: true }, render: (args, context) => preview('cb-switch', args, context.globals.appearance) }

export const RangeSlider: Story = { args: { label: 'Range slider', value: 64, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-range-slider', args, context.globals.appearance) }

export const Stepper: Story = { args: { label: 'Stepper', value: 24, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-stepper', args, context.globals.appearance) }

export const DatePicker: Story = { args: { label: 'Date picker', value: '2026-10-18', native: false, open: false }, render: (args, context) => preview('cb-date-picker', args, context.globals.appearance) }

export const TimePicker: Story = { args: { label: 'Time picker', value: '09:30', step: 1800, native: false, open: false, min: '', max: '' }, render: (args, context) => preview('cb-time-picker', args, context.globals.appearance) }

export const FilePicker: Story = { args: { label: 'File picker' }, render: (args, context) => preview('cb-file-picker', args, context.globals.appearance) }

export const TokenInput: Story = { args: { label: 'Token input', items }, render: (args, context) => preview('cb-token-input', args, context.globals.appearance) }

export const EditableLabel: Story = { args: { label: 'Editable label', value: '12 px', placeholder: 'Editable label' }, render: (args, context) => preview('cb-editable-label', args, context.globals.appearance) }

export const MaskedInput: Story = { args: { label: 'Masked input', value: '12 px', placeholder: 'Masked input' }, render: (args, context) => preview('cb-masked-input', args, context.globals.appearance) }

export const Select: Story = { args: { label: 'Select', value: 'desktop', placeholder: 'Choose a device', native: false, open: false, multiple: false, options: [{ value: 'desktop', label: 'Desktop' }, { value: 'mobile', label: 'Mobile' }] }, render: (args, context) => preview('cb-select', args, context.globals.appearance) }

export const Slider: Story = { args: { label: 'Slider', value: 64, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-slider', args, context.globals.appearance) }

export const Calendar: Story = { args: { label: 'Calendar', value: '2026-10-18', firstDayOfWeek: 0, min: '', max: '' }, render: (args, context) => preview('cb-calendar', args, context.globals.appearance) }
