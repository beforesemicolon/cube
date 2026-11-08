import { expect } from '@playwright/test'
import type { Checkbox } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-checkbox', 'form--checkbox', async ({ host }) => {
    await host.evaluate(node => {
        Object.assign(node, {
            checked: true,
            indeterminate: true,
            description: 'Includes archived projects',
        } satisfies Partial<Checkbox>)
    })
    await expect(host.locator('input[type=checkbox]')).toBeChecked()
    await expect(host.locator('input[type=checkbox]')).toHaveJSProperty('indeterminate', true)
    await expect(host.locator('[part~=choice-description]')).toHaveText('Includes archived projects')

    await host.evaluate(node => { (node as Checkbox).indeterminate = false })
    await expect(host.locator('input[type=checkbox]')).toHaveJSProperty('indeterminate', false)

    await host.evaluate(node => { (node as Checkbox).indeterminate = true })
    await host.locator('input[type=checkbox]').click()
    await expect(host).toHaveJSProperty('indeterminate', false)
    await expect(host.locator('input[type=checkbox]')).toHaveJSProperty('indeterminate', false)
})
