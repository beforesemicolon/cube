import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/editor/index.js'

const meta: Meta = { title: 'Editor', tags: ['autodocs'], parameters: { docs: { description: { component: 'Editor components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Viewport: Story = { args: { label: 'Viewport', accessibleLabel: 'Viewport canvas' }, render: (args, context) => preview('cb-viewport', args, context.globals.appearance) }

export const Artboard: Story = { args: { label: 'Artboard', accessibleLabel: 'Artboard canvas' }, render: (args, context) => preview('cb-artboard', args, context.globals.appearance) }

export const SelectionBox: Story = { args: { label: 'Selection box', accessibleLabel: 'Selection box canvas' }, render: (args, context) => preview('cb-selection-box', args, context.globals.appearance) }

export const ResizeHandle: Story = { args: { label: 'Resize handle', accessibleLabel: 'Resize handle canvas' }, render: (args, context) => preview('cb-resize-handle', args, context.globals.appearance) }

export const RotationHandle: Story = { args: { label: 'Rotation handle', accessibleLabel: 'Rotation handle canvas' }, render: (args, context) => preview('cb-rotation-handle', args, context.globals.appearance) }

export const MultiSelection: Story = { args: { label: 'Multi selection', accessibleLabel: 'Multi selection canvas' }, render: (args, context) => preview('cb-multi-selection', args, context.globals.appearance) }

export const HoverOutline: Story = { args: { label: 'Hover outline', accessibleLabel: 'Hover outline canvas' }, render: (args, context) => preview('cb-hover-outline', args, context.globals.appearance) }

export const SmartGuides: Story = { args: { label: 'Smart guides', accessibleLabel: 'Smart guides canvas' }, render: (args, context) => preview('cb-smart-guides', args, context.globals.appearance) }

export const SnapLines: Story = { args: { label: 'Snap lines', accessibleLabel: 'Snap lines canvas' }, render: (args, context) => preview('cb-snap-lines', args, context.globals.appearance) }

export const Rulers: Story = { args: { label: 'Rulers', accessibleLabel: 'Rulers canvas' }, render: (args, context) => preview('cb-rulers', args, context.globals.appearance) }

export const GridOverlay: Story = { args: { label: 'Grid overlay', accessibleLabel: 'Grid overlay canvas' }, render: (args, context) => preview('cb-grid-overlay', args, context.globals.appearance) }

export const SpacingMeasure: Story = { args: { label: 'Spacing measure', accessibleLabel: 'Spacing measure canvas' }, render: (args, context) => preview('cb-spacing-measure', args, context.globals.appearance) }

export const AlignmentGuide: Story = { args: { label: 'Alignment guide', accessibleLabel: 'Alignment guide canvas' }, render: (args, context) => preview('cb-alignment-guide', args, context.globals.appearance) }

export const DropIndicator: Story = { args: { label: 'Drop indicator', accessibleLabel: 'Drop indicator canvas' }, render: (args, context) => preview('cb-drop-indicator', args, context.globals.appearance) }

export const DragPreview: Story = { args: { label: 'Drag preview', accessibleLabel: 'Drag preview canvas' }, render: (args, context) => preview('cb-drag-preview', args, context.globals.appearance) }

export const Zoom: Story = { args: { label: 'Zoom', value: 64, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-zoom', args, context.globals.appearance) }

export const Pan: Story = { args: { label: 'Pan', accessibleLabel: 'Pan canvas' }, render: (args, context) => preview('cb-pan', args, context.globals.appearance) }

export const Cursor: Story = { args: { label: 'Cursor', accessibleLabel: 'Cursor canvas' }, render: (args, context) => preview('cb-cursor', args, context.globals.appearance) }

export const InlineText: Story = { args: { label: 'Inline text', value: '12 px', placeholder: 'Inline text' }, render: (args, context) => preview('cb-inline-text', args, context.globals.appearance) }

export const Marquee: Story = { args: { label: 'Marquee', accessibleLabel: 'Marquee canvas' }, render: (args, context) => preview('cb-marquee', args, context.globals.appearance) }

export const Insertion: Story = { args: { label: 'Insertion', accessibleLabel: 'Insertion canvas' }, render: (args, context) => preview('cb-insertion', args, context.globals.appearance) }

export const CanvasMenu: Story = { args: { label: 'Canvas menu', value: 'one', items }, render: (args, context) => preview('cb-canvas-menu', args, context.globals.appearance) }

export const ComponentOutline: Story = { args: { label: 'Component outline', accessibleLabel: 'Component outline canvas' }, render: (args, context) => preview('cb-component-outline', args, context.globals.appearance) }

export const LockOverlay: Story = { args: { label: 'Lock overlay', accessibleLabel: 'Lock overlay canvas' }, render: (args, context) => preview('cb-lock-overlay', args, context.globals.appearance) }

export const HiddenIndicator: Story = { args: { label: 'Hidden indicator', accessibleLabel: 'Hidden indicator canvas' }, render: (args, context) => preview('cb-hidden-indicator', args, context.globals.appearance) }

export const DeviceFrame: Story = { args: { label: 'Device frame', accessibleLabel: 'Device frame canvas' }, render: (args, context) => preview('cb-device-frame', args, context.globals.appearance) }

export const PropertiesInspector: Story = { args: { label: 'Properties inspector', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-properties-inspector', args, context.globals.appearance) }

export const PropertyGroup: Story = { args: { label: 'Property group', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-property-group', args, context.globals.appearance) }

export const MultiValue: Story = { args: { label: 'Multi value', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-multi-value', args, context.globals.appearance) }

export const LinkedDimension: Story = { args: { label: 'Linked dimension', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-linked-dimension', args, context.globals.appearance) }

export const UnitConversion: Story = { args: { label: 'Unit conversion', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-unit-conversion', args, context.globals.appearance) }

export const Expression: Story = { args: { label: 'Expression', value: '12 px', placeholder: 'Expression' }, render: (args, context) => preview('cb-expression', args, context.globals.appearance) }

export const VariableBinding: Story = { args: { label: 'Variable binding', value: 'one', items }, render: (args, context) => preview('cb-variable-binding', args, context.globals.appearance) }

export const ResponsiveOverride: Story = { args: { label: 'Responsive override', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-responsive-override', args, context.globals.appearance) }

export const StateSelector: Story = { args: { label: 'State selector', value: 'one', items }, render: (args, context) => preview('cb-state-selector', args, context.globals.appearance) }

export const PseudoState: Story = { args: { label: 'Pseudo state', value: 'one', items }, render: (args, context) => preview('cb-pseudo-state', args, context.globals.appearance) }

export const Transition: Story = { args: { label: 'Transition', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-transition', args, context.globals.appearance) }

export const Easing: Story = { args: { label: 'Easing', value: 'one', items }, render: (args, context) => preview('cb-easing', args, context.globals.appearance) }

export const Bezier: Story = { args: { label: 'Bezier', accessibleLabel: 'Bezier canvas' }, render: (args, context) => preview('cb-bezier', args, context.globals.appearance) }

export const Timeline: Story = { args: { label: 'Timeline', accessibleLabel: 'Timeline canvas' }, render: (args, context) => preview('cb-timeline', args, context.globals.appearance) }

export const Keyframe: Story = { args: { label: 'Keyframe', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-keyframe', args, context.globals.appearance) }

export const Trigger: Story = { args: { label: 'Trigger', value: 'one', items }, render: (args, context) => preview('cb-trigger', args, context.globals.appearance) }

export const ConditionalVisibility: Story = { args: { label: 'Conditional visibility', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-conditional-visibility', args, context.globals.appearance) }

export const DataBinding: Story = { args: { label: 'Data binding', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-data-binding', args, context.globals.appearance) }

export const ActionEditor: Story = { args: { label: 'Action editor', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-action-editor', args, context.globals.appearance) }

export const Constraints: Story = { args: { label: 'Constraints', value: 'one', items }, render: (args, context) => preview('cb-constraints', args, context.globals.appearance) }

export const DesignCode: Story = { args: { label: 'Design code', value: 'one', items }, render: (args, context) => preview('cb-design-code', args, context.globals.appearance) }

export const VersionHistory: Story = { args: { label: 'Version history', value: 'one', items }, render: (args, context) => preview('cb-version-history', args, context.globals.appearance) }
