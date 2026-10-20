import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

interface JsonEditorElement extends HTMLElement {
    value: string
    label: string
    accessibleLabel: string
    indent: number
    formatLabel: string
    validLabel: string
    invalidLabel: string
    positionLabel: string
}

interface FieldElement extends HTMLElement {
    label: string
    accessibleLabel: string
}

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-json-editor')))
    await page.evaluate(() => {
        const field = document.createElement('cb-field') as FieldElement
        field.label = 'Configuration'
        field.accessibleLabel = 'JSON configuration field'
        const editor = document.createElement('cb-json-editor') as JsonEditorElement
        Object.assign(editor, {
            value: '', accessibleLabel: 'JSON configuration', indent: 2,
            formatLabel: 'Format JSON', validLabel: 'Valid JSON', invalidLabel: 'Invalid JSON: {error}',
            positionLabel: 'Line {line}, column {column}',
        })
        field.append(editor)
        document.querySelector('#fixture')?.append(field)
    })
})

test('pairs JSON delimiters and indents a new object block', async ({ page }) => {
    const editor = page.locator('cb-json-editor')
    const control = editor.getByRole('textbox', { name: 'JSON configuration' })
    await control.focus()
    await control.press('Shift+BracketLeft')
    await expect(control).toHaveValue('{}')
    await expect(control).toHaveJSProperty('selectionStart', 1)
    await control.press('Enter')
    await expect(control).toHaveValue('{\n  \n}')
    await expect(control).toHaveJSProperty('selectionStart', 4)

    await control.press('Shift+Quote'); await page.keyboard.type('name'); await control.press('Shift+Quote'); await control.press('Shift+Semicolon')
    await control.press('Shift+Quote'); await page.keyboard.type('cube'); await control.press('Shift+Quote')
    await expect(control).toHaveValue('{\n  "name": "cube"\n}')
    await expect(editor).toHaveJSProperty('value', '{\n  "name": "cube"\n}')
    await expect(editor.getByRole('status')).toHaveText('Valid JSON')
    await expect(editor.getByRole('button', { name: 'Format JSON' })).toBeEnabled()
    await expect.poll(async () => editor.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(700)
    await page.locator('cb-field').evaluate(element => { (element as HTMLElement).style.inlineSize = '260px' })
    await expect.poll(async () => editor.evaluate(element => element.getBoundingClientRect().width)).toBeLessThanOrEqual(260)
})

test('wraps selected text and preserves browser undo and redo', async ({ page }) => {
    const control = page.locator('cb-json-editor').getByRole('textbox', { name: 'JSON configuration' })
    await control.fill('name')
    await control.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
    await control.press('Shift+Quote')
    await expect(control).toHaveValue('"name"')
    await control.press(process.platform === 'darwin' ? 'Meta+Z' : 'Control+Z')
    await expect(control).toHaveValue('name')
    await control.press(process.platform === 'darwin' ? 'Meta+Shift+Z' : 'Control+Y')
    await expect(control).toHaveValue('"name"')
})

test('removes empty pairs together and disables formatting while JSON is invalid', async ({ page }) => {
    const editor = page.locator('cb-json-editor')
    const control = editor.getByRole('textbox', { name: 'JSON configuration' })
    await control.focus()
    await control.press('Shift+BracketLeft')
    await control.press('Backspace')
    await expect(control).toHaveValue('')
    await control.fill('{"name":}')
    await expect(editor.getByRole('status')).toContainText('Invalid JSON:')
    await expect(editor.getByRole('button', { name: 'Format JSON' })).toBeDisabled()
    await control.fill('{"name":"cube"}')
    await expect(editor.getByRole('status')).toHaveText('Valid JSON')
    await editor.getByRole('button', { name: 'Format JSON' }).click()
    await expect(control).toHaveValue('{\n  "name": "cube"\n}')

    const accessibility = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(accessibility.violations).toEqual([])
})
