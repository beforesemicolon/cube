import { expect } from '@playwright/test'
import type { ContextMenu } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-context-menu', 'overlay--context-menu', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<ContextMenu>) })
    await expect(host.getByRole('menu')).toBeVisible()
    await host.evaluate(node => {
        Object.assign(node, { x: window.innerWidth - 4, y: window.innerHeight - 4,
            items: Array.from({ length: 40 }, (_, index) => ({ id: `command-${index}`, label: `Command ${index}` })),
        } satisfies Partial<ContextMenu>)
    })
    const bounds = await host.getByRole('menu').boundingBox()
    expect(bounds).not.toBeNull()
    const viewport = await host.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }))
    expect(bounds!.x).toBeGreaterThanOrEqual(8)
    expect(bounds!.y).toBeGreaterThanOrEqual(8)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width - 7)
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height - 7)
    await host.getByRole('menuitem', { name: 'Command 39', exact: true }).scrollIntoViewIfNeeded()
    await expect(host.getByRole('menuitem', { name: 'Command 39', exact: true })).toBeInViewport()
})
