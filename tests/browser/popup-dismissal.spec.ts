import { expect, test } from '@playwright/test'
import type { ContextMenu } from '../../components/overlay/context-menu/index.js'
import type { Popover } from '../../components/overlay/popover/index.js'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-context-menu')))
})

for (const crossOrigin of [false, true]) test(`context menus dismiss when clicking ${crossOrigin ? 'cross-origin' : 'same-origin'} iframe content`, async ({ page }) => {
    await page.route('https://popup-frame.example/**', route => route.fulfill({ contentType: 'text/html', body: '<button>Frame content</button>' }))
    await page.evaluate(crossOrigin => {
        const menu = document.createElement('cb-context-menu') as ContextMenu
        menu.id = 'context'
        menu.items = [{ id: 'lock', label: 'Lock section' }]
        const frame = document.createElement('iframe')
        frame.id = 'outside-frame'
        frame.style.cssText = 'display:block;width:500px;height:200px;margin-top:200px'
        if (crossOrigin) frame.src = 'https://popup-frame.example/'
        else frame.srcdoc = '<button>Frame content</button>'
        document.getElementById('fixture')!.append(menu, frame)
    }, crossOrigin)
    const menu = page.locator('#context')
    const frame = page.locator('#outside-frame').contentFrame()
    await expect(frame.getByRole('button')).toBeVisible()
    for (let attempt = 0; attempt < 2; attempt++) {
        await menu.evaluate(node => (node as ContextMenu).showAt(100, 100))
        await expect(menu.getByRole('menu')).toBeVisible()
        await frame.getByRole('button').click()
        await expect(menu.getByRole('menu')).toBeHidden()
        await expect(menu).not.toHaveAttribute('open')
        await expect(frame.getByRole('button')).toBeFocused()
    }
    await menu.evaluate(node => (node as ContextMenu).showAt(100, 100))
    await menu.getByRole('menuitem', { name: 'Lock section', exact: true }).click()
    await expect(menu.getByRole('menu')).toBeHidden()
})

test('popup dismissal preserves interaction with an iframe inside its own slotted content', async ({ page }) => {
    await page.evaluate(() => {
        const popover = document.createElement('cb-popover') as Popover
        const trigger = document.createElement('button')
        trigger.slot = 'trigger'
        trigger.textContent = 'Open editor'
        const frame = document.createElement('iframe')
        frame.srcdoc = '<input aria-label="Embedded text">'
        popover.append(trigger, frame)
        document.getElementById('fixture')!.append(popover)
    })
    const popover = page.locator('cb-popover')
    await page.getByRole('button', { name: 'Open editor' }).click()
    await expect(popover.getByRole('dialog')).toBeVisible()
    await popover.locator('iframe').contentFrame().getByRole('textbox').fill('Keep this popup open')
    await expect(popover.getByRole('dialog')).toBeVisible()
})

test('popover stays open for internal focus and closes when focus moves elsewhere in the document', async ({ page }) => {
    await page.evaluate(() => {
        const popover = document.createElement('cb-popover') as Popover
        popover.id = 'focus-popover'
        const trigger = document.createElement('button')
        trigger.slot = 'trigger'
        trigger.textContent = 'Open filters'
        const field = document.createElement('input')
        field.setAttribute('aria-label', 'Filter name')
        const outside = document.createElement('button')
        outside.textContent = 'Outside action'
        popover.append(trigger, field)
        document.getElementById('fixture')!.append(popover, outside)
    })

    const popover = page.locator('#focus-popover')
    await page.getByRole('button', { name: 'Open filters' }).click()
    await popover.getByRole('textbox', { name: 'Filter name' }).focus()
    await expect(popover.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Outside action' }).focus()
    await expect(popover.getByRole('dialog')).toBeHidden()
    await expect(popover).not.toHaveAttribute('open')
})
