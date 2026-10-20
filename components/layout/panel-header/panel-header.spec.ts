import { expect } from '@playwright/test'
import type { PanelHeader } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-panel-header', 'layout--panel-header', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"label":"Release heading"} satisfies Partial<PanelHeader>) })
    await expect(host.getByText("Release heading", { exact: true }).first()).toBeVisible()
})
