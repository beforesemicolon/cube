import { expect } from '@playwright/test'
import type { ResizablePanel } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-resizable-panel', 'layout--resizable-panel', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":240} satisfies Partial<ResizablePanel>) })
    await expect(host).toHaveCSS("width", "240px")
})
