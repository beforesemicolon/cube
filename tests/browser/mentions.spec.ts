import { expect, test } from '@playwright/test'
import type { TextInput } from '../../components/form/text-input/index.js'
import type { Textarea } from '../../components/form/textarea/index.js'
import type { RichTextEditor } from '../../components/form/rich-text-editor/index.js'
for (const tag of ['cb-text-input', 'cb-textarea', 'cb-rich-text-editor']) test(`${tag} mentions select at the caret, preserve surrounding text, dismiss and respect disabled state`, async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.evaluate(tag => { const control = document.createElement(tag); document.querySelector('#fixture')!.append(control) }, tag)
    const host = page.locator(tag)
    await host.evaluate((element: TextInput | Textarea | RichTextEditor) => {
        element.mentions = { onSelect: detail => { element.dataset.mention = detail.option.id }, options: [{ id: 'total', label: 'Total', insertText: '{{state.total}}', group: 'State' }, { id: 'name', label: 'Name', insertText: '{{props.name}}', group: 'Inputs' }] }
    })
    const field = tag === 'cb-rich-text-editor' ? host.locator('[contenteditable=true]') : host.locator('input:not([type=hidden]),textarea').first()
    await field.fill('The ')
    await field.press('End'); await field.pressSequentially('@to')
    await expect(page.getByRole('listbox', { name: 'Suggestions' })).toBeVisible()
    await field.press('Enter')
    if (tag === 'cb-rich-text-editor') await expect(field).toHaveText('The {{state.total}}')
    else await expect(field).toHaveValue('The {{state.total}}')
    await expect(host).toHaveAttribute('data-mention', 'total')
    if (tag === 'cb-rich-text-editor') {
        await field.press('ControlOrMeta+z'); await expect(field).toHaveText('The @to')
        await field.press('ControlOrMeta+Shift+z'); await expect(field).toHaveText('The {{state.total}}')
    }
    await field.pressSequentially(' @na')
    await expect(page.getByRole('option', { name: /Name/ })).toBeVisible()
    await field.press('Escape'); await expect(page.getByRole('listbox', { name: 'Suggestions' })).toHaveCount(0)
    await field.pressSequentially('x'); await expect(page.getByRole('listbox', { name: 'Suggestions' })).toHaveCount(0)
    await host.evaluate((element: TextInput | Textarea | RichTextEditor) => { element.disabled = true })
    await expect(page.getByRole('listbox', { name: 'Suggestions' })).toHaveCount(0)
})

test('rich text references display resolved values and preserve source through formatting, history and paste', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.evaluate(() => {
        const control = document.createElement('cb-rich-text-editor') as RichTextEditor
        control.value = 'Customer '
        control.boldLabel = 'Bold'
        control.references = [{ value: '{{data.version}}', text: '1.3.6' }, { value: '{{unsafe}}', text: '<img src=x onerror=alert(1)>' }]
        control.mentions = { options: [{ id: 'version', label: 'Version', insertText: '{{data.version}}' }] }
        document.querySelector('#fixture')!.append(control)
    })
    const host = page.locator('cb-rich-text-editor'), editor = host.locator('[contenteditable=true]')
    await editor.focus(); await editor.press('End'); await editor.pressSequentially('@ver'); await editor.press('Enter')
    await expect(editor).toHaveText('Customer 1.3.6')
    await expect(host).toHaveJSProperty('value', 'Customer {{data.version}}')
    const reference = editor.locator('[data-cb-reference]')
    await expect(reference).toHaveAttribute('data-cb-reference', '{{data.version}}')
    await reference.evaluate(node => {
        const range = document.createRange(); range.selectNodeContents(node)
        const selection = document.getSelection()!; selection.removeAllRanges(); selection.addRange(range)
        document.dispatchEvent(new Event('selectionchange'))
    })
    await host.getByRole('button', { name: 'Bold', exact: true }).click()
    await expect(editor.locator('strong [data-cb-reference]')).toHaveText('1.3.6')
    await expect(host).toHaveJSProperty('value', 'Customer <strong>{{data.version}}</strong>')
    await editor.press('ControlOrMeta+z'); await expect(editor.locator('strong')).toHaveCount(0)
    await expect(reference).toHaveText('1.3.6')
    await editor.press('ControlOrMeta+Shift+z'); await expect(editor.locator('strong [data-cb-reference]')).toHaveText('1.3.6')
    await editor.press('End'); await editor.press('ControlOrMeta+b'); await editor.pressSequentially(' testimonials')
    await expect(editor).toHaveText('Customer 1.3.6 testimonials')
    await expect(host).toHaveJSProperty('value', 'Customer <strong>{{data.version}}</strong> testimonials')
    await editor.evaluate(node => {
        const data = new DataTransfer()
        data.setData('text/html', '<span data-cb-reference="{{unsafe}}" contenteditable="false">&lt;img src=x onerror=alert(1)&gt;</span>')
        node.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true, composed: true }))
    })
    await expect(editor.locator('img')).toHaveCount(0)
    await expect(editor).toContainText('<img src=x onerror=alert(1)>')
    await expect(host).toHaveJSProperty('value', 'Customer <strong>{{data.version}}</strong> testimonials{{unsafe}}')
})

for (const layer of ['popover', 'modal'] as const) for (const tag of ['cb-text-input', 'cb-textarea', 'cb-rich-text-editor']) test(`${tag} suggestions are clickable above a ${layer} and Escape preserves the parent layer`, async ({ page }) => {
    await page.setViewportSize({ width: 560, height: 420 })
    await page.goto('/tests/browser/fixture.html')
    await page.evaluate(({ layer, tag }) => {
        const control = document.createElement(tag) as TextInput | Textarea | RichTextEditor
        control.setAttribute('accessible-label', 'Mention field')
        control.style.cssText = 'display:block;width:300px;--z-index-popup:731'
        control.mentions = { options: [{ id: 'total', label: 'Total', insertText: '{{state.total}}', group: 'State' }, { id: 'name', label: 'Name', insertText: '{{props.name}}', group: 'Inputs' }] }
        const container = document.createElement(layer === 'modal' ? 'dialog' : 'cb-popover')
        container.setAttribute('aria-label', 'Outer layer')
        container.setAttribute('accessible-label', 'Outer layer')
        if (layer === 'popover') {
            const trigger = document.createElement('button'); trigger.slot = 'trigger'; trigger.textContent = 'Open layer'
            container.append(trigger)
        } else container.style.cssText = 'width:330px;height:130px;overflow:auto;padding:16px'
        container.append(control)
        document.querySelector('#fixture')!.append(container)
        if (container instanceof HTMLDialogElement) container.showModal()
    }, { layer, tag })
    if (layer === 'popover') await page.getByRole('button', { name: 'Open layer' }).click()
    const parent = page.getByRole('dialog', { name: 'Outer layer', exact: true })
    const host = page.locator(tag), field = tag === 'cb-rich-text-editor' ? host.locator('[contenteditable=true]') : host.locator('input:not([type=hidden]),textarea').first()
    await field.fill('The '); await field.press('End'); await field.pressSequentially('@to')
    const popup = page.locator('[data-cb-mentions]')
    await expect(popup).toBeVisible()
    expect(await popup.evaluate(node => node.matches(':popover-open'))).toBe(true)
    await expect(popup).toHaveCSS('z-index', '731')
    await expect(parent.locator('[data-cb-mentions]')).toHaveCount(1)
    const bounds = await popup.boundingBox()
    if (!bounds) throw new Error('Suggestion popup has no bounds.')
    expect(bounds.x).toBeGreaterThanOrEqual(8); expect(bounds.y).toBeGreaterThanOrEqual(8)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(552); expect(bounds.y + bounds.height).toBeLessThanOrEqual(412)
    await page.getByRole('option', { name: /Total/ }).click()
    await expect(host).toHaveJSProperty('value', 'The {{state.total}}')
    await expect(parent).toBeVisible()
    await field.pressSequentially(' @na')
    await expect(page.getByRole('option', { name: /Name/ })).toBeVisible()
    await field.press('Escape')
    await expect(popup).toHaveCount(0)
    await expect(parent).toBeVisible()
})

for (const tag of ['cb-text-input', 'cb-textarea']) test(`${tag} resolves references without changing source, surrounding edits, history or form values`, async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.evaluate(tag => {
        const form = document.createElement('form'), control = document.createElement(tag) as TextInput | Textarea
        control.name = 'copy'; control.value = 'Version '
        control.references = [{ value: '{{data.version}}', text: '1.3.6' }]
        control.mentions = { options: [{ id: 'version', label: 'Version', insertText: '{{data.version}}' }] }
        form.append(control); document.querySelector('#fixture')!.append(form)
    }, tag)
    const host = page.locator(tag), field = host.getByRole('textbox')
    await field.focus(); await field.press('End'); await field.pressSequentially('@ver')
    await page.getByRole('option', { name: 'Version', exact: true }).click()
    await expect(field).toHaveValue('Version 1.3.6')
    await expect(host).toHaveJSProperty('value', 'Version {{data.version}}')
    await field.pressSequentially(' works & <ok>')
    await expect(field).toHaveValue('Version 1.3.6 works & <ok>')
    await expect(host).toHaveJSProperty('value', 'Version {{data.version}} works & <ok>')
    expect(await page.locator('form').evaluate(node => new FormData(node as HTMLFormElement).get('copy'))).toBe('Version {{data.version}} works & <ok>')
    await field.press('ControlOrMeta+z')
    await expect(field).toHaveValue('Version 1.3.6 works & <ok')
    await field.press('ControlOrMeta+Shift+z')
    await expect(field).toHaveValue('Version 1.3.6 works & <ok>')
    await field.evaluate((node: HTMLInputElement | HTMLTextAreaElement) => node.setSelectionRange(8, 10))
    await field.press('Backspace')
    await expect(field).toHaveValue('Version  works & <ok>')
    await expect(host).toHaveJSProperty('value', 'Version  works & <ok>')
    await field.press('ControlOrMeta+z')
    await expect(field).toHaveValue('Version 1.3.6 works & <ok>')
    await host.evaluate((node: TextInput | Textarea) => { node.references = [{ value: '{{data.version}}', text: '2.0' }] })
    await expect(field).toHaveValue('Version 2.0 works & <ok>')
    await field.fill('literal 1.3.6')
    await expect(host).toHaveJSProperty('value', 'literal 1.3.6')
})
