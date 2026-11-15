import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '../components/core/runtime.js'
import './setup.js'

export default { title: 'Examples' } satisfies Meta

const items = [
    { id: 'notifications', label: 'Notifications', description: 'In-app, email and SMS alerts', icon: 'bell' },
    { id: 'danger', label: 'Danger Zone', description: 'Irreversible actions', icon: 'shieldCheck' },
]

function settingsTabs(stacked: boolean, fill = false): HTMLElement {
    const root = document.createElement('div')
    root.style.maxInlineSize = '960px'
    html`<cb-tabs accessible-label="Account settings" value="notifications" items=${items} stacked=${stacked} fill=${fill}>
        <p slot="notifications">Choose which notifications you receive.</p>
        <p slot="danger">Manage account removal and other irreversible actions.</p>
    </cb-tabs>`.render(root)
    return root
}

export const SettingsTabs: StoryObj = {
    name: 'Navigation / Tabs with icons and descriptions',
    render: () => settingsTabs(false),
}

export const StackedSettingsTabs: StoryObj = {
    name: 'Navigation / Stacked tabs with icons and descriptions',
    render: () => settingsTabs(true),
}

export const FilledSettingsTabs: StoryObj = {
    name: 'Navigation / Tabs filling available width',
    render: () => settingsTabs(false, true),
}
