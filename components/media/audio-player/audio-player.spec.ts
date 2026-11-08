import { expect } from '@playwright/test'
import type { AudioPlayer } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-audio-player', 'media--audio', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"mediaTitle":"Release media"} satisfies Partial<AudioPlayer>) })
    await expect(host.locator("[part=title]")).toHaveText("Release media")
    for (const button of await host.locator('cb-button:is([part=backward],[part=play],[part=stop],[part=forward],[part=mute])').all()) {
        const label = await button.getAttribute('accessible-label')
        expect(label).toBeTruthy()
        await expect(button).toHaveAttribute('title', label!)
    }
    await expect(host.locator('[part=rate]')).toHaveAttribute('title', 'Playback speed')
    await host.evaluate(node => { (node as AudioPlayer).setMuted(true) })
    await expect(host.locator('[part=mute]')).toHaveAttribute('title', 'Unmute')
    await host.evaluate(node => { (node as AudioPlayer).setMuted(false) })
    await expect(host.locator('[part=mute]')).toHaveAttribute('title', 'Mute')
})
