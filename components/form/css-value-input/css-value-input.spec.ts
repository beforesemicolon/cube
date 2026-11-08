import { expect } from '@playwright/test'
import type { CssValueInput } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-css-value-input', 'form--css-value-input', async ({ host, page }) => {
    await host.evaluate(node => { Object.assign(node, { value: 'min(100%, 720px)', accessibleLabel: 'Width', unitLabel: 'Width unit', argumentLabel: 'Width value {index}' } satisfies Partial<CssValueInput>) })
    await expect(host.getByRole('combobox', { name: 'Width', exact: true })).toHaveValue('min')
    await expect(host.getByRole('combobox', { name: 'Width value 1', exact: true })).toHaveValue('100')
    await expect(host.getByRole('combobox', { name: 'Width value 2', exact: true })).toHaveValue('720')
    // The default field wrapper is shrink-to-fit: values must remain usable without a host width.
    expect((await host.boundingBox())!.width).toBeGreaterThanOrEqual(280)
    for (const name of ['Width value 1', 'Width value 2']) {
        expect((await host.getByRole('combobox', { name, exact: true }).boundingBox())!.width).toBeGreaterThan(30)
    }
    await page.screenshot({ path: '/tmp/cube-css-value-input-default.png' })
    await page.setViewportSize({ width: 240, height: 600 })
    expect((await host.boundingBox())!.width).toBeLessThanOrEqual(240)
    expect(await host.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
})
