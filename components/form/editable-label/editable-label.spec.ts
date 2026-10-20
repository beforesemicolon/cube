import { expect } from '@playwright/test'
import type { EditableLabel } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-editable-label', 'form--editable-label', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":"Release title","editing":false} satisfies Partial<EditableLabel>) })
    await expect(host.getByText("Release title", { exact: true }).first()).toBeVisible()
})
