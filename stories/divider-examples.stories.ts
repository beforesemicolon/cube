import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, repeat } from '../components/core/runtime.js'
import './setup.js'

export default { title: 'Examples' } satisfies Meta

export const LabeledDividers: StoryObj = {
    name: 'Layout / Divider labels and line styles',
    render: () => {
        const root = document.createElement('div')
        root.style.maxInlineSize = '640px'
        html`<cb-col gap="24px">
            ${repeat(['solid', 'dotted', 'dashed', 'double'], variant => html`<cb-col gap="16px">
                <cb-heading label=${variant} variant="h4" size="sm"></cb-heading>
                <cb-divider label="Section" variant=${variant}></cb-divider>
                <cb-divider label="Section" label-position="center" variant=${variant}></cb-divider>
                <cb-divider label="Section" label-position="end" variant=${variant}></cb-divider>
                <cb-divider variant=${variant}></cb-divider>
            </cb-col>`)}
        </cb-col>`.render(root)
        return root
    },
}

export const VerticalLabeledDividers: StoryObj = {
    name: 'Layout / Vertical labeled dividers',
    render: () => {
        const root = document.createElement('div')
        html`<cb-row gap="32px" style="height:180px">
            <cb-divider stacked label="Start"></cb-divider>
            <cb-divider stacked label="Center" label-position="center" variant="dotted"></cb-divider>
            <cb-divider stacked label="End" label-position="end" variant="dashed"></cb-divider>
            <cb-divider stacked variant="double"></cb-divider>
        </cb-row>`.render(root)
        return root
    },
}
