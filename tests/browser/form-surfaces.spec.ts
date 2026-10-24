import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { TextInput } from '../../components/form/text-input/index.js'
import type { Select } from '../../components/form/select/index.js'

async function mount(page: Page, appearance = 'light'): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-select')))
    await page.locator('#theme').evaluate((node, mode) => node.setAttribute('appearance', mode), appearance)
    await page.evaluate(() => {
        const fixture = document.querySelector<HTMLElement>('#fixture')!
        fixture.style.cssText = 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;padding:32px;background:var(--color-surface);color:var(--color-foreground)'
        const add = (tag: string, label: string, props: object = {}, disabled = false): void => {
            const wrap = document.createElement('cb-field'), control = document.createElement(tag)
            Object.assign(wrap, { label: tag === 'cb-checkbox' ? '' : label, disabled }); Object.assign(control, { accessibleLabel: label, ...props })
            wrap.style.alignSelf = 'start'
            wrap.style.inlineSize = '100%'
            control.style.cssText = 'inline-size:100%;max-inline-size:100%'; wrap.append(control); fixture.append(wrap)
        }
        add('cb-text-input', 'Project name', { value: 'Studio website' })
        add('cb-select', 'Visibility', { value: 'team', options: [{ value: 'team', label: 'Team' }, { value: 'public', label: 'Public' }], placeholder: 'Choose visibility', emptyLabel: 'No options' })
        add('cb-combobox', 'Search icons', { value: 'Settings', options: [{ value: 'Settings', label: 'Settings' }], toggleLabel: 'Show icons', placeholder: 'Search icons' })
        add('cb-number-input', 'Columns', { value: 12 })
        add('cb-unit-input', 'Width', { value: 320, unit: 'px' })
        add('cb-stepper', 'Spacing', { value: 24, incrementLabel: 'Increase spacing', decrementLabel: 'Decrease spacing' })
        add('cb-date-picker', 'Publish date', { value: '2026-10-23', previousLabel: 'Previous month', nextLabel: 'Next month', calendarLabel: 'Choose date' })
        add('cb-time-picker', 'Publish time', { value: '09:00', emptyLabel: 'No times' })
        add('cb-masked-input', 'Reference', { value: '123456', mask: '999-999' })
        add('cb-textarea', 'Description', { value: 'Build a thoughtful experience for your team.' })
        add('cb-text-input', 'Read only', { value: 'studio.example.com', readOnly: true })
        add('cb-text-input', 'Disabled', { value: 'Not available' }, true)
        add('cb-checkbox', 'Notify collaborators', { label: 'Notify collaborators', checked: true })
        add('cb-radio-group', 'Access', { value: 'team', options: [{ value: 'team', label: 'Team' }, { value: 'everyone', label: 'Everyone' }] })
        const button = document.createElement('cb-button'); Object.assign(button, { label: 'Add attribute' }); fixture.append(button)
    })
    await expect(page.locator('cb-text-input').first().locator('input')).toHaveValue('Studio website')
}

for (const appearance of ['light', 'dark']) test(`themed fields share soft neutral surfaces without changing control heights (${appearance})`, async ({ page }) => {
    await mount(page, appearance)
    const input = page.locator('cb-text-input').first().locator('input')
    const selector = page.locator('cb-select').first().locator('cb-button[part~=trigger]')
    const combo = page.locator('cb-combobox [part~=input-shell]')
    for (const control of [input, selector, combo]) {
        await expect(control).toHaveCSS('border-radius', '8px')
        await expect(control).toHaveCSS('height', '28px')
        await expect(control).toHaveCSS('box-shadow', 'none')
    }
    const inputColor = await input.evaluate(node => getComputedStyle(node).backgroundColor)
    const neutralBorder = appearance === 'light' ? 'rgb(214, 214, 214)' : 'rgb(80, 80, 80)'
    expect(inputColor).toBe(appearance === 'light' ? 'rgb(255, 255, 255)' : 'rgb(36, 36, 36)')
    for (const control of [input, selector, combo]) await expect(control).toHaveCSS('border-top-color', neutralBorder)
    await expect(selector).toHaveCSS('background-color', inputColor)
    await expect(combo).toHaveCSS('background-color', inputColor)
    await input.hover()
    await expect(input).toHaveCSS('background-color', appearance === 'light' ? 'rgb(255, 255, 255)' : 'rgb(41, 41, 41)')
    await expect(input).toHaveCSS('border-top-color', appearance === 'light' ? 'rgb(181, 181, 181)' : 'rgb(112, 112, 112)')
    await input.focus()
    await expect(input).toHaveCSS('border-top-color', appearance === 'light' ? 'rgb(37, 99, 235)' : 'rgb(131, 182, 255)')
    await expect(input).toHaveCSS('background-color', inputColor)
    await expect(input).toHaveCSS('box-shadow', 'none')
    await expect(page.locator('cb-combobox input')).toHaveCSS('border-top-width', '0px')
    await expect(page.locator('cb-combobox input')).toHaveCSS('box-shadow', 'none')
    await page.locator('h1').click()
    await expect(input).toHaveCSS('border-top-color', neutralBorder)
    await expect(input).toHaveCSS('background-color', inputColor)
    const button = page.getByRole('button', { name: 'Add attribute' })
    await expect(button).toHaveCSS('background-color', inputColor)
    await expect(button).toHaveCSS('border-top-color', neutralBorder)
    await expect(button).toHaveCSS('box-shadow', 'none')
    const uncheckedRadio = page.getByRole('radio', { name: 'Everyone' })
    await uncheckedRadio.hover()
    await expect(uncheckedRadio).toHaveCSS('border-top-color', appearance === 'light' ? 'rgb(181, 181, 181)' : 'rgb(112, 112, 112)')
    await page.locator('h1').hover()
    await page.screenshot({ path: `test-results/form-surfaces-${appearance}.png`, fullPage: true })
    await selector.click()
    await expect(page.locator('cb-select').first().locator('[part~=popup]')).toHaveCSS('border-top-color', neutralBorder)
    await page.screenshot({ path: `test-results/form-selector-${appearance}.png`, fullPage: true })
    await page.keyboard.press('Escape')
    await page.locator('cb-date-picker').getByRole('button', { name: 'Publish date' }).click()
    await expect(page.locator('cb-calendar [part~=calendar]')).toHaveCSS('border-top-color', neutralBorder)
    await page.keyboard.press('Escape')
    expect((await new AxeBuilder({ page }).include('#fixture').analyze()).violations).toEqual([])
})

test('field tokens are overridable and invalid/disabled/read-only states retain their semantics', async ({ page }) => {
    await mount(page)
    const host = page.locator('cb-text-input').first(), input = host.locator('input')
    await host.evaluate(node => { (node as HTMLElement).style.setProperty('--component-field-background', 'rgb(240, 250, 240)') })
    await expect(input).toHaveCSS('background-color', 'rgb(240, 250, 240)')
    await host.evaluate(node => { const control = node as TextInput; control.required = true; control.value = '' })
    await expect(input).toHaveValue('')
    await host.evaluate(node => { const control = node as TextInput; control.errorText = 'Project name is required.'; control.reportValidity() })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveCSS('border-top-color', 'rgb(180, 35, 60)')
    await expect(page.locator('cb-text-input').nth(1).locator('input')).toHaveAttribute('readonly')
    await expect(page.locator('cb-text-input').nth(1).locator('input')).toHaveCSS('box-shadow', 'none')
    await expect(page.locator('cb-text-input').nth(2).locator('input')).toBeDisabled()
    await page.locator('cb-select').first().evaluate(node => { (node as Select).native = true })
    await expect(page.locator('cb-select').first().locator('select')).toHaveCSS('appearance', 'auto')
    await page.evaluate(() => {
        const label = document.createElement('cb-editable-label')
        Object.assign(label, { value: 'Page title', accessibleLabel: 'Editable title', editLabel: 'Edit title', saveLabel: 'Confirm title', cancelLabel: 'Cancel title' })
        document.querySelector('#fixture')!.append(label)
    })
    await page.getByRole('button', { name: 'Edit title' }).click()
    const editableInput = page.locator('cb-editable-label input')
    await expect(editableInput).toHaveValue('Page title')
    await expect(editableInput).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(editableInput).toHaveCSS('box-shadow', 'none')
    await page.locator('h1').click()
    await expect(editableInput).toHaveCSS('border-top-color', 'rgb(214, 214, 214)')
})

test('narrow unit inputs retain space for two-digit values and selectable units', async ({ page }) => {
    await mount(page)
    const unit = page.locator('cb-unit-input'), number = unit.getByRole('spinbutton', { name: 'Width', exact: true })
    await unit.evaluate(node => {
        Object.assign(node, { value: 48, units: ['px', 'em', 'rem'], unit: 'px', unitLabel: 'Width unit' })
        node.style.setProperty('--component-studio-control-min-width', '0px')
    })
    for (const width of [50, 60, 80, 112]) {
        await unit.evaluate((node, width) => { node.style.inlineSize = `${width}px` }, width)
        for (const suffix of ['px', 'rem']) {
            await unit.getByRole('button', { name: /^Width unit:/ }).click()
            await unit.getByRole('option', { name: suffix, exact: true }).click()
            await expect(number).toHaveValue('48')
            await expect.poll(() => number.evaluate(node => {
                const style = getComputedStyle(node), canvas = document.createElement('canvas'), context = canvas.getContext('2d')!
                context.font = style.font
                return node.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - context.measureText('48').width
            }), { message: `${width}px field with ${suffix} unit` }).toBeGreaterThanOrEqual(0)
        }
        expect(await unit.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
    }
})
