import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-calendar')))
}

test('custom select is the default and native rendering is opt in', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const custom = document.createElement('cb-select') as HTMLElement & { label: string; value: string; options: Array<{ value: string; label: string }>; native: boolean }
        custom.label = 'Device'; custom.value = 'desktop'; custom.options = [{ value: 'desktop', label: 'Desktop' }, { value: 'mobile', label: 'Mobile' }]
        const native = document.createElement('cb-select') as typeof custom
        native.label = 'Browser device'; native.value = 'mobile'; native.options = custom.options; native.native = true
        document.querySelector('#fixture')?.append(custom, native)
    })
    const trigger = page.locator('cb-select').first().getByRole('button', { name: /^Device:/ })
    await expect(page.locator('cb-select').first().locator('[part~="search-wrap"]')).toBeHidden()
    await trigger.focus()
    await trigger.press('ArrowDown')
    await expect(page.locator('cb-select').first().getByRole('option', { name: 'Desktop' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('cb-select').first().getByRole('option', { name: 'Mobile' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('cb-select').first()).toHaveJSProperty('value', 'mobile')
    await expect(page.locator('cb-select').nth(1).getByRole('combobox', { name: 'Browser device' })).toHaveValue('mobile')
})

test('select supports searchable multi-selection in the same component', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const select = document.createElement('cb-select') as HTMLElement & {
            label: string
            value: string[]
            multi: boolean
            searchable: 'auto' | boolean
            searchThreshold: number
            searchLabel: string
            searchPlaceholder: string
            emptyLabel: string
            options: Array<{ value: string; label: string }>
        }
        select.label = 'Frameworks'
        select.value = ['react']
        select.multi = true
        select.searchable = 'auto'
        select.searchThreshold = 10
        select.searchLabel = 'Filter frameworks'
        select.searchPlaceholder = 'Search frameworks'
        select.emptyLabel = 'No matching frameworks'
        select.options = [
            { value: 'angular', label: 'Angular' }, { value: 'astro', label: 'Astro' },
            { value: 'ember', label: 'Ember' }, { value: 'lit', label: 'Lit' },
            { value: 'next', label: 'Next.js' }, { value: 'nuxt', label: 'Nuxt' },
            { value: 'preact', label: 'Preact' }, { value: 'qwik', label: 'Qwik' },
            { value: 'react', label: 'React' }, { value: 'solid', label: 'Solid' },
            { value: 'svelte', label: 'Svelte' }, { value: 'vue', label: 'Vue' },
        ]
        document.querySelector('#fixture')?.append(select)
    })

    const select = page.locator('cb-select')
    await select.getByRole('button', { name: 'Frameworks: React' }).click()
    const search = select.getByRole('combobox', { name: 'Filter frameworks' })
    await expect(search).toBeVisible()
    await expect(search).toBeFocused()
    await search.fill('vue')
    await expect(select.getByRole('option', { name: 'Vue' })).toBeVisible()
    await expect(select.getByRole('option', { name: 'React' })).toHaveCount(0)
    await select.getByRole('option', { name: 'Vue' }).click()
    await expect(select).toHaveJSProperty('value', ['react', 'vue'])
    await expect(select.locator('[part~="popup"]')).toBeVisible()
    await expect(select.getByRole('button', { name: 'Frameworks: React, Vue' })).toHaveAttribute('aria-expanded', 'true')

    await search.fill('missing')
    await expect(select.getByRole('status')).toHaveText('No matching frameworks')
    await search.press('Escape')
    await expect(select.locator('[part~="popup"]')).toBeHidden()

    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('radio group owns its options, keyboard selection and form value', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const form = document.createElement('form')
        const group = document.createElement('cb-radio-group') as HTMLElement & {
            label: string
            name: string
            value: string
            required: boolean
            options: Array<{ value: string; label: string; disabled?: boolean }>
        }
        group.label = 'Contact method'
        group.name = 'contact'
        group.value = 'email'
        group.required = true
        group.options = [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'Text message' },
            { value: 'push', label: 'Push notification', disabled: true },
        ]
        form.append(group)
        document.querySelector('#fixture')?.append(form)
    })

    const group = page.locator('cb-radio-group')
    await expect(group.getByRole('radiogroup', { name: 'Contact method' })).toBeVisible()
    const email = group.getByRole('radio', { name: 'Email' })
    const sms = group.getByRole('radio', { name: 'Text message' })
    await expect(email).toBeChecked()
    await email.focus()
    await page.keyboard.press('ArrowRight')
    await expect(sms).toBeChecked()
    await expect(group).toHaveJSProperty('value', 'sms')
    await expect(group.getByRole('radio', { name: 'Push notification' })).toBeDisabled()
    const formValue = await page.locator('form').evaluate(form => new FormData(form).get('contact'))
    expect(formValue).toBe('sms')

    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('unit input offers configurable units without changing its numeric value', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const input = document.createElement('cb-unit-input') as HTMLElement & {
            label: string
            value: number
            unit: string
            units: Array<string | { value: string; label: string; disabled?: boolean }>
            unitLabel: string
        }
        input.label = 'Width'
        input.value = 320
        input.unit = 'px'
        input.units = ['px', { value: '%', label: 'percent' }, { value: 'rem', label: 'rem', disabled: true }]
        input.unitLabel = 'Unit'
        document.querySelector('#fixture')?.append(input)
    })

    const input = page.locator('cb-unit-input')
    const unitSelect = input.locator('cb-select[part~="unit-select"]')
    const trigger = unitSelect.getByRole('button', { name: 'Unit: px' })
    await expect(input.locator('input[type="number"]')).toHaveAttribute('aria-valuetext', '320 px')
    await trigger.focus()
    await trigger.press('ArrowDown')
    await expect(unitSelect.getByRole('option', { name: 'px' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(unitSelect.getByRole('option', { name: 'percent' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(input).toHaveJSProperty('unit', '%')
    await expect(input).toHaveJSProperty('value', 320)
    await expect(input.locator('input[type="number"]')).toHaveAttribute('aria-valuetext', '320 percent')

    const event = await input.evaluate(element => new Promise<{ unit: string; value: number }>(resolve => {
        element.addEventListener('cb-unit-change', customEvent => {
            const detail = (customEvent as CustomEvent<{ unit: string }>).detail
            resolve({ unit: detail.unit, value: (element as HTMLElement & { value: number }).value })
        }, { once: true })
        const component = element as HTMLElement & { chooseUnit(unit: string): boolean }
        component.chooseUnit('px')
    }))
    expect(event).toEqual({ unit: 'px', value: 320 })

    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('stepper renders as one joined field and keeps its controls independently operable', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const stepper = document.createElement('cb-stepper') as HTMLElement & {
            label: string
            value: number
            min: number
            max: number
            step: number
            decrementLabel: string
            incrementLabel: string
        }
        stepper.label = 'Quantity'
        stepper.value = 2
        stepper.min = 0
        stepper.max = 3
        stepper.step = 1
        stepper.decrementLabel = 'Decrease quantity'
        stepper.incrementLabel = 'Increase quantity'
        document.querySelector('#fixture')?.append(stepper)
    })

    const stepper = page.locator('cb-stepper')
    const decrement = stepper.getByRole('button', { name: 'Decrease quantity' })
    const increment = stepper.getByRole('button', { name: 'Increase quantity' })
    const input = stepper.getByRole('spinbutton', { name: 'Quantity' })
    const geometry = await stepper.locator('[part~="field-shell"][part~="stepper"]').evaluate(shell => {
        const [left, field, right] = [...shell.children].map(element => getComputedStyle(element))
        return {
            left: [left.borderTopLeftRadius, left.borderTopRightRadius],
            field: [field.borderTopLeftRadius, field.borderTopRightRadius, field.marginInlineStart],
            right: [right.borderTopLeftRadius, right.borderTopRightRadius, right.marginInlineStart],
        }
    })
    expect(geometry.left[0]).not.toBe('0px')
    expect(geometry.left[1]).toBe('0px')
    expect(geometry.field).toEqual(['0px', '0px', '-1px'])
    expect(geometry.right[0]).toBe('0px')
    expect(geometry.right[1]).not.toBe('0px')
    expect(geometry.right[2]).toBe('-1px')

    await increment.click()
    await expect(input).toHaveValue('3')
    await expect(increment).toBeDisabled()
    await decrement.click()
    await expect(input).toHaveValue('2')
    await expect(decrement).toBeEnabled()

    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('combobox stays closed initially, filters interactively and replaces autocomplete-only components', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const combo = document.createElement('cb-combobox') as HTMLElement & { label: string; placeholder: string; autocomplete: string; options: Array<{ value: string; label: string }> }
        combo.label = 'Font family'; combo.placeholder = 'Search fonts'; combo.autocomplete = 'both'; combo.options = [{ value: 'inter', label: 'Inter' }, { value: 'source', label: 'Source Sans 3' }]
        document.querySelector('#fixture')?.append(combo)
    })
    const input = page.getByRole('combobox', { name: 'Font family' })
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await input.fill('Sou')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('option', { name: 'Source Sans 3' })).toBeVisible()
    await input.press('ArrowDown')
    await expect(page.getByRole('option', { name: 'Source Sans 3' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('cb-combobox')).toHaveJSProperty('value', 'source')
    await expect(input).toHaveValue('Source Sans 3')
})

test('calendar and custom date and time pickers support keyboard-ready themed popups', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const calendar = document.createElement('cb-calendar') as HTMLElement & { label: string; value: string; firstDayOfWeek: number; previousLabel: string; nextLabel: string }
        calendar.label = 'Publishing calendar'; calendar.value = '2026-10-18'; calendar.firstDayOfWeek = 1; calendar.previousLabel = 'Previous month'; calendar.nextLabel = 'Next month'
        const date = document.createElement('cb-date-picker') as HTMLElement & { label: string; value: string; previousLabel: string; nextLabel: string }
        date.label = 'Publish date'; date.value = '2026-10-18'; date.previousLabel = 'Previous month'; date.nextLabel = 'Next month'
        const time = document.createElement('cb-time-picker') as HTMLElement & { label: string; value: string; min: string; max: string }
        time.label = 'Publish time'; time.value = '09:30'; time.min = '08:00'; time.max = '12:00'
        document.querySelector('#fixture')?.append(calendar, date, time)
    })
    await expect(page.getByRole('group', { name: 'Publishing calendar' })).toBeVisible()
    const selectedDay = page.locator('#fixture > cb-calendar').getByRole('button', { name: /Sunday, October 18, 2026/ })
    await expect(selectedDay).toHaveAttribute('aria-pressed', 'true')
    await selectedDay.focus()
    await selectedDay.press('Home')
    await expect(page.locator('#fixture > cb-calendar').getByRole('button', { name: /Monday, October 12, 2026/ })).toBeFocused()
    const dateTrigger = page.locator('cb-date-picker').getByRole('button', { name: 'Publish date' })
    await dateTrigger.click()
    await expect(dateTrigger).toHaveAttribute('aria-expanded', 'true')
    const timeTrigger = page.locator('cb-time-picker').getByRole('button', { name: 'Publish time' })
    await timeTrigger.focus()
    await timeTrigger.press('ArrowDown')
    await expect(page.locator('cb-time-picker').getByRole('option', { name: '9:30 AM' })).toBeFocused()
    await page.locator('cb-time-picker').getByRole('option', { name: '10:00 AM' }).click()
    await expect(page.locator('cb-time-picker')).toHaveJSProperty('value', '10:00')
    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('native flags expose browser controls only when requested', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const date = document.createElement('cb-date-picker') as HTMLElement & { label: string; value: string; native: boolean }
        date.label = 'Native date'; date.value = '2026-10-18'; date.native = true
        const time = document.createElement('cb-time-picker') as HTMLElement & { label: string; value: string; native: boolean }
        time.label = 'Native time'; time.value = '09:30'; time.native = true
        document.querySelector('#fixture')?.append(date, time)
    })
    await expect(page.locator('cb-date-picker').locator('input[type=date]')).toBeVisible()
    await expect(page.locator('cb-time-picker').locator('input[type=time]')).toBeVisible()
    await expect(page.locator('cb-date-picker').getByRole('button')).toBeHidden()
    await expect(page.locator('cb-time-picker').getByRole('button')).toBeHidden()
})
