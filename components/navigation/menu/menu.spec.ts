import { expect } from '@playwright/test'
import type { Menu } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-menu', 'navigation--menu', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release menu","type":"checkbox","checked":true}]} satisfies Partial<Menu>) })
    await expect(host.getByRole('menuitemcheckbox', { name: 'Release menu' })).toHaveAttribute('aria-checked', 'true')
})
