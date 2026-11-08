import { expect } from '@playwright/test'
import type { VideoPlayer } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-video-player', 'media--video', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"mediaTitle":"Release media"} satisfies Partial<VideoPlayer>) })
    await expect(host.locator("[part=title]")).toHaveText("Release media")
    for (const button of await host.locator('cb-button:is([part=backward],[part=play],[part=stop],[part=forward],[part=mute],[part=fullscreen])').all()) {
        const label = await button.getAttribute('accessible-label')
        expect(label).toBeTruthy()
        await expect(button).toHaveAttribute('title', label!)
    }
    await expect(host.locator('[part=rate]')).toHaveAttribute('title', 'Playback speed')
    await expect(host.locator('[part=captions]')).toHaveAttribute('title', 'Captions')
    await host.evaluate(node => { (node as VideoPlayer).setMuted(true) })
    await expect(host.locator('[part=mute]')).toHaveAttribute('title', 'Unmute')
    await host.evaluate(node => { (node as VideoPlayer).setMuted(false) })
    await expect(host.locator('[part=mute]')).toHaveAttribute('title', 'Mute')
})
