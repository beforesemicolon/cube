import { expect, test } from '@playwright/test'
import type { CssValueInput } from '../../components/form/css-value-input/index.js'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-css-value-input')))
    await page.evaluate(() => {
        const field = document.createElement('cb-css-value-input') as CssValueInput
        Object.assign(field, { value: '320px', accessibleLabel: 'Width', cssProperty: 'width', unitLabel: 'Width unit', argumentLabel: 'Width value {index}',
            suggestions: ['auto', 'fit-content', 'min-content', 'max-content', 'min()', 'max()', 'clamp()', 'calc()', 'var()'] } satisfies Partial<CssValueInput>)
        const fixture = document.querySelector('#fixture')!
        const form = document.createElement('form'); form.append(field); fixture.append(form)
        field.name = 'width'
        field.addEventListener('change', () => { fixture.setAttribute('data-value', field.value) })
    })
})

test('numeric values reveal units; text suggests keywords with keyboard selection', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first(), input = host.getByRole('combobox', { name: 'Width', exact: true })
    await expect(input).toHaveValue('320')
    await host.locator('cb-select').getByRole('button').click()
    await page.getByRole('option', { name: '%', exact: true }).click()
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', '320%')
    await input.fill('au')
    await expect(host.getByRole('option', { name: 'auto', exact: true })).toBeVisible()
    await expect(host.locator('cb-select')).toHaveCount(0)
    await input.press('ArrowDown'); await page.getByRole('option', { name: 'auto', exact: true }).press('Enter')
    await expect(input).toHaveValue('auto')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', 'auto')
    await input.fill('fit-content')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', 'fit-content')
    expect(await host.evaluate(node => new FormData((node as CssValueInput).form!).get('width'))).toBe('fit-content')
})

test('numeric arrows step in place, preserve units and support coarse and fine adjustments', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first(), input = host.getByRole('combobox', { name: 'Width', exact: true })
    await input.press('ArrowUp')
    await expect(input).toHaveValue('321')
    await expect(input).toBeFocused()
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', '321px')
    await input.press('ArrowDown'); await expect(input).toHaveValue('320')
    await input.press('Shift+ArrowUp'); await expect(input).toHaveValue('330')
    await input.press('Alt+ArrowDown'); await expect(input).toHaveValue('329.9')
    await expect(host.getByRole('listbox', { name: 'Width', exact: true })).toBeHidden()
    await input.fill('1.2em'); await input.press('Alt+ArrowUp')
    await expect(input).toHaveValue('1.3')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', '1.3em')
    expect(await host.evaluate(node => new FormData((node as CssValueInput).form!).get('width'))).toBe('1.3em')
    await input.fill('0px'); await input.press('ArrowDown')
    await expect(input).toHaveValue('0')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', '0px')
    await input.fill('calc(100% - 2rem)'); await input.press('ArrowUp')
    await expect(input).toHaveValue('calc(100% - 2rem)')
})

test('numeric stepping honors configured steps, nested arguments, readonly and canceled changes', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first(), input = host.getByRole('combobox', { name: 'Width', exact: true })
    await host.evaluate(node => { (node as CssValueInput).step = .1 })
    await input.press('ArrowUp'); await expect(input).toHaveValue('320.1')
    await input.press('Shift+ArrowDown'); await expect(input).toHaveValue('319.1')
    await input.fill('min(100%,720px)')
    const argument = host.getByRole('combobox', { name: 'Width value 2', exact: true })
    await argument.press('ArrowUp'); await expect(argument).toHaveValue('720.1')
    await expect(argument).toBeFocused()
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', 'min(100%, 720.1px)')
    await input.fill('50%')
    await host.evaluate(node => { (node as CssValueInput).readOnly = true })
    await input.press('ArrowUp'); await expect(input).toHaveValue('50')
    await host.evaluate(node => {
        const field = node as CssValueInput
        field.readOnly = false
        field.addEventListener('beforechange', event => event.preventDefault(), { once: true })
    })
    await input.press('ArrowUp')
    expect(await host.evaluate(node => (node as CssValueInput).value)).toBe('50%')
})

test('min and max open two editable arguments in one field and clamp opens three', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first(), input = host.getByRole('combobox', { name: 'Width', exact: true })
    await input.fill('min')
    await expect(host.locator('[part=argument]')).toHaveCount(2)
    const first = host.getByRole('combobox', { name: 'Width value 1', exact: true }), second = host.getByRole('combobox', { name: 'Width value 2', exact: true })
    await expect(first).toHaveValue('320')
    await second.fill('720px')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', 'min(320px, 720px)')
    await first.fill('100%')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', 'min(100%, 720px)')
    await input.fill('max')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', 'max(100%, 720px)')
    await input.fill('clamp')
    await expect(host.locator('[part=argument]')).toHaveCount(3)
    await host.getByRole('combobox', { name: 'Width value 3', exact: true }).fill('1000px')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', 'clamp(100%, 720px, 1000px)')
})

test('function and argument controls stay in one row at editor and Storybook widths', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first()
    for (const width of [280, 320, 600]) {
        await host.evaluate((node, width) => { node.style.width = `${width}px` }, width)
        for (const value of ['min(100%,720px)', 'max(20px,50vw)', 'clamp(1rem,2vw,30rem)']) {
            await host.evaluate((node, value) => { (node as CssValueInput).value = value }, value)
            const name = (await host.getByRole('combobox', { name: 'Width', exact: true }).boundingBox())!
            const args = host.locator('[part=argument]')
            for (let index = 0; index < await args.count(); index++) {
                const arg = (await args.nth(index).boundingBox())!
                expect(Math.abs(arg.y + arg.height / 2 - name.y - name.height / 2)).toBeLessThan(2)
                expect(arg.x).toBeGreaterThan(name.x + name.width)
            }
            expect(await host.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
            expect((await host.boundingBox())!.height).toBeLessThan(36)
        }
    }
    await host.evaluate(node => { node.style.width = '320px'; (node as CssValueInput).value = 'min(100%,720px)' })
    await expect(host.locator('[part=argument]').nth(0).locator('cb-select').getByRole('button')).toContainText('%')
    await expect(host.locator('[part=argument]').nth(1).locator('cb-select').getByRole('button')).toContainText('px')
    await host.screenshot({ path: '/tmp/cube-css-value-input-inline.png' })
})

test('typing a function name does not seed an argument with its unfinished prefix', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first(), input = host.getByRole('combobox', { name: 'Width', exact: true })
    await input.fill('')
    await input.pressSequentially('min', { delay: 80 })
    await expect(host.getByRole('listbox', { name: 'Width', exact: true })).toBeHidden()
    await expect(host.getByRole('combobox', { name: 'Width value 1', exact: true })).toHaveValue('')
    await expect(host.getByRole('combobox', { name: 'Width value 2', exact: true })).toHaveValue('')
    await host.getByRole('button', { name: 'Width', exact: true }).click()
    await expect(host.getByRole('listbox', { name: 'Width', exact: true })).toBeVisible()
    await host.locator('[part=argument]').first().getByRole('button', { name: 'Width value 1', exact: true }).click()
    await expect(host.getByRole('listbox', { name: 'Width', exact: true })).toBeHidden()
    await expect(host.getByRole('listbox', { name: 'Width value 1', exact: true })).toBeVisible()
})

test('numeric fields stay compact on wide surfaces while text expressions use the available width', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first(), input = host.getByRole('combobox', { name: 'Width', exact: true })
    await host.evaluate(node => { node.style.width = '700px'; (node as CssValueInput).value = '320px' })
    const numericWidth = (await input.boundingBox())!.width
    expect(numericWidth).toBeLessThan(100)
    await host.evaluate(node => { (node as CssValueInput).value = 'min(100%,720px)' })
    for (const name of ['Width value 1', 'Width value 2'])
        expect((await host.getByRole('combobox', { name, exact: true }).boundingBox())!.width).toBeLessThan(100)
    await expect(host.locator('[part=argument]').nth(0).locator('cb-select').getByRole('button')).toContainText('%')
    await expect(host.locator('[part=argument]').nth(1).locator('cb-select').getByRole('button')).toContainText('px')
    await host.screenshot({ path: '/tmp/cube-css-value-input-compact.png' })
    await host.evaluate(node => { (node as CssValueInput).value = 'calc(100% - 2rem)' })
    expect((await input.boundingBox())!.width).toBeGreaterThan(numericWidth * 3)
})

test('empty function arguments have consistent light and dark popup spacing and rounded clipping', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first()
    await host.evaluate(node => { node.style.width = '295px'; (node as CssValueInput).value = 'min(, )' })
    for (const appearance of ['light', 'dark']) {
        await page.locator('#theme').evaluate((node, appearance) => node.setAttribute('appearance', appearance), appearance)
        const argument = host.locator('[part=argument]').first()
        await argument.getByRole('button', { name: 'Width value 1', exact: true }).click()
        const option = argument.getByRole('option', { name: 'min()', exact: true })
        await expect(option).toBeVisible()
        expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(28)
        await expect(host.locator('div[part=control]').first()).toHaveCSS('overflow', 'hidden')
        await expect(host.getByRole('combobox', { name: 'Width value 1', exact: true })).toHaveValue('')
        expect(await host.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
        await page.screenshot({ path: `/tmp/cube-css-value-empty-${appearance}.png`, animations: 'disabled' })
        await option.press('Escape')
    }
})

test('partial and cleared drafts survive source echoes; invalid drafts never replace the last valid value', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first(), input = host.getByRole('combobox', { name: 'Width', exact: true })
    await input.fill('calc(100% -')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(await host.evaluate(node => (node as CssValueInput).value)).toBe('320px')
    await host.evaluate(node => { (node as CssValueInput).value = '321px' })
    await expect(input).toHaveValue('calc(100% -')
    await input.fill('calc(100% - 2rem)')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', 'calc(100% - 2rem)')
    await input.fill('')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', '')
    await host.evaluate(node => { (node as CssValueInput).value = '322px' })
    await expect(input).toHaveValue('')
    await input.pressSequentially('900', { delay: 80 })
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', '900px')
    await input.blur()
    await host.evaluate(node => { (node as CssValueInput).value = '450px' })
    await expect(input).toHaveValue('450')
})

test('nested functions round-trip and the unified shell fits a narrow dark panel', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.locator('#theme').evaluate(node => node.setAttribute('appearance', 'dark'))
    const host = page.locator('cb-css-value-input').first()
    await host.evaluate(node => { (node as CssValueInput).value = 'min(calc(100% - 2rem), max(320px, 50vw))' })
    await expect(host.getByRole('combobox', { name: 'Width value 1', exact: true })).toHaveValue('calc(100% - 2rem)')
    const second = host.getByRole('combobox', { name: 'Width value 2', exact: true })
    await expect(second).toHaveValue('max(320px, 50vw)')
    await second.fill('max(400px, 60vw)')
    expect(await host.evaluate(node => (node as CssValueInput).value)).toBe('min(calc(100% - 2rem), max(400px, 60vw))')
    expect(await host.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
    await page.screenshot({ path: '/tmp/cube-css-value-input-dark.png' })
})

test('partial nested math keeps argument controls mounted and only complete functions commit', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first()
    await host.evaluate(node => { (node as CssValueInput).value = 'min(100%,720px)' })
    const second = host.getByRole('combobox', { name: 'Width value 2', exact: true })
    await second.fill('calc(100% -')
    await expect(second).toBeFocused()
    await expect(second).toHaveValue('calc(100% -')
    await expect(host.locator('[part=argument]')).toHaveCount(2)
    expect(await host.evaluate(node => (node as CssValueInput).value)).toBe('min(100%,720px)')
    await second.fill('calc(100% - 20px)')
    expect(await host.evaluate(node => (node as CssValueInput).value)).toBe('min(100%, calc(100% - 20px))')
    await second.fill('')
    await expect(second).toBeFocused()
    await expect(second).toHaveValue('')
    expect(await host.evaluate(node => (node as CssValueInput).value)).toBe('min(100%, calc(100% - 20px))')
    await second.pressSequentially('500', { delay: 80 })
    expect(await host.evaluate(node => (node as CssValueInput).value)).toBe('min(100%, 500px)')
})

test('unitless choices remain unitless and compact cells keep digits and units readable', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first(), input = host.getByRole('combobox', { name: 'Width', exact: true })
    await host.evaluate(node => {
        const field = node as CssValueInput
        field.cssProperty = 'line-height'; field.units = ['px', { value: '', label: '×' }]; field.value = '24px'
        field.style.width = '48px'
    })
    await host.locator('cb-select').getByRole('button').click()
    await page.getByRole('option', { name: '×', exact: true }).click()
    await input.fill('1.4')
    await expect(page.locator('#fixture')).toHaveAttribute('data-value', '1.4')
    await expect(host.locator('cb-select').getByRole('button')).toContainText('×')
    const bounds = (await input.boundingBox())!
    expect(bounds.width).toBeGreaterThan(18)
    await expect(host.locator('cb-select cb-icon[part~=indicator]')).toBeHidden()
    expect((await host.locator('[part=control]').first().boundingBox())!.height).toBe(bounds.height + 2)
    expect(await host.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
})

test('disabled, readonly, cancellation and form reset preserve the canonical field value', async ({ page }) => {
    const host = page.locator('cb-css-value-input').first(), input = host.getByRole('combobox', { name: 'Width', exact: true })
    await host.evaluate(node => { (node as CssValueInput).readOnly = true })
    await expect(input).toHaveJSProperty('readOnly', true)
    expect(await host.evaluate(node => (node as CssValueInput).setValue('10px'))).toBe(false)
    await host.evaluate(node => { const field = node as CssValueInput; field.readOnly = false; field.disabled = true })
    await expect(input).toBeDisabled()
    await host.evaluate(node => { const field = node as CssValueInput; field.disabled = false; field.addEventListener('beforechange', event => event.preventDefault(), { once: true }) })
    await input.fill('500px')
    expect(await host.evaluate(node => (node as CssValueInput).value)).toBe('320px')
    await input.fill('600px')
    expect(await host.evaluate(node => (node as CssValueInput).value)).toBe('600px')
    await host.evaluate(node => (node as CssValueInput).form!.reset())
    await expect(input).toHaveValue('320')
})
