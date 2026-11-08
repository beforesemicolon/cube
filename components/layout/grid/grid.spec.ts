import { expect } from '@playwright/test'
import type { Grid } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-grid', 'layout--grid', async ({ host }) => {
    await host.evaluate(node => {
        Object.assign(node, { gap: '20px', columns: 'repeat(3,minmax(0,1fr))', minBlockSize: '120px', empty: true } satisfies Partial<Grid>)
        const emptyState = document.createElement('cb-empty-state')
        emptyState.textContent = 'Nothing here'
        node.append(emptyState)
    })
    await expect(host).toHaveCSS("gap", "20px")
    await expect(host).toHaveAttribute('data-empty', '')
    await expect(host).toHaveCSS('align-items', 'center')
    await expect(host).toHaveCSS('justify-items', 'center')
    await expect(host.locator('cb-empty-state')).toHaveCSS('grid-column-start', '1')
    await expect(host.locator('cb-empty-state')).toHaveCSS('grid-column-end', '-1')
    await host.evaluate(node => { (node as Grid).empty = false })
    await expect(host).not.toHaveAttribute('data-empty')
    await expect(host).toHaveCSS('align-items', 'stretch')
})
