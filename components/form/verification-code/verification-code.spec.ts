import { expect } from '@playwright/test'
import { componentContract } from '../../../tests/component-contract.js'
import type { VerificationCode } from './index.js'

componentContract('cb-verification-code', 'form--verification-code', async ({ host }) => {
    await expect(host.locator('[part=cell]')).toHaveCount(6)
    const input = host.locator('input[aria-label="Verification code"]')
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code')
    await input.fill('012345')
    await expect(host).toHaveJSProperty('value', '012345')
    await expect(host.locator('[part=cell]')).toHaveText(['0','1','2','3','4','5'])
    await host.evaluate(node => { Object.assign(node, { pin: true } satisfies Partial<VerificationCode>) })
    await input.press('Tab')
    await expect(host.locator('[part=cell]')).toHaveText(['•','•','•','•','•','•'])
})
