import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import './setup.js'

const meta: Meta = { title: 'Collaboration', tags: ['autodocs'], parameters: { docs: { description: { component: 'Collaboration components with headless bases, themed parts, category initialization and browser clients.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]
const collaborators = [
    { id:'elson', label:'Elson Correia', initials:'EC', status:'online', statusLabel:'Online', accessibleLabel:'Elson Correia, online' },
    { id:'maya', label:'Maya Adams', initials:'MA', status:'online', statusLabel:'Online', accessibleLabel:'Maya Adams, online' },
    { id:'ana', label:'Ana Martins', initials:'AM', status:'idle', statusLabel:'Idle', accessibleLabel:'Ana Martins, idle' },
    { id:'noah', label:'Noah Williams', initials:'NW', status:'offline', statusLabel:'Offline', accessibleLabel:'Noah Williams, offline' },
    { id:'sofia', label:'Sofia Chen', initials:'SC', status:'online', statusLabel:'Online', accessibleLabel:'Sofia Chen, online' },
]

export const Presence: Story = componentStory('cb-presence', {
    accessibleLabel: 'Active collaborators', items: collaborators, maxVisible: 2, summary: '5 participants',
    overflowLabel: '{count} more participants', emptyLabel: 'No active collaborators',
})

export const RemoteCursor: Story = componentStory('cb-remote-cursor', { label: 'Remote cursor', accessibleLabel: 'Remote cursor canvas' })

export const CommentPin: Story = componentStory('cb-comment-pin', { label: 'Comment pin', accessibleLabel: 'Comment pin canvas' })

export const CommentThread: Story = componentStory('cb-comment-thread', { label: 'Comment thread', items })
