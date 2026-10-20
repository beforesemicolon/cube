import { expect } from '@playwright/test'
import type { AudioPlayer } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-audio-player', 'media--audio', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"mediaTitle":"Release media"} satisfies Partial<AudioPlayer>) })
    await expect(host.locator("[part=title]")).toHaveText("Release media")
})
