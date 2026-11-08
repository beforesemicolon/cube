import { expect } from '@playwright/test'
import type { Timeline } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-timeline', 'editor--timeline', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"duration":2000,"currentTime":500} satisfies Partial<Timeline>) })
    await expect(host.locator("[part=ruler]")).toHaveAttribute("aria-valuenow", "500")
    for (const button of await host.locator('cb-button').all()) {
        const label = await button.getAttribute('accessible-label')
        expect(label).toBeTruthy()
        await expect(button).toHaveAttribute('title', label!)
    }
    await host.evaluate(node => { (node as Timeline).playing = true })
    await expect(host.locator('[part=play]')).toHaveAttribute('title', 'Pause timeline')
    await host.evaluate(node => { (node as Timeline).playing = false })
    await expect(host.locator('[part=play]')).toHaveAttribute('title', 'Play timeline')
})
