import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function start(page: import('@playwright/test').Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-presence')) && Boolean(customElements.get('cb-avatar')))
}

test.beforeEach(async ({ page }) => {
    await start(page)
})

test('avatar renders derived or supplied initials and swaps to a valid image source', async ({ page }) => {
    await page.evaluate(() => {
        const avatar = document.createElement('cb-avatar') as HTMLElement & {
            name: string
            accessibleLabel: string
            status: string
            statusLabel: string
        }
        Object.assign(avatar, {
            name: 'Elson Correia',
            accessibleLabel: 'Elson Correia',
            status: 'online',
            statusLabel: 'Online',
        })
        document.querySelector('#fixture')!.append(avatar)
    })

    const avatar = page.locator('cb-avatar')
    await expect(avatar.getByRole('img', { name: 'Elson Correia, Online' })).toBeVisible()
    await expect(avatar.locator('[part~="initials"]')).toHaveAttribute('data-initials', 'EC')
    await expect(avatar.locator('[part~="status"]')).toHaveAttribute('data-status', 'online')

    await avatar.evaluate((element: HTMLElement & { src: string }) => {
        element.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="%232563eb"/%3E%3C/svg%3E'
    })
    await expect(avatar.locator('[part~="image"]')).toBeVisible()
    await expect(avatar.locator('[part~="initials"]')).toBeHidden()
})

test('presence composes avatars, exposes overflow, and emits participant actions', async ({ page }) => {
    await page.evaluate(() => {
        const presence = document.createElement('cb-presence') as HTMLElement & {
            accessibleLabel: string
            maxVisible: number
            summary: string
            overflowLabel: string
            items: ReadonlyArray<Record<string, string>>
        }
        Object.assign(presence, {
            accessibleLabel: 'Active collaborators',
            maxVisible: 2,
            summary: '4 participants',
            overflowLabel: '{count} more participants',
            items: [
                { id: 'elson', label: 'Elson Correia', initials: 'EC', status: 'online', accessibleLabel: 'Elson Correia, online' },
                { id: 'maya', label: 'Maya Adams', initials: 'MA', status: 'online', accessibleLabel: 'Maya Adams, online' },
                { id: 'ana', label: 'Ana Martins', initials: 'AM', status: 'idle', accessibleLabel: 'Ana Martins, idle' },
                { id: 'noah', label: 'Noah Williams', initials: 'NW', status: 'offline', accessibleLabel: 'Noah Williams, offline' },
            ],
        })
        presence.addEventListener('cb-action', event => {
            document.body.dataset.participant = (event as CustomEvent<{ value: string }>).detail.value
        })
        presence.addEventListener('cb-overflow', event => {
            document.body.dataset.overflow = String((event as CustomEvent<{ count: number }>).detail.count)
        })
        document.querySelector('#fixture')!.append(presence)
    })

    const presence = page.locator('cb-presence')
    await expect(presence.getByRole('group', { name: 'Active collaborators' })).toBeVisible()
    await expect(presence.locator('cb-avatar')).toHaveCount(3)
    await expect(presence.locator('[part~="summary"]')).toHaveText('4 participants')
    const elson = presence.getByRole('button', { name: 'Elson Correia, online' })
    const maya = presence.getByRole('button', { name: 'Maya Adams, online' })
    await expect(elson).toHaveCSS('width', '32px')
    await expect(elson).toHaveCSS('height', '32px')
    await expect(elson).toHaveCSS('padding', '0px')
    await expect(elson).toHaveCSS('border-radius', '50%')
    const elsonBox = await elson.boundingBox()
    const mayaBox = await maya.boundingBox()
    expect(elsonBox).not.toBeNull()
    expect(mayaBox).not.toBeNull()
    expect((mayaBox?.x ?? 0) - (elsonBox?.x ?? 0)).toBeLessThan(elsonBox?.width ?? 0)

    await elson.click()
    await expect.poll(() => page.locator('body').getAttribute('data-participant')).toBe('elson')
    const overflow = presence.getByRole('button', { name: '2 more participants' })
    await overflow.hover()
    await expect(overflow).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(presence.locator('[part~="overflow-avatar"] [part~="surface"]')).toHaveCSS('filter', 'brightness(0.94)')
    await overflow.click()
    await expect.poll(() => page.locator('body').getAttribute('data-overflow')).toBe('2')

    const accessibility = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(accessibility.violations).toEqual([])
})
