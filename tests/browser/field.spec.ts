import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-field')))
})

test('field wraps controls without becoming a second control shell', async ({ page }) => {
    await page.evaluate(() => {
        const field = document.createElement('cb-field') as HTMLElement & {
            label: string
            description: string
            helpText: string
            success: boolean
            successText: string
        }
        Object.assign(field, {
            label: 'Project name',
            description: 'Used in the published URL.',
            helpText: 'Choose a recognizable name.',
            success: true,
            successText: 'The name is available.',
        })
        const input = document.createElement('cb-text-input') as HTMLElement & { value: string }
        input.value = 'Cube design system'
        field.append(input)
        document.querySelector('#fixture')?.append(field)
    })

    const field = page.locator('cb-field')
    const control = field.locator('cb-text-input')
    const input = control.getByRole('textbox', { name: 'Project name' })
    await expect(field.locator('[part~="label"]')).toHaveText('Project name')
    await expect(field.locator('[part~="description"]')).toHaveText('Used in the published URL.')
    await expect(field.locator('[part~="help"]')).toHaveText('Choose a recognizable name.')
    await expect(field.locator('[part~="success"]')).toHaveText('The name is available.')
    await expect(control.locator('[part~="label"]')).toHaveCount(0)

    const shellStyles = await field.evaluate(node => {
        const host = getComputedStyle(node)
        const container = node.shadowRoot?.querySelector<HTMLElement>('[part~="control-container"]')
        const controlContainer = container ? getComputedStyle(container) : null
        return {
            hostBorder: host.borderTopWidth,
            hostPadding: host.paddingTop,
            containerBorder: controlContainer?.borderTopWidth,
            containerPadding: controlContainer?.paddingTop,
        }
    })
    expect(shellStyles).toEqual({ hostBorder: '0px', hostPadding: '0px', containerBorder: '0px', containerPadding: '0px' })

    await field.locator('[part~="label"]').click()
    await expect(input).toBeFocused()

    await field.evaluate((node: HTMLElement & { disabled: boolean }) => { node.disabled = true })
    await expect(control).toHaveAttribute('data-field-disabled')
    await expect(input).toBeDisabled()

    await field.evaluate((node: HTMLElement & { disabled: boolean; invalid: boolean; errorText: string }) => {
        node.disabled = false
        node.invalid = true
        node.errorText = 'Choose another project name.'
    })
    await expect(field).toHaveAttribute('data-invalid')
    await expect(field).not.toHaveAttribute('data-success')
    await expect(field.getByRole('alert')).toHaveText('Choose another project name.')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(field.locator('[part~="success"]')).toBeHidden()

    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('field labels delegate focus through composite controls', async ({ page }) => {
    await page.evaluate(() => {
        const wrap = (id: string, label: string, control: HTMLElement): HTMLElement => {
            const field = document.createElement('cb-field') as HTMLElement & { label: string }
            field.id = id
            field.label = label
            field.append(control)
            return field
        }

        const select = document.createElement('cb-select')
        Object.assign(select, { value: 'desktop', options: [{ value: 'desktop', label: 'Desktop' }, { value: 'mobile', label: 'Mobile' }] })
        const list = document.createElement('cb-editable-list')
        Object.assign(list, { inputLabel: 'New redirect path', addLabel: 'Add path', emptyLabel: 'No paths' })
        const linked = document.createElement('cb-linked-values')
        Object.assign(linked, { firstLabel: 'Width', secondLabel: 'Height', linkLabel: 'Link dimensions', unlinkLabel: 'Unlink dimensions' })
        const json = document.createElement('cb-json-editor')
        Object.assign(json, { value: '{"name":"cube"}', formatLabel: 'Format JSON', validLabel: 'Valid JSON', invalidLabel: 'Invalid JSON', positionLabel: 'Line {line}, column {column}' })
        const gradient = document.createElement('cb-gradient-editor')
        Object.assign(gradient, { angleLabel: 'Angle', typeLabel: 'Gradient type', linearLabel: 'Linear', radialLabel: 'Radial' })
        document.querySelector('#fixture')?.append(
            wrap('select-field', 'Device', select),
            wrap('list-field', 'Redirects', list),
            wrap('linked-field', 'Dimensions', linked),
            wrap('json-field', 'Configuration', json),
            wrap('gradient-field', 'Background gradient', gradient),
        )
    })

    await page.locator('#select-field [id^="cb-field-label"]').click()
    await expect(page.locator('#select-field cb-select').getByRole('button', { name: /Device/ })).toBeFocused()
    await page.locator('#list-field [id^="cb-field-label"]').click()
    await expect(page.locator('#list-field').getByRole('textbox', { name: 'New redirect path' })).toBeFocused()
    await page.locator('#linked-field [id^="cb-field-label"]').click()
    await expect(page.locator('#linked-field').getByRole('spinbutton', { name: 'Width' })).toBeFocused()
    await page.locator('#json-field [id^="cb-field-label"]').click()
    await expect(page.locator('#json-field').getByRole('textbox', { name: 'Configuration' })).toBeFocused()
    await page.locator('#gradient-field [id^="cb-field-label"]').click()
    await expect(page.locator('#gradient-field input[part~="angle"]')).toBeFocused()
})
