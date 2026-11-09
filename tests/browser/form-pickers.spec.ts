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
        select.style.inlineSize = '180px'
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

    await search.fill('svelte')
    await select.getByRole('option', { name: 'Svelte' }).click()
    await search.fill('solid')
    await select.getByRole('option', { name: 'Solid' }).click()
    const trigger = select.getByRole('button', { name: 'Frameworks: React, Solid, Svelte, Vue' })
    const triggerHeight = await trigger.evaluate(element => element.getBoundingClientRect().height)
    expect(triggerHeight).toBeGreaterThan(28)
    await expect(select.locator('[part~="value-item"]')).toHaveCount(4)

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
            stacked: boolean
            options: Array<{ value: string; label: string; disabled?: boolean }>
        }
        group.label = 'Contact method'
        group.name = 'contact'
        group.value = 'email'
        group.required = true
        group.stacked = true
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
    await expect(group.getByRole('radiogroup')).toHaveCSS('flex-direction', 'column')
    const email = group.getByRole('radio', { name: 'Email' })
    const sms = group.getByRole('radio', { name: 'Text message' })
    await expect(email).toBeChecked()
    const indicatorGeometry = await email.evaluate(input => {
        const bounds = input.getBoundingClientRect()
        const style = getComputedStyle(input)
        const dotStyle = getComputedStyle(input, '::before')
        return {
            width: bounds.width,
            height: bounds.height,
            padding: style.padding,
            alignItems: style.alignItems,
            justifyItems: style.justifyItems,
            dotWidth: parseFloat(dotStyle.width),
            dotHeight: parseFloat(dotStyle.height),
        }
    })
    expect(indicatorGeometry).toMatchObject({
        width: 24,
        height: 24,
        padding: '0px',
        alignItems: 'center',
        justifyItems: 'center',
    })
    // The checked dot occupies 44% of the 22px inner control, rounded to layout pixels.
    expect(indicatorGeometry.dotWidth).toBeCloseTo(22 * .44, 1)
    expect(indicatorGeometry.dotHeight).toBeCloseTo(22 * .44, 1)
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
    const defaultPopupSize = await unitSelect.locator('[part~="popup"]').evaluate(popup => {
        const rect = popup.getBoundingClientRect()
        return { width: rect.width, height: rect.height }
    })
    expect(defaultPopupSize.width).toBeLessThanOrEqual(160.5)
    expect(defaultPopupSize.height).toBeLessThanOrEqual(240.5)
    await page.keyboard.press('ArrowDown')
    await expect(unitSelect.getByRole('option', { name: 'percent' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(input).toHaveJSProperty('unit', '%')
    await expect(input).toHaveJSProperty('value', 320)
    await expect(input.locator('input[type="number"]')).toHaveAttribute('aria-valuetext', '320 percent')

    const event = await input.evaluate(element => new Promise<{ unit: string; value: number }>(resolve => {
        element.addEventListener('unitchange', customEvent => {
            const detail = (customEvent as CustomEvent<{ unit: string }>).detail
            resolve({ unit: detail.unit, value: (element as HTMLElement & { value: number }).value })
        }, { once: true })
        const component = element as HTMLElement & { chooseUnit(unit: string): boolean }
        component.chooseUnit('px')
    }))
    expect(event).toEqual({ unit: 'px', value: 320 })

    await input.evaluate(element => {
        const component = element as HTMLElement & { popupMaxWidth: string; popupMaxHeight: string }
        component.popupMaxWidth = '104px'
        component.popupMaxHeight = '72px'
    })
    await trigger.click()
    const constrainedPopupSize = await unitSelect.locator('[part~="popup"]').evaluate(popup => {
        const rect = popup.getBoundingClientRect()
        const listbox = popup.querySelector<HTMLElement>('[part~="listbox"]')
        return { width: rect.width, height: rect.height, scrollHeight: listbox?.scrollHeight ?? 0, clientHeight: listbox?.clientHeight ?? 0 }
    })
    expect(constrainedPopupSize.width).toBeLessThanOrEqual(104.5)
    expect(constrainedPopupSize.height).toBeLessThanOrEqual(72.5)
    expect(constrainedPopupSize.scrollHeight).toBeGreaterThan(constrainedPopupSize.clientHeight)
    await trigger.press('Escape')

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
        const [leftHost, fieldNode, rightHost] = [...shell.children]
        const leftNode = leftHost?.shadowRoot?.querySelector<HTMLElement>('[part~="control"]')
        const rightNode = rightHost?.shadowRoot?.querySelector<HTMLElement>('[part~="control"]')
        if (!leftNode || !fieldNode || !rightNode) throw new Error('Stepper segments are incomplete')
        const left = getComputedStyle(leftNode)
        const field = getComputedStyle(fieldNode)
        const right = getComputedStyle(rightNode)
        return {
            left: [left.borderTopLeftRadius, left.borderTopRightRadius],
            field: [field.borderTopLeftRadius, field.borderTopRightRadius, getComputedStyle(fieldNode).marginInlineStart],
            right: [right.borderTopLeftRadius, right.borderTopRightRadius, getComputedStyle(rightHost).marginInlineStart],
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
        const combo = document.createElement('cb-combobox') as HTMLElement & { label: string; placeholder: string; autocomplete: string; options: Array<{ value: string; label: string }>; size: 'sm' | 'lg' }
        combo.label = 'Font family'; combo.placeholder = 'Search fonts'; combo.autocomplete = 'both'; combo.options = [{ value: 'inter', label: 'Inter' }, { value: 'source', label: 'Source Sans 3' }]
        const textInput = document.createElement('cb-text-input') as HTMLElement & { label: string; size: 'sm' | 'lg' }
        textInput.label = 'Comparison input'
        document.querySelector('#fixture')?.append(combo, textInput)
    })
    const combo = page.locator('cb-combobox')
    const textInput = page.locator('cb-text-input')
    const controlHeights = async (): Promise<number[]> => Promise.all([
        combo.locator('[part~="input-shell"]').evaluate(element => element.getBoundingClientRect().height),
        textInput.locator('[part~="control"]').evaluate(element => element.getBoundingClientRect().height),
    ])
    expect(await controlHeights()).toEqual([28, 28])
    await combo.evaluate(element => { (element as HTMLElement & { size: 'lg' }).size = 'lg' })
    await textInput.evaluate(element => { (element as HTMLElement & { size: 'lg' }).size = 'lg' })
    expect(await controlHeights()).toEqual([44, 44])
    const input = page.getByRole('combobox', { name: 'Font family' })
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await input.focus()
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await input.fill('Sou')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('option', { name: 'Source Sans 3' })).toBeVisible()
    await input.press('ArrowDown')
    await expect(page.getByRole('option', { name: 'Source Sans 3' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('cb-combobox')).toHaveJSProperty('value', 'source')
    await expect(input).toHaveValue('Source Sans 3')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(combo.getByRole('listbox')).toBeHidden()
})

test('calendar and custom date and time pickers support keyboard-ready themed popups', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const calendar = document.createElement('cb-calendar') as HTMLElement & { label: string; value: string; firstDayOfWeek: number; previousLabel: string; nextLabel: string }
        calendar.label = 'Publishing calendar'; calendar.value = '2026-10-18'; calendar.firstDayOfWeek = 1; calendar.previousLabel = 'Previous month'; calendar.nextLabel = 'Next month'
        const date = document.createElement('cb-date-picker') as HTMLElement & { label: string; value: string; previousLabel: string; nextLabel: string }
        date.label = 'Publish date'; date.value = '2026-10-18'; date.previousLabel = 'Previous month'; date.nextLabel = 'Next month'
        const time = document.createElement('cb-time-picker') as HTMLElement & { label: string; value: string; min: string; max: string; popupMaxWidth: string; popupMaxHeight: string }
        time.label = 'Publish time'; time.value = '09:30'; time.min = '08:00'; time.max = '12:00'
        document.querySelector('#fixture')?.append(calendar, date, time)
    })
    const calendar = page.locator('#fixture > cb-calendar')
    await expect(page.getByRole('group', { name: 'Publishing calendar' })).toBeVisible()
    await expect(calendar.locator('cb-button[part="previous"]')).toHaveCount(1)
    await expect(calendar.locator('cb-button[part="next"]')).toHaveCount(1)
    const previous = calendar.getByRole('button', { name: 'Previous month' })
    const previousStyle = await previous.evaluate(element => {
        const style = getComputedStyle(element)
        return { backgroundColor: style.backgroundColor, borderTopColor: style.borderTopColor }
    })
    expect(previousStyle).toEqual({ backgroundColor: 'rgba(0, 0, 0, 0)', borderTopColor: 'rgba(0, 0, 0, 0)' })
    const selectedDay = calendar.getByRole('button', { name: /Sunday, October 18, 2026/ })
    await expect(selectedDay).toHaveAttribute('aria-pressed', 'true')
    await selectedDay.focus()
    await selectedDay.press('Home')
    await expect(calendar.getByRole('button', { name: /Monday, October 12, 2026/ })).toBeFocused()
    const dateTrigger = page.locator('cb-date-picker').getByRole('button', { name: 'Publish date' })
    await dateTrigger.click()
    await expect(dateTrigger).toHaveAttribute('aria-expanded', 'true')
    const timeTrigger = page.locator('cb-time-picker').getByRole('button', { name: 'Publish time' })
    await timeTrigger.focus()
    await timeTrigger.press('ArrowDown')
    await expect(page.locator('cb-time-picker').getByRole('option', { name: '9:30 AM' })).toBeFocused()
    const defaultTimePopupSize = await page.locator('cb-time-picker').locator('[part~="popup"]').evaluate(popup => {
        const rect = popup.getBoundingClientRect()
        return { width: rect.width, height: rect.height }
    })
    expect(defaultTimePopupSize.width).toBeLessThanOrEqual(240.5)
    expect(defaultTimePopupSize.height).toBeLessThanOrEqual(240.5)
    await page.locator('cb-time-picker').getByRole('option', { name: '10:00 AM' }).click()
    await expect(page.locator('cb-time-picker')).toHaveJSProperty('value', '10:00')
    await page.locator('cb-time-picker').evaluate(element => {
        const component = element as HTMLElement & { popupMaxWidth: string; popupMaxHeight: string }
        component.popupMaxWidth = '180px'
        component.popupMaxHeight = '120px'
    })
    await timeTrigger.click()
    const constrainedTimePopupSize = await page.locator('cb-time-picker').locator('[part~="popup"]').evaluate(popup => {
        const rect = popup.getBoundingClientRect()
        return { width: rect.width, height: rect.height, scrollHeight: popup.scrollHeight, clientHeight: popup.clientHeight }
    })
    expect(constrainedTimePopupSize.width).toBeLessThanOrEqual(180.5)
    expect(constrainedTimePopupSize.height).toBeLessThanOrEqual(120.5)
    expect(constrainedTimePopupSize.scrollHeight).toBeGreaterThan(constrainedTimePopupSize.clientHeight)
    await timeTrigger.press('Escape')
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

