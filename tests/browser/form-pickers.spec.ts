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
    await trigger.focus()
    await trigger.press('ArrowDown')
    await expect(page.locator('cb-select').first().getByRole('option', { name: 'Desktop' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('cb-select').first().getByRole('option', { name: 'Mobile' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('cb-select').first()).toHaveJSProperty('value', 'mobile')
    await expect(page.locator('cb-select').nth(1).getByRole('combobox', { name: 'Browser device' })).toHaveValue('mobile')
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
        const calendar = document.createElement('cb-calendar') as HTMLElement & { label: string; value: string; firstDayOfWeek: number }
        calendar.label = 'Publishing calendar'; calendar.value = '2026-10-18'; calendar.firstDayOfWeek = 1
        const date = document.createElement('cb-date-picker') as HTMLElement & { label: string; value: string }
        date.label = 'Publish date'; date.value = '2026-10-18'
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
