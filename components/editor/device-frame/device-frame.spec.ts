import { expect } from '@playwright/test'
import type { DeviceFrame } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-device-frame', 'editor--device-frame', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"device":"custom","width":320,"height":180} satisfies Partial<DeviceFrame>) })
    await expect(host.locator('[part~=device]')).toHaveCSS('aspect-ratio', '320 / 180')
})
