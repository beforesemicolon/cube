import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { ActionItem } from '../components/core/items.js'
import { html, state } from '../components/core/runtime.js'
import exampleStyles from './menu-layouts.css?inline'
import './setup.js'

export default { title: 'Examples' } satisfies Meta

const items: ActionItem[] = [
    { id: 'projects', label: 'Projects', icon: 'briefcase', group: 'Workspace' },
    { id: 'tasks', label: 'Tasks', icon: 'check-square', group: 'Workspace' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', group: 'Workspace' },
    { id: 'settings', label: 'Settings', icon: 'gear', group: 'Account' },
]

export const MenuLayouts: StoryObj = {
    name: 'Navigation / Compact and horizontal menus',
    parameters: {
        docs: {
            description: {
                story: 'Icon menus use compact square controls and hide divider labels. Menus are stacked by default; stacked=false lays out a horizontal menu with vertical separators and Left/Right keyboard navigation. The existing Sidebar navigation example shows an expandable rail.',
            },
        },
    },
    render: () => {
        const [active, setActive] = state('projects')
        const select = (event: CustomEvent<{ id: string }>): void => {
            event.stopPropagation()
            setActive(event.detail.id)
        }
        const root = document.createElement('div')
        root.className = 'cube-menu-layouts'
        html`<style>${exampleStyles}</style><cb-col gap="24px">
            <cb-heading label="Compact sidebar menu" size="sm"></cb-heading>
            <cb-menu accessible-label="Compact sidebar" variant="icon"
                items=${items} active=${active} onaction=${select}></cb-menu>
            <cb-heading label="Horizontal menu" size="sm"></cb-heading>
            <cb-menu accessible-label="Horizontal navigation" stacked="false"
                items=${items} active=${active} onaction=${select}></cb-menu>
            <cb-heading label="Mobile icon menu" size="sm"></cb-heading>
            <cb-menu accessible-label="Mobile navigation" variant="icon" stacked="false"
                items=${items} active=${active} onaction=${select}></cb-menu>
        </cb-col>`.render(root)
        return root
    },
}
