import { expect } from '@playwright/test'
import type { CommentPin } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-comment-pin', 'collaboration--comment-pin', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"accessibleLabel":"Release marker"} satisfies Partial<CommentPin>) })
    await expect(host.locator("[role=region]")).toHaveAttribute("aria-label", "Release marker")
})
