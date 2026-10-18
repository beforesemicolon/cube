import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/collaboration/index.js'

const meta: Meta = { title: 'Collaboration', tags: ['autodocs'], parameters: { docs: { description: { component: 'Collaboration components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Presence: Story = { args: { label: 'Presence', items }, render: (args, context) => preview('cb-presence', args, context.globals.appearance) }

export const RemoteCursor: Story = { args: { label: 'Remote cursor', accessibleLabel: 'Remote cursor canvas' }, render: (args, context) => preview('cb-remote-cursor', args, context.globals.appearance) }

export const CommentPin: Story = { args: { label: 'Comment pin', accessibleLabel: 'Comment pin canvas' }, render: (args, context) => preview('cb-comment-pin', args, context.globals.appearance) }

export const CommentThread: Story = { args: { label: 'Comment thread', items }, render: (args, context) => preview('cb-comment-thread', args, context.globals.appearance) }

export const Annotation: Story = { args: { label: 'Annotation', items }, render: (args, context) => preview('cb-annotation', args, context.globals.appearance) }

export const ReviewStatus: Story = { args: { label: 'Review status', value: 'Ready', status: 'Updated' }, render: (args, context) => preview('cb-review-status', args, context.globals.appearance) }

export const SuggestedChange: Story = { args: { label: 'Suggested change', items }, render: (args, context) => preview('cb-suggested-change', args, context.globals.appearance) }

export const AICommand: Story = { args: { label: 'AI command', value: '12 px', placeholder: 'AI command' }, render: (args, context) => preview('cb-ai-command', args, context.globals.appearance) }

export const AIActionMenu: Story = { args: { label: 'AI action menu', value: 'one', items }, render: (args, context) => preview('cb-ai-action-menu', args, context.globals.appearance) }

export const AISelectionToolbar: Story = { args: { label: 'AI selection toolbar', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-ai-selection-toolbar', args, context.globals.appearance) }

export const DiffPreview: Story = { args: { label: 'Diff preview', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-diff-preview', args, context.globals.appearance) }

export const AcceptReject: Story = { args: { label: 'Accept reject', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-accept-reject', args, context.globals.appearance) }

export const Generation: Story = { args: { label: 'Generation', progress: 64, max: 100, status: '64%' }, render: (args, context) => preview('cb-generation', args, context.globals.appearance) }

export const Conflict: Story = { args: { label: 'Conflict', value: 'Ready', status: 'Updated' }, render: (args, context) => preview('cb-conflict', args, context.globals.appearance) }

export const Approval: Story = { args: { label: 'Approval', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-approval', args, context.globals.appearance) }
