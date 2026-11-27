import { expect, test } from '@playwright/test'
import { componentContract } from '../../../tests/component-contract.js'
import type { ProgressDots, ProgressDotsClickDetail } from './index.js'

componentContract('cb-progress-dots', 'navigation--progress-dots', async ({ page, host }) => {
    const current = host.getByRole('button', { name: 'Step 2' })
    const first = host.getByRole('button', { name: 'Step 1' })
    const locked = host.getByRole('button', { name: 'Step 4' })
    await expect(host.getByRole('navigation', { name: 'Onboarding progress' })).toBeVisible()
    await expect(host.getByRole('button')).toHaveCount(5)
    await expect(current).toHaveAttribute('aria-current', 'step')
    await expect(host.locator('cb-button').nth(0)).toHaveAttribute('data-state', 'complete')
    await expect(host.locator('cb-button').nth(3)).toHaveAttribute('data-state', 'pending')
    await expect(locked).toBeDisabled()
    await host.evaluate((node: ProgressDots) => {
        node.addEventListener('click', (event) => {
            node.dataset.clickCount = String(Number(node.dataset.clickCount ?? 0) + 1)
            if (!(event instanceof CustomEvent)) throw new Error('Expected one semantic click')
            const detail: ProgressDotsClickDetail = event.detail
            node.dataset.clickedIndex = String(detail.index)
        })
    })
    const firstBounds = await first.boundingBox()
    const currentBounds = await current.boundingBox()
    if (!firstBounds || !currentBounds) throw new Error('Missing dot targets')
    expect(firstBounds.width).toBeGreaterThanOrEqual(24)
    expect(firstBounds.height).toBeGreaterThanOrEqual(24)
    expect(currentBounds.x - firstBounds.x - firstBounds.width).toBeGreaterThanOrEqual(8)

    await first.click()
    await expect(host).toHaveAttribute('data-clicked-index', '0')
    await expect(host).toHaveAttribute('data-click-count', '1')
    await expect(current).toHaveAttribute('aria-current', 'step')
    await first.focus()
    await page.keyboard.press('Tab')
    await expect(current).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(host).toHaveAttribute('data-clicked-index', '1')
    await expect(host).toHaveAttribute('data-click-count', '2')
    await host.evaluate((node: ProgressDots) => {
        node.activeIndex = 2
    })
    await expect(host.getByRole('button', { name: 'Step 3' })).toHaveAttribute('aria-current', 'step')
    await expect(current).toBeFocused()
    await host.evaluate((node: ProgressDots) => {
        node.disabled = true
    })
    await expect(first).toBeDisabled()
    await first.evaluate((button: HTMLButtonElement) => button.click())
    await expect(host).toHaveAttribute('data-click-count', '2')
    await host.evaluate((node: ProgressDots) => {
        node.stepLabels = ['Business', 'Services']
    })
    await expect(host.getByRole('button', { name: 'Business' })).toBeVisible()
    await expect(host.getByRole('button', { name: 'Services' })).toBeVisible()
    await expect(host.getByRole('button', { name: 'Step 3' })).toBeVisible()
})

test.describe('progress dot touch targets', () => {
    test.use({ viewport: { width: 320, height: 520 }, isMobile: true, hasTouch: true })

    test('touch activates one step and locked dots retain contrast in both themes', async ({ page }) => {
        await page.goto('/tests/browser/fixture.html')
        await page.evaluate(async () => {
            await customElements.whenDefined('cb-progress-dots')
            const host = document.createElement('cb-progress-dots')
            host.setAttribute('total-steps', '8')
            host.setAttribute('active-index', '2')
            host.setAttribute('last-reachable-index', '3')
            host.addEventListener('click', (event) => {
                if (!(event instanceof CustomEvent)) throw new Error('Expected one semantic click')
                const detail: ProgressDotsClickDetail = event.detail
                host.dataset.clicks = `${host.dataset.clicks ?? ''}${detail.index}`
            })
            const fixture = document.querySelector<HTMLElement>('#fixture')
            if (!fixture) throw new Error('Missing fixture')
            fixture.style.backgroundColor = 'var(--color-background)'
            fixture.append(host)
        })
        const host = page.locator('cb-progress-dots')
        const lastReachable = host.getByRole('button', { name: 'Step 4' })
        const locked = host.getByRole('button', { name: 'Step 5' })
        await lastReachable.tap()
        await expect(host).toHaveAttribute('data-clicks', '3')
        const box = await locked.boundingBox()
        if (!box) throw new Error('Missing locked dot')
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
        await expect(host).toHaveAttribute('data-clicks', '3')
        for (const theme of ['light', 'dark']) {
            await page.locator('#theme').evaluate((node, appearance) => node.setAttribute('appearance', appearance), theme)
            await expect(locked).toHaveCSS('opacity', '1')
            const dot = host.locator('cb-button[data-state="pending"][disabled]').first().locator('[part="dot"]')
            await expect(dot).toHaveCSS('border-top-width', '2px')
            await expect.poll(() => dot.evaluate((node) => {
                const fixture = document.querySelector('#fixture')
                const ctx = document.createElement('canvas').getContext('2d')
                if (!fixture || !ctx) throw new Error('Missing contrast sample')
                const luminance = (color: string): number => {
                    ctx.clearRect(0, 0, 1, 1)
                    ctx.fillStyle = color
                    ctx.fillRect(0, 0, 1, 1)
                    const data = ctx.getImageData(0, 0, 1, 1).data
                    const linear = (channel: number): number => {
                        const value = channel / 255
                        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
                    }
                    return 0.2126 * linear(data[0]) + 0.7152 * linear(data[1]) + 0.0722 * linear(data[2])
                }
                const border = luminance(getComputedStyle(node).borderTopColor)
                const background = luminance(getComputedStyle(fixture).backgroundColor)
                return (Math.max(border, background) + 0.05) / (Math.min(border, background) + 0.05)
            })).toBeGreaterThanOrEqual(3)
        }
    })
})
