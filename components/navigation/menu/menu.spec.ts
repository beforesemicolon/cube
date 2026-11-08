import { expect } from '@playwright/test'
import type { Menu } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-menu', 'navigation--menu', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[
        {"id":"release","label":"Release menu","type":"checkbox","checked":true},
        {"id":"delete","label":"Delete release","group":"danger","tone":"danger"},
    ]} satisfies Partial<Menu>) })
    await expect(host.getByRole('menuitemcheckbox', { name: 'Release menu' })).toHaveAttribute('aria-checked', 'true')
    await expect(host.locator('[part=separator]')).toHaveCount(1)
    await expect(host.getByRole('menuitem', { name: 'Delete release' })).toHaveAttribute('data-tone', 'danger')
})
