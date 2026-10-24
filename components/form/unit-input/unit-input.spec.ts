import { expect } from '@playwright/test'
import type { UnitInput } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-unit-input', 'form--unit-input', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":42} satisfies Partial<UnitInput>) })
    await expect(host.locator("input[type=number]").first()).toHaveValue("42")
    await host.evaluate(node => {
        node.style.setProperty('--component-studio-control-width', '112px')
        node.style.setProperty('--component-studio-control-min-width', '0px')
        Object.assign(node, { units: ['px', 'rem'], unit: 'px', unitLabel: 'Length unit' } satisfies Partial<UnitInput>)
    })
    await expect.poll(() => host.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
    expect((await host.locator('input[type=number]').boundingBox())!.width).toBeGreaterThanOrEqual(50)
    const selector = host.locator('cb-select[part~=unit-select]')
    await expect(selector.locator('cb-icon[part~=indicator]')).toBeHidden()
    const shortWidth = await selector.evaluate(node => node.getBoundingClientRect().width)
    expect(shortWidth).toBeLessThan(44)
    await host.getByRole('button', { name: 'Length unit: px', exact: true }).click()
    await host.getByRole('option', { name: 'rem', exact: true }).click()
    await expect(host.getByRole('button', { name: 'Length unit: rem', exact: true })).toBeVisible()
    await host.evaluate(node => {
        Object.assign(node, { units: ['rem', { value: 'mm', label: 'millimeters' }, 'em'], unit: 'mm' } satisfies Partial<UnitInput>)
    })
    await expect(host.getByRole('button', { name: 'Length unit: millimeters', exact: true })).toBeVisible()
    await expect.poll(() => selector.evaluate(node => node.getBoundingClientRect().width)).toBeGreaterThan(shortWidth + 20)
    await expect.poll(() => selector.locator('[part~=value]').evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
    await host.getByRole('button', { name: 'Length unit: millimeters', exact: true }).click()
    await host.getByRole('option', { name: 'em', exact: true }).click()
    await expect(host).toHaveJSProperty('unit', 'em')
    await expect.poll(() => selector.evaluate(node => node.getBoundingClientRect().width)).toBeLessThanOrEqual(shortWidth + 1)
    await expect(host.locator('input[type=number]')).toHaveValue('42')
    await host.evaluate(node => { Object.assign(node, { units: [], unit: 'rem' } satisfies Partial<UnitInput>) })
    await expect(host.locator('[part~=unit-static]')).toBeVisible()
    const staticWidth = await host.locator('[part~=unit-static]').evaluate(node => node.getBoundingClientRect().width)
    expect(staticWidth).toBeLessThan(44)
})
