import { expect, test } from '@playwright/test'
import type { Checkbox } from '../../components/form/checkbox/index.js'
import type { Radio } from '../../components/form/radio/index.js'
import type { Switch } from '../../components/form/switch/index.js'

test('disabled choices visibly mute checked and unchecked states and recover when enabled', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.evaluate(async () => {
        for (const tag of ['cb-checkbox', 'cb-radio', 'cb-switch']) await customElements.whenDefined(tag)
        const fixture = document.querySelector('#fixture')!
        fixture.innerHTML = ''
        ;(fixture as HTMLElement).style.cssText = 'padding:16px;background:var(--color-background);color:var(--color-foreground)'
        for (const tag of ['cb-checkbox', 'cb-radio', 'cb-switch']) for (const checked of [false, true]) {
            const control = document.createElement(tag) as Checkbox | Radio | Switch
            Object.assign(control, { label: `${tag} ${checked ? 'checked' : 'unchecked'}`, checked, disabled: true })
            control.style.cssText = 'display:block;margin:12px'
            fixture.append(control)
        }
    })
    for (const appearance of ['light', 'dark']) {
        await page.locator('#theme').evaluate((node, appearance) => node.setAttribute('appearance', appearance), appearance)
        for (const host of await page.locator('#fixture > *').all()) {
            const input = host.locator('input'), label = host.locator('[part~=choice]')
            const visual = (await host.evaluate(node => node.tagName === 'CB-SWITCH')) ? host.locator('[part~=switch-track]') : input
            await expect(input).toBeDisabled()
            await expect(label).toHaveCSS('cursor', 'not-allowed')
            await expect(visual).toHaveCSS('opacity', '0.5')
            await expect(visual).toHaveCSS('filter', 'grayscale(1)')
            const checked = await input.isChecked()
            const bounds = (await label.boundingBox())!
            await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
            await expect(input).toHaveJSProperty('checked', checked)
        }
        await page.locator('#fixture').screenshot({ path: `/tmp/cube-disabled-choices-${appearance}.png` })
    }
    const host = page.locator('#fixture > cb-switch').last(), input = host.locator('input')
    await host.evaluate(node => { (node as Switch).disabled = false })
    await expect(input).toBeEnabled()
    await expect(host.locator('[part~=choice]')).toHaveCSS('cursor', 'pointer')
    await expect(host.locator('[part~=switch-track]')).toHaveCSS('opacity', '1')
    await expect(host.locator('[part~=switch-track]')).toHaveCSS('filter', 'none')
    await host.getByText('cb-switch checked', { exact: true }).click()
    await expect(input).not.toBeChecked()
})
