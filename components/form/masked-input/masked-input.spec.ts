import { expect } from '@playwright/test'
import type { MaskedInput } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-masked-input', 'form--masked-input', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { mask: '999-999', value: '123456' } satisfies Partial<MaskedInput>) })
    await expect(host.locator("input:not([type=hidden])").first()).toHaveValue("123-456")
    await host.evaluate(node => node.setAttribute('mask', '999999'))
    await expect(host.getByRole('textbox')).toHaveValue('123456')
    await host.getByRole('textbox').fill('654321')
    await expect(host.getByRole('textbox')).toHaveValue('654321')
})
