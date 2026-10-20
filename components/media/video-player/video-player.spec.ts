import { expect } from '@playwright/test'
import type { VideoPlayer } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-video-player', 'media--video', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"mediaTitle":"Release media"} satisfies Partial<VideoPlayer>) })
    await expect(host.locator("[part=title]")).toHaveText("Release media")
})
