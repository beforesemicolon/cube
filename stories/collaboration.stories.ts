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
