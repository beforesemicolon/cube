import { expect, test } from '@playwright/test'

const studioFields = ['text-input', 'textarea', 'number-input', 'unit-input', 'stepper', 'range-slider', 'checkbox', 'switch'] as const

interface NumericField extends HTMLElement {
    value: number | null
    min: number
    max: number
    step: number
    name: string
    readOnly: boolean
    disabled: boolean
    required: boolean
}

for (const name of studioFields) test(`${name}: custom error props affect validity, accessible description and invalid styling`, async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-text-input')))
    await page.evaluate(name => {
        const field = document.createElement(`cb-${name}`)
        Object.assign(field, { accessibleLabel: 'Audited field', description: 'Field instructions', value: name === 'checkbox' || name === 'switch' ? false : '24' })
        document.querySelector('#fixture')?.append(field)
    }, name)
    const host = page.locator(`cb-${name}`)
    const control = host.locator('input, textarea').first()
    await host.evaluate(node => node.setAttribute('error-text', 'Please correct this value.'))
    await expect.poll(() => control.evaluate(node => (node as HTMLInputElement | HTMLTextAreaElement).validity.customError)).toBe(true)
    await expect(control).toHaveAttribute('aria-invalid', 'true')
    await expect(control).toHaveAttribute('aria-description', 'Field instructions Please correct this value.')
    await expect(host).toHaveAttribute('data-invalid', '')
    await host.evaluate(node => node.setAttribute('error-text', ''))
    await expect.poll(() => control.evaluate(node => (node as HTMLInputElement | HTMLTextAreaElement).validity.customError)).toBe(false)
    await expect(control).not.toHaveAttribute('aria-invalid')
    await expect(control).toHaveAttribute('aria-description', 'Field instructions')
    await expect(host).not.toHaveAttribute('data-invalid')
})

for (const name of ['number-input', 'unit-input', 'stepper', 'range-slider'] as const) test(`${name}: numeric and form props remain live after mount`, async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-number-input')))
    await page.evaluate(name => {
        const form = document.createElement('form')
        form.id = 'audited-form'
        const field = document.createElement(`cb-${name}`) as NumericField
        Object.assign(field, { name: 'original', value: 24, accessibleLabel: 'Quantity' })
        form.append(field)
        document.querySelector('#fixture')?.append(form)
    }, name)
    const host = page.locator(`cb-${name}`)
    const control = host.locator('input').first()
    const submitted = (): Promise<[string, FormDataEntryValue][]> => page.locator('#audited-form').evaluate(node => [...new FormData(node as HTMLFormElement).entries()])
    await host.evaluate(node => Object.assign(node, { min: 10, max: 20, step: 2, value: 14, name: 'quantity', required: true }))
    await expect(control).toHaveAttribute('min', '10')
    await expect(control).toHaveAttribute('max', '20')
    await expect(control).toHaveAttribute('step', '2')
    await expect(control).toHaveValue('14')
    await expect(control).toHaveJSProperty('required', true)
    await expect.poll(submitted).toEqual([['quantity', '14']])

    await host.evaluate(node => { (node as NumericField).readOnly = true })
    await expect(control).toHaveAttribute('readonly')
    if (name === 'range-slider') {
        await control.focus()
        await control.press('ArrowRight')
        await expect(control).toHaveValue('14')
    } else {
        await expect(control).not.toBeEditable()
    }
    await expect.poll(submitted).toEqual([['quantity', '14']])
    await host.evaluate(node => { (node as NumericField).disabled = true })
    await expect(control).toBeDisabled()
    await expect.poll(submitted).toEqual([])
    await host.evaluate(node => Object.assign(node, { disabled: false, readOnly: false }))
    await expect(control).toBeEnabled()
    await expect.poll(submitted).toEqual([['quantity', '14']])

    if (name === 'range-slider') {
        await control.focus()
        await control.press('Home')
        await expect(control).toHaveValue('10')
        await control.press('End')
        await expect(control).toHaveValue('20')
        await expect.poll(submitted).toEqual([['quantity', '20']])
    } else {
        await control.fill('15')
        await expect.poll(() => control.evaluate(node => (node as HTMLInputElement).validity.stepMismatch)).toBe(true)
        await host.evaluate(node => { (node as NumericField).step = 1 })
        await expect.poll(() => control.evaluate(node => (node as HTMLInputElement).validity.valid)).toBe(true)
        await control.fill('21')
        await expect.poll(() => control.evaluate(node => (node as HTMLInputElement).validity.rangeOverflow)).toBe(true)
        await host.evaluate(node => { (node as NumericField).max = 30 })
        await expect.poll(() => control.evaluate(node => (node as HTMLInputElement).validity.valid)).toBe(true)
        await control.fill('9')
        await expect.poll(() => control.evaluate(node => (node as HTMLInputElement).validity.rangeUnderflow)).toBe(true)
        await host.evaluate(node => { (node as NumericField).min = 0 })
        await expect.poll(() => control.evaluate(node => (node as HTMLInputElement).validity.valid)).toBe(true)
        await control.fill('')
        await expect.poll(() => control.evaluate(node => (node as HTMLInputElement).validity.valueMissing)).toBe(true)
        await host.evaluate(node => { (node as NumericField).required = false })
        await expect.poll(() => control.evaluate(node => (node as HTMLInputElement).validity.valid)).toBe(true)
    }
})
