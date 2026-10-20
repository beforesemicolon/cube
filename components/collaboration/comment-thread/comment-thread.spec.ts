import { expect } from '@playwright/test'
import type { CommentThread } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-comment-thread', 'collaboration--comment-thread', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release comment"}]} satisfies Partial<CommentThread>) })
    await expect(host.getByText("Release comment", { exact: true }).first()).toBeVisible()
})
