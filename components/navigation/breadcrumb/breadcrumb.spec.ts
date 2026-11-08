import { expect } from '@playwright/test'
import type { Breadcrumb } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-breadcrumb', 'navigation--breadcrumb', async ({ host, page }) => {
    await host.evaluate(node => { Object.assign(node, { items: [
        { id: 'home', label: 'Primary item' },
        { id: 'section', label: 'Secondary item', href: '#section' },
        { id: 'current', label: 'Current item', icon: 'file' },
    ] } satisfies Partial<Breadcrumb>) })
    const current = host.locator('[part=current]')
    await expect(current).toBeVisible()
    const center = (await current.boundingBox())!
    const centerY = center.y + center.height / 2
    for (const selector of ['[part=separator]', '[part=separator] [part=icon]', '[part=link]', '[part=current] cb-icon']) {
        for (const element of await host.locator(selector).all()) {
            const bounds = (await element.boundingBox())!
            expect(bounds.y + bounds.height / 2).toBeCloseTo(centerY, 0)
        }
    }
    await page.screenshot({ path: '/tmp/cube-breadcrumb-alignment.png' })
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release crumb"}]} satisfies Partial<Breadcrumb>) })
    await expect(host.getByText("Release crumb", { exact: true }).first()).toBeVisible()
})
