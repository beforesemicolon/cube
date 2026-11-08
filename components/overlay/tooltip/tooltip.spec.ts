import { expect, test } from '@playwright/test'
import type { Tooltip } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-tooltip', 'overlay--tooltip', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true,"content":"Release tooltip"} satisfies Partial<Tooltip>) })
    await expect(host.getByRole('tooltip')).toContainText('Release tooltip')
})

test('tooltip supports edge-aligned top and bottom placements', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-tooltip')))
    await page.evaluate(() => {
        const fixture = document.getElementById('fixture')!
        for (const placement of ['top-start', 'top-end', 'bottom-start', 'bottom-end'] as const) {
            const tooltip = document.createElement('cb-tooltip') as Tooltip
            tooltip.id = placement
            Object.assign(tooltip, { content: placement, placement, open: true } satisfies Partial<Tooltip>)
            const trigger = document.createElement('button')
            trigger.textContent = placement
            tooltip.append(trigger)
            fixture.append(tooltip)
        }
    })

    for (const placement of ['top-start', 'top-end', 'bottom-start', 'bottom-end']) {
        const host = page.locator(`#${placement}`)
        await expect(host).toHaveAttribute('data-placement', placement)
        await expect(host.getByRole('tooltip')).toBeVisible()
    }
})
