import { expect } from '@playwright/test'
import type { ResizablePanel } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-resizable-panel', 'layout--resizable-panel', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { value: 240, defaultValue: 360, variant: 'plain', collapseAt: 700 } satisfies Partial<ResizablePanel>) })
    await expect(host).toHaveCSS("width", "240px")
    await expect(host).toHaveAttribute('data-variant', 'plain')
    await host.locator('[part~=resize-handle]').dblclick()
    await expect(host).toHaveCSS('width', '360px')

    await host.evaluate(node => {
        const parent = node.parentElement
        if (parent) parent.style.width = '600px'
        Object.assign(node, {
            value: 500,
            min: 180,
            max: 640,
            maxRatio: 0.5,
        } satisfies Partial<ResizablePanel>)
    })

    await expect(host).toHaveCSS('width', '300px')
    await expect(host.locator('[part~=resize-handle]')).toHaveAttribute(
        'aria-valuemax',
        '300'
    )
})
