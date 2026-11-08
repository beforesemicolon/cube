import { expect } from '@playwright/test'
import type { Image } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-image', 'media--image', async ({ host }) => {
    await host.evaluate((node) => {
        Object.assign(node, {
            src: '/missing-primary.png',
            fallbackSrc: '/poster.svg',
            alt: 'Inventory preview',
            variant: 'thumbnail',
            size: 'md',
        } satisfies Partial<Image>)
    })
    await expect(host).toHaveAttribute('data-variant', 'thumbnail')
    await expect(host.locator('img')).toHaveAttribute('alt', 'Inventory preview')
    await host.locator('img').dispatchEvent('error')
    await expect(host.locator('img')).toHaveAttribute('src', '/poster.svg')
    await expect(host).toHaveCSS('width', '40px')
})
