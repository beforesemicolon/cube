import { expect } from '@playwright/test'
import type { Calendar } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-calendar', 'form--calendar', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":"2026-10-21"} satisfies Partial<Calendar>) })
    await expect(host.locator('[part=month]')).toContainText('October 2026')
})
