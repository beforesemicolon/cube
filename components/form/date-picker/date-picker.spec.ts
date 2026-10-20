import { expect } from '@playwright/test'
import type { DatePicker } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-date-picker', 'form--date-picker', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"native":true,"value":"2026-10-21"} satisfies Partial<DatePicker>) })
    await expect(host.locator("input[type=date]").first()).toHaveValue("2026-10-21")
})
