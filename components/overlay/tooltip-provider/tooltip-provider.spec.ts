import { expect } from '@playwright/test'
import type { TooltipProvider } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-tooltip-provider', 'overlay--tooltip-provider', async ({ host }) => {
    await host.getByRole('button', { name: 'Save document', exact: true }).hover()
    await expect(host.getByRole('tooltip')).toBeVisible()
    await expect(host.getByRole('tooltip')).toHaveText('Save document')
    await host.evaluate(node => { (node as TooltipProvider).enabled = false })
    await expect(host.getByRole('tooltip')).toBeHidden()
})
