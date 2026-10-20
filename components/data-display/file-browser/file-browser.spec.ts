import { expect } from '@playwright/test'
import type { FileBrowser } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-file-browser', 'data-display--file-browser', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"query":"tokens"} satisfies Partial<FileBrowser>) })
    await expect(host.locator('[part~=entry]')).toHaveCount(1)
    await expect(host.getByText('tokens.json', { exact: true })).toBeVisible()
})
