import { expect } from '@playwright/test'
import type { TimePicker } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-time-picker', 'form--time-picker', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"native":true,"value":"12:30"} satisfies Partial<TimePicker>) })
    await expect(host.locator("input[type=time]").first()).toHaveValue("12:30")
})
