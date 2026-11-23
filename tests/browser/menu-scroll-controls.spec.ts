import { expect, test } from '@playwright/test'

for (const orientation of ['vertical', 'horizontal', 'rtl'] as const) {
    test(`overflow scroll controls reveal items without activating ${orientation} menu`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto('/tests/browser/fixture.html')
        await page.waitForFunction(() => Boolean(customElements.get('cb-menu')))
        await page.evaluate((orientation) => {
            const menu = document.createElement('cb-menu')
            menu.id = 'test-menu'
            if (orientation === 'rtl') menu.dir = 'rtl'
            Object.assign(menu, {
                stacked: orientation === 'vertical',
                active: '1',
                items: Array.from({ length: 8 }, (_, i) => ({
                    id: String(i + 1),
                    label: `Item number ${i + 1}`,
                })),
            })
            menu.style.width = orientation === 'vertical' ? '220px' : '270px'
            if (orientation === 'vertical') menu.style.height = '150px'
            menu.addEventListener('action', (event) => {
                menu.dataset.action = (event as CustomEvent<{ id: string }>).detail.id
            })
            document.querySelector('#fixture')?.append(menu)
        }, orientation)
        const host = page.locator('#test-menu')
        const menu = host.getByRole('menu')
        const previous = host.getByRole('button', { name: 'Scroll to previous menu items' })
        const next = host.getByRole('button', { name: 'Scroll to next menu items' })
        const item = (index: number) => menu.getByRole('menuitem', { name: `Item number ${index}` })
        const offset = () => menu.evaluate((node) => Math.abs(node.scrollLeft || node.scrollTop))

        await expect(item(1)).toBeVisible()
        await expect(next).toBeHidden()
        await host.evaluate((node) => node.setAttribute('scroll-controls', 'true'))
        await expect(next).toBeVisible()
        await expect(previous).toBeHidden()
        await expect(menu.getByRole('button')).toHaveCount(0)

        await next.focus()
        await next.press('Enter')
        await expect.poll(offset).toBeGreaterThan(0)
        await expect(previous).toBeVisible()
        await expect(host).not.toHaveAttribute('data-action')
        await expect(item(1)).toHaveAttribute('aria-current', 'true')

        await menu.evaluate((node) => node.scrollTo({ left: -10000, top: 10000, behavior: 'instant' }))
        if (orientation === 'horizontal') {
            await menu.evaluate((node) => node.scrollTo({ left: 10000, behavior: 'instant' }))
        }
        await expect(next).toBeHidden()
        await expect(previous).toBeFocused()
        await previous.click()
        await expect(next).toBeVisible()
        await expect(host).not.toHaveAttribute('data-action')

        await item(1).focus()
        await item(1).press(
            orientation === 'vertical' ? 'ArrowDown' : orientation === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
        )
        await expect(item(2)).toBeFocused()
        await item(2).press('Enter')
        await expect(host).toHaveAttribute('data-action', '2')

        await host.evaluate((node) => {
            Object.assign(node, { items: [{ id: '1', label: 'Item number 1' }] })
        })
        await expect(next).toBeHidden()
        await expect(previous).toBeHidden()

        await host.evaluate((node) => {
            Object.assign(node, {
                items: Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), label: `Item number ${i + 1}` })),
            })
        })
        await expect(next).toBeVisible()
        await host.evaluate((node) => node.removeAttribute('scroll-controls'))
        await expect(next).toBeHidden()
        await expect(previous).toBeHidden()
        await host.evaluate((node) => node.setAttribute('scroll-controls', 'true'))
        await expect(next).toBeVisible()
        await host.evaluate((node) => {
            node.style.width = '1800px'
            node.style.maxInlineSize = 'none'
            node.style.height = '700px'
        })
        await expect(next).toBeHidden()
        await expect(previous).toBeHidden()
    })
}
