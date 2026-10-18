import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/collaboration/index.js'

const meta: Meta = { title: 'Collaboration', tags: ['autodocs'], parameters: { docs: { description: { component: 'Collaboration components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Presence: Story = componentStory('cb-presence', { label: 'Presence', items })

export const RemoteCursor: Story = componentStory('cb-remote-cursor', { label: 'Remote cursor', accessibleLabel: 'Remote cursor canvas' })

export const CommentPin: Story = componentStory('cb-comment-pin', { label: 'Comment pin', accessibleLabel: 'Comment pin canvas' })

export const CommentThread: Story = componentStory('cb-comment-thread', { label: 'Comment thread', items })
