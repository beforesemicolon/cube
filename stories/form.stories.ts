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

export const UnitInput: Story = componentStory('cb-unit-input', { label: 'Unit input', value: 24, min: 0, max: 100, step: 1, unitLabel: 'Unit' })

export const Combobox: Story = componentStory('cb-combobox', { label: 'Font family', placeholder: 'Search fonts', toggleLabel: 'Toggle options', emptyLabel: 'No fonts found', open: false, autocomplete: 'list', options: [{ value: 'inter', label: 'Inter' }, { value: 'source-sans', label: 'Source Sans 3' }] })

export const MultiSelect: Story = componentStory('cb-multi-select', { label: 'Multi select', value: 'one', items })

export const Checkbox: Story = componentStory('cb-checkbox', { label: 'Checkbox', checked: true })

export const Radio: Story = componentStory('cb-radio', { label: 'Radio', checked: true })

export const Switch: Story = componentStory('cb-switch', { label: 'Switch', checked: true })

export const RangeSlider: Story = componentStory('cb-range-slider', { label: 'Range slider', value: 64, min: 0, max: 100, step: 1 })

export const Stepper: Story = componentStory('cb-stepper', { label: 'Stepper', value: 24, min: 0, max: 100, step: 1, decrementLabel: 'Decrease', incrementLabel: 'Increase' })

export const DatePicker: Story = componentStory('cb-date-picker', { label: 'Date picker', value: '2026-10-18', placeholder: 'Choose a date', previousLabel: 'Previous month', nextLabel: 'Next month', native: false, open: false, min: '', max: '' })

export const TimePicker: Story = componentStory('cb-time-picker', { label: 'Time picker', value: '09:30', placeholder: 'Choose a time', step: 1800, native: false, open: false, min: '', max: '' })

export const FilePicker: Story = componentStory('cb-file-picker', { label: 'File picker', fileLabel: 'Choose a file', fileRequirements: 'Select a file from your device' })

export const TokenInput: Story = componentStory('cb-token-input', { label: 'Token input', items })

export const EditableLabel: Story = componentStory('cb-editable-label', { label: 'Editable label', value: '12 px', placeholder: 'Editable label' })

export const MaskedInput: Story = componentStory('cb-masked-input', { label: 'Masked input', value: '12 px', placeholder: 'Masked input' })

export const Select: Story = componentStory('cb-select', { label: 'Select', value: 'desktop', placeholder: 'Choose a device', native: false, open: false, multiple: false, options: [{ value: 'desktop', label: 'Desktop' }, { value: 'mobile', label: 'Mobile' }] })

export const Slider: Story = componentStory('cb-slider', { label: 'Opacity', value: 64, min: 0, max: 100, step: 1, valueText: '64%', orientation: 'horizontal' })

export const Calendar: Story = componentStory('cb-calendar', { label: 'Calendar', value: '2026-10-18', firstDayOfWeek: 0, min: '', max: '', previousLabel: 'Previous month', nextLabel: 'Next month' })
