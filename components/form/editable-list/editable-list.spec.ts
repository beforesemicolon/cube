import { expect } from '@playwright/test'
import type { EditableList } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-editable-list', 'form--editable-list', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release item","value":"release"}]} satisfies Partial<EditableList>) })
    await expect(host.locator("[part=item-label]")).toHaveText("Release item")
})
