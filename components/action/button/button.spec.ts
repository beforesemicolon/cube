import { expect } from '@playwright/test'
import type { Button } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-button', 'action--button', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { size: 'tiny', icon: 'close', iconOnly: true, accessibleLabel: 'Close', variant: 'ghost', pressed: false } satisfies Partial<Button>) })
    const tiny = host.getByRole('button', { name: 'Close', exact: true })
    await expect(tiny).toHaveCSS('padding', '1px')
    await expect(tiny).toHaveCSS('height', '14px')
    await expect(host.locator('cb-icon')).toHaveCSS('font-size', '10px')
    await tiny.click()
    await expect(tiny).toHaveAttribute('aria-pressed', 'true')
    await host.evaluate(node => { Object.assign(node, { size: 'sm', icon: '', iconOnly: false, accessibleLabel: '', variant: 'secondary', pressed: undefined } satisfies Partial<Button>) })
    await expect(host.locator('[part="indicator"]')).toBeHidden()
    await host.evaluate(node => { Object.assign(node, { label: 'Inputs', indicator: true, indicatorLabel: 'Edited instance inputs' } satisfies Partial<Button>) })
    await expect(host.locator('[part="indicator"]')).toBeVisible()
    await expect(host.getByRole('button', { name: 'Inputs' })).toHaveAttribute('aria-description', 'Edited instance inputs')
    await expect(host.locator('[part="indicator"]')).toHaveCSS('width', '5px')
    await host.evaluate(node => { Object.assign(node, { indicator: false } satisfies Partial<Button>) })
    await expect(host.locator('[part="indicator"]')).toBeHidden()
    await host.evaluate(node => { Object.assign(node, {"label":"Release action","loading":true} satisfies Partial<Button>) })
    await expect(host.getByRole('button', { name: 'Release action' })).toBeDisabled()
})
