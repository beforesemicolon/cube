import { expect } from '@playwright/test'
import type { Divider } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-divider', 'layout--divider', async ({ host }) => {
    await expect(host).toHaveAttribute('data-size', 'md')
    await expect(host).toHaveCSS('height', '2px')
    for (const stacked of [false, true]) {
        await host.evaluate((node, stacked) => { Object.assign(node, { stacked } satisfies Partial<Divider>) }, stacked)
        for (const [size, thickness] of [['tiny', 1], ['xs', 1], ['sm', 1], ['md', 2], ['lg', 3], ['xl', 4]] as const) {
            await host.evaluate((node, size) => node.setAttribute('size', size), size)
            await expect(host).toHaveCSS(stacked ? 'width' : 'height', `${thickness}px`)
        }
        await host.evaluate(node => node.style.setProperty('--component-divider-thickness', '5px'))
        await expect(host).toHaveCSS(stacked ? 'width' : 'height', '5px')
        await host.evaluate(node => node.style.removeProperty('--component-divider-thickness'))
    }
})
