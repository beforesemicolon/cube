import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { ActionItem } from '../components/core/items.js'
import { html, state } from '../components/core/runtime.js'
import exampleStyles from './sidebar-menu.css?inline'
import './setup.js'

const meta: Meta = { title: 'Examples' }
export default meta

const navigation: ActionItem[] = [
    { id: 'websites', label: 'Websites', icon: 'globe' },
    { id: 'projects', label: 'Projects', icon: 'folder' },
    { id: 'tasks', label: 'Tasks', icon: 'checkSquare' },
    { id: 'notes', label: 'Notes', icon: 'file' },
    { id: 'team', label: 'Team', icon: 'users' },
    { id: 'clients', label: 'Clients', icon: 'users' },
    { id: 'inventory', label: 'Inventory', icon: 'collection' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'reminders', label: 'Reminders', icon: 'clock' },
    { id: 'billing', label: 'Billing', icon: 'receipt' },
    { id: 'email', label: 'Email', icon: 'mail' },
    { id: 'profile', label: 'Profile', icon: 'users' },
    { id: 'faqs', label: 'FAQs', icon: 'help' },
    { id: 'reviews', label: 'Reviews', icon: 'spark' },
    { id: 'assets', label: 'Assets', icon: 'image' },
    { id: 'documents', label: 'Documents', icon: 'file' },
]
const account: ActionItem[] = [
    { id: 'plan', label: 'Plan', icon: 'receipt' },
    { id: 'connectors', label: 'Connectors', icon: 'workflow' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
]

export const SidebarNavigation: StoryObj = {
    name: 'Layout / Sidebar navigation',
    parameters: {
        docs: {
            description: {
                story: 'Application state coordinates the sidebar width and menu variants. The example supplies its own collapse button because the sidebar’s built-in disclosure hides its content completely. Menu action events update the active item and page heading.',
            },
        },
    },
    render: () => {
        const [expanded, setExpanded] = state(true)
        const [active, setActive] = state('websites')
        const variant = () => expanded() ? 'both' : 'icon'
        const select = (event: CustomEvent<{ id: string }>): void => {
            event.stopPropagation()
            setActive(event.detail.id)
        }
        const root = document.createElement('div')
        root.className = 'cube-sidebar-navigation'
        html`
            <style>${exampleStyles}</style>
            <cb-sidebar label="Navigation" accessible-label="Application navigation"
                data-navigation-collapsed=${() => expanded() ? null : ''}>
                <div class="sidebar-navigation-content">
                    <cb-button variant="ghost" icon="layoutRow" icon-only=${() => !expanded()}
                        label="Collapse" accessible-label=${() => expanded() ? 'Collapse navigation' : 'Expand navigation'}
                        aria-expanded=${() => String(expanded())}
                        onaction=${() => setExpanded(!expanded())}></cb-button>
                    <cb-menu accessible-label="Main navigation" items=${navigation}
                        active=${active} variant=${variant} gap="4px" onaction=${select}></cb-menu>
                    <cb-menu accessible-label="Account navigation" items=${account}
                        active=${active} variant=${variant} gap="4px" onaction=${select}></cb-menu>
                </div>
            </cb-sidebar>
            <main>
                <cb-heading label=${() => [...navigation, ...account].find(item => item.id === active())?.label ?? ''}
                    description="Select a menu item or collapse the navigation."></cb-heading>
            </main>
        `.render(root)
        return root
    },
}
