import { expect, test } from '@playwright/test'
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

test('grid variants supply columns until the caller sets an explicit track list', async ({
    page,
}) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-grid')))
    await page.evaluate(() => {
        const fixture = document.querySelector('#fixture')!
        for (const [id, variant, width] of [
            ['plain', '', '800px'],
            ['cards-wide', 'cards', '800px'],
            ['cards-narrow', 'cards', '220px'],
            ['masonry', 'masonry', '800px'],
            ['sidebar', 'sidebar', '800px'],
            ['holy-grail', 'holy-grail', '800px'],
        ]) {
            const grid = document.createElement('cb-grid')
            grid.id = id
            grid.style.inlineSize = width
            if (variant) grid.setAttribute('variant', variant)
            for (let i = 0; i < 3; i++) {
                const item = document.createElement('div')
                item.textContent = String(i + 1)
                grid.append(item)
            }
            fixture.append(grid)
        }
    })

    const trackCount = (count: number) =>
        new RegExp('^(?:[\\d.]+px ){' + (count - 1) + '}[\\d.]+px$')
    await expect(page.locator('#plain')).toHaveCSS('grid-template-columns', trackCount(1))
    await expect(page.locator('#cards-narrow')).toHaveCSS('grid-template-columns', trackCount(1))
    await expect(page.locator('#cards-wide')).toHaveCSS('grid-template-columns', trackCount(3))
    await expect(page.locator('#masonry')).toHaveCSS('grid-template-columns', trackCount(3))
    await expect(page.locator('#sidebar')).toHaveCSS('grid-template-columns', trackCount(2))
    await expect(page.locator('#holy-grail')).toHaveCSS('grid-template-columns', trackCount(3))

    const wide = page.locator('#cards-wide')
    await wide.evaluate((node) =>
        node.setAttribute('columns', 'minmax(0, 1fr)')
    )
    await expect(wide).toHaveCSS('grid-template-columns', trackCount(1))
    await wide.evaluate((node) => {
        node.setAttribute('template-columns', '100px 200px')
    })
    await expect(wide).toHaveCSS('grid-template-columns', '100px 200px')
    await wide.evaluate((node) => {
        node.removeAttribute('template-columns')
        node.removeAttribute('columns')
    })
    await expect(wide).toHaveCSS('grid-template-columns', trackCount(3))
})
