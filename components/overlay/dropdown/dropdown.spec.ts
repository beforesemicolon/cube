import { expect, test } from '@playwright/test'
import type { Dropdown } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

test('dropdown carets are opt-in and move independently of menu direction', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-dropdown')))
    await page.evaluate(() => {
        const dropdown = document.createElement('cb-dropdown') as Dropdown
        Object.assign(dropdown, { label: 'Actions', variant: 'ghost', items: [{ id: 'copy', label: 'Copy' }] } satisfies Partial<Dropdown>)
        document.getElementById('fixture')!.append(dropdown)
    })
    const host = page.locator('cb-dropdown'), trigger = host.locator('[part=default-trigger]')
    await expect(trigger.locator('[part=caret]')).toHaveCount(0)
    for (const direction of ['ltr', 'rtl']) for (const position of ['start', 'end'] as const) {
        await host.evaluate((node, settings) => { node.setAttribute('dir', settings.direction); (node as Dropdown).caretPosition = settings.position }, { direction, position })
        await expect.poll(async () => {
            const caret = await trigger.locator('[part=caret]').boundingBox(), text = await trigger.locator('[part=trigger-text]').boundingBox()
            return !!caret && !!text && ((direction === 'ltr') === (position === 'start') ? caret.x + caret.width <= text.x + 1 : caret.x >= text.x + text.width - 1)
        }).toBe(true)
        await trigger.click()
        await expect(host.getByRole('menu')).toHaveCSS('direction', direction)
        await host.getByRole('menuitem', { name: 'Copy', exact: true }).click()
        await expect(host.getByRole('menu')).toBeHidden()
        await expect(host).toHaveJSProperty('value', 'copy')
    }
})

componentContract('cb-dropdown', 'overlay--dropdown', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {
        "open":true,
        "variant":"ghost",
        "iconOnly":true,
        "size":"md",
        "matchTriggerWidth":true,
    } satisfies Partial<Dropdown>) })
    await expect(host.locator('[part=popup]')).toBeVisible()
    const trigger = host.locator('cb-button[part=default-trigger]')
    await expect(trigger).toHaveJSProperty('variant', 'ghost')
    await expect(trigger).toHaveJSProperty('iconOnly', true)
    await expect(trigger).toHaveJSProperty('size', 'md')
    await host.evaluate(node => {
        ;(node as Dropdown).label = 'Updated actions'
    })
    await expect(trigger).toHaveAttribute('accessible-label', 'Updated actions')
    await expect.poll(async () => {
        const [anchor, popup] = await Promise.all([
            host.locator('[part~=trigger-anchor]').boundingBox(),
            host.locator('[part=popup]').boundingBox(),
        ])
        return Boolean(anchor && popup && popup.width >= anchor.width)
    }).toBe(true)

    await host.evaluate(node => {
        const dropdown = node as Dropdown
        dropdown.open = false
        dropdown.items = null
        const button = document.createElement('button')
        button.slot = 'trigger'
        button.textContent = 'Open profile menu'
        const content = document.createElement('p')
        content.textContent = 'Signed in as Ada'
        dropdown.append(button, content)
    })
    const customTrigger = host.getByRole('button', { name: 'Open profile menu' })
    await expect(customTrigger).toHaveAttribute('aria-haspopup', 'menu')
    await customTrigger.click()
    await expect(customTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(host.getByText('Signed in as Ada')).toBeVisible()
})
