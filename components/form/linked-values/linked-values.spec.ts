import { expect } from '@playwright/test'
import type { LinkedValues } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-linked-values', 'form--linked-values', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { values: '42,24', fieldLabels: 'Width,Height', names: 'width,height', linked: false } satisfies Partial<LinkedValues>) })
    await expect(host.locator('input[type=number]').nth(0)).toHaveValue('42')
    await expect(host.locator('input[type=number]').nth(1)).toHaveValue('24')
})
