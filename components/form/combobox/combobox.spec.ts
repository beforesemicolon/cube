import { expect, test } from '@playwright/test'
import type { Combobox } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

test('ghost combobox keys move their caret without reversing text or custom-value editing', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-combobox')))
    await page.evaluate(() => {
        const control = document.createElement('cb-combobox') as Combobox
        Object.assign(control, { accessibleLabel: 'Attribute', variant: 'ghost', caretPosition: 'start', allowCustom: true, toggleLabel: 'Choose attribute', options: [{ value: 'alt', label: 'alt' }, { value: 'loading', label: 'loading' }], value: 'alt' } satisfies Partial<Combobox>)
        document.getElementById('fixture')!.append(control)
    })
    const host = page.locator('cb-combobox'), input = host.getByRole('combobox'), toggle = host.locator('[part~=toggle]')
    await expect(host.locator('[part~=input-shell]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    for (const position of ['start', 'end'] as const) {
        await host.evaluate((node, position) => { (node as Combobox).caretPosition = position }, position)
        await expect.poll(async () => {
            const caret = await toggle.boundingBox(), value = await input.boundingBox()
            return !!caret && !!value && (position === 'start' ? caret.x + caret.width <= value.x + 1 : caret.x >= value.x + value.width - 1)
        }).toBe(true)
    }
    await toggle.click()
    await expect(host.getByRole('listbox')).toHaveCSS('direction', 'ltr')
    await host.getByRole('option', { name: 'loading', exact: true }).click()
    await input.fill('data-custom'); await input.press('Enter')
    await expect(host).toHaveJSProperty('value', 'data-custom')
    await expect(input).toHaveCSS('direction', 'ltr')
})

componentContract('cb-combobox', 'form--combobox', async ({ host }) => {
    await expect(host.locator('cb-icon[part~=prefix]')).toHaveCount(0)
    // Exercise the linked story as rendered, before changing any of its props.
    const input = host.getByRole('combobox')
    await expect(host.getByRole('button', { name: 'Remove Inter', exact: true })).toBeVisible()
    await expect(host.getByRole('button', { name: 'Remove Source Sans 3', exact: true })).toBeVisible()
    await input.focus()
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await input.click()
    await expect(host.getByRole('option')).toHaveCount(6)
    await host.getByRole('option', { name: 'Georgia', exact: true }).click()
    await host.getByRole('option', { name: 'Arial', exact: true }).click()
    await expect(host).toHaveJSProperty('value', ['inter', 'source-sans', 'georgia', 'arial'])
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await host.getByRole('button', { name: 'Remove Source Sans 3', exact: true }).click()
    await expect(host).toHaveJSProperty('value', ['inter', 'georgia', 'arial'])
    await input.fill('Rob')
    await expect(host.getByRole('option')).toHaveCount(1)
    await expect(host.getByRole('option', { name: 'Roboto', exact: true })).toHaveAttribute('data-highlighted', 'true')
    await input.press('Enter')
    await expect(host.getByRole('button', { name: 'Remove Roboto', exact: true })).toBeVisible()
    await expect(input).toHaveValue('')
    await expect(host.getByRole('option')).toHaveCount(6)
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await input.fill('Courier')
    await input.press('Space')
    await expect(host.getByRole('button', { name: 'Remove Courier New', exact: true })).toBeVisible()
    await host.evaluate(node => node.setAttribute('allow-custom', ''))
    await input.fill('Custom font')
    await input.press('Enter')
    await expect(host.getByRole('button', { name: 'Remove Custom font', exact: true })).toBeVisible()
    await input.press('Escape')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await host.evaluate(node => { Object.assign(node, { multi: false, value: 'inter' } satisfies Partial<Combobox>) })
    await expect(host.locator("input[part=input]").first()).toHaveValue("Inter")
    await host.evaluate(node => {
        Object.assign(node, {
            options: [
                { value: 'https://example.com', label: 'example.com' },
                { value: 'https://preview.example.com', label: 'preview.example.com' },
            ],
            value: 'https://example.com',
            open: true,
        } satisfies Partial<Combobox>)
    })
    await expect(host.getByRole('option')).toHaveCount(2)
    await expect(host.getByRole('option', { name: 'preview.example.com', exact: true })).toBeVisible()
    await host.evaluate(node => node.setAttribute('error-text', 'Choose an option or enter a whole number.'))
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAttribute('aria-description', /Choose an option or enter a whole number\./)
    await expect(host).toHaveJSProperty('validationMessage', 'Choose an option or enter a whole number.')
    await host.evaluate(node => node.removeAttribute('error-text'))
    await expect(input).not.toHaveAttribute('aria-invalid', 'true')
    await expect(input).not.toHaveAttribute('aria-description', /Choose an option or enter a whole number\./)
    await host.evaluate(node => { Object.assign(node, { options: [{ value: 'Inter, Georgia', label: 'Inter, Georgia' }], value: 'Inter, G', open: true } satisfies Partial<Combobox>) })
    await expect(host.getByRole('option', { name: 'Inter, Georgia', exact: true })).toBeVisible()
    await host.getByRole('option', { name: 'Inter, Georgia', exact: true }).click()
    await expect(host.getByRole('combobox')).toHaveValue('Inter, Georgia')
    await host.evaluate(node => {
        node.setAttribute('options', JSON.stringify([{ value: 'Arial', label: 'Arial' }]))
        node.addEventListener('change', event => {
            if (event instanceof CustomEvent && (event as CustomEvent<{ value: string }>).detail.value === 'Inter, G')
                node.setAttribute('options', JSON.stringify([{ value: 'Inter, Georgia', label: 'Inter, Georgia' }]))
        })
    })
    await host.getByRole('combobox').fill('Inter, G')
    await expect(host.getByRole('option', { name: 'Inter, Georgia', exact: true })).toBeVisible()
    await host.evaluate(node => {
        Object.assign(node, { multi: true, value: ['one'], options: [{ value: 'one', label: 'First' }, { value: 'two', label: 'Second' }], removeLabel: 'Remove {label}', open: true } satisfies Partial<Combobox>)
    })
    await host.getByRole('option', { name: 'Second', exact: true }).click()
    await expect(host).toHaveJSProperty('value', ['one', 'two'])
    await expect(host.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
    await host.getByRole('button', { name: 'Remove First', exact: true }).click()
    await expect(host).toHaveJSProperty('value', ['two'])
    await expect(host.getByRole('combobox')).toHaveValue('')
    await host.evaluate(node => {
        Object.assign(node, {
            multi: false,
            searchable: true,
            loading: false,
            value: '',
            options: [
                {
                    value: 'remote',
                    label: 'Remote category',
                    selectedLabel: 'Remote',
                    description: 'Loaded asynchronously',
                    badge: 'API',
                },
            ],
        } satisfies Partial<Combobox>)
        node.addEventListener('search', event => {
            if (event instanceof CustomEvent)
                node.dataset.searchQuery = event.detail.query
        })
    })
    await host.getByRole('combobox').fill('rem')
    await expect(host).toHaveAttribute('data-search-query', 'rem')
    await expect(host).toHaveJSProperty('value', '')
    await expect(host.locator('[part~=option-description]')).toHaveText(
        'Loaded asynchronously'
    )
    await expect(host.locator('cb-badge[part~=option-badge]')).toHaveText('API')
    await host.getByRole('option', { name: 'Remote category' }).click()
    await expect(host).toHaveJSProperty('value', 'remote')
    await host.evaluate(node => {
        Object.assign(node, {
            multi: true,
            value: ['remote'],
        } satisfies Partial<Combobox>)
    })
    await expect(host.locator('[part~=selection-label]')).toHaveText('Remote')
})
