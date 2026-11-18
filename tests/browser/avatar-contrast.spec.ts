import { expect, test } from '@playwright/test'

for (const fallback of [false, true]) test(`avatar initials contrast in both themes (${fallback ? 'fallback' : 'native'})`, async ({ page }) => {
    if (fallback) await page.addInitScript(() => {
        const supports = CSS.supports.bind(CSS)
        CSS.supports = ((...args: string[]) => args.includes('contrast-color(red)') ? false : supports(...args as [string, string])) as typeof CSS.supports
    })
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-avatar')))
    await page.evaluate(() => {
        const fixture = document.querySelector('#fixture')!
        for (let index = 0; index < 30; index++) {
            const avatar = document.createElement('cb-avatar')
            avatar.setAttribute('name', `Sample ${index}`)
            fixture.append(avatar)
        }
        for (const color of ['#116ed0', '#008129', 'oklch(0.56 0.18 255)', '#fff', '#000', 'rgb(255, 210, 0)']) {
            const avatar = document.createElement('cb-avatar')
            avatar.setAttribute('name', 'Custom background')
            avatar.setAttribute('color', color)
            fixture.append(avatar)
        }
    })
    const avatars = page.locator('cb-avatar')
    if (fallback) await avatars.evaluateAll(elements => {
        for (const element of elements) {
            const root = (element as HTMLElement & { contentRoot: ShadowRoot }).contentRoot
            const style = document.createElement('style')
            style.textContent = '[part~=avatar] { --cb-avatar-contrast: var(--cb-avatar-auto-foreground, var(--color-foreground)) !important; }'
            root.append(style)
        }
    })
    const indices = await avatars.locator('[part~=avatar]').evaluateAll(elements => elements.map(element => element.getAttribute('data-color-index')))
    expect(new Set(indices).size).toBe(6)
    for (const appearance of ['light', 'dark']) {
        await page.locator('#theme').evaluate((theme, mode) => theme.setAttribute('appearance', mode), appearance)
        await expect.poll(async () => avatars.locator('[part~=surface]').evaluateAll(surfaces => {
            const canvas = document.createElement('canvas')
            canvas.width = canvas.height = 1
            const context = canvas.getContext('2d')!
            const luminance = (color: string) => {
                context.fillStyle = color
                context.fillRect(0, 0, 1, 1)
                const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
                const channels = [red!, green!, blue!].map(channel => channel / 255 <= .04045 ? channel / 255 / 12.92 : ((channel / 255 + .055) / 1.055) ** 2.4)
                return .2126 * channels[0]! + .7152 * channels[1]! + .0722 * channels[2]!
            }
            return Math.min(...surfaces.map(surface => {
                const style = getComputedStyle(surface)
                const foreground = luminance(style.color), background = luminance(style.backgroundColor)
                return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05)
            }))
        })).toBeGreaterThanOrEqual(4.5)
        expect(await avatars.locator('[part~=avatar]').evaluateAll(elements => elements.map(element => element.getAttribute('data-color-index')))).toEqual(indices)
    }
    // Explicit customization takes precedence over both native and fallback contrast.
    const custom = avatars.last()
    await custom.evaluate(avatar => avatar.style.setProperty('--component-avatar-foreground', 'rgb(12, 34, 56)'))
    await expect(custom.locator('[part~=surface]')).toHaveCSS('color', 'rgb(12, 34, 56)')
    await custom.evaluate(avatar => {
        avatar.removeAttribute('color')
        avatar.style.setProperty('--component-avatar-color', 'rgb(240, 230, 220)')
    })
    await expect(custom.locator('[part~=surface]')).toHaveCSS('background-color', 'rgb(240, 230, 220)')
})
