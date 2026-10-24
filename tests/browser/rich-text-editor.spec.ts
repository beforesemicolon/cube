import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { RichTextEditor, RichTextEditorProps } from '../../components/form/rich-text-editor/index.js'

interface Change { readonly value: string; readonly previousValue: string }
declare global { interface Window { richChanges: Change[]; richBefore: number; richLeaks: string[]; richErrors: string[]; richExecuted?: boolean } }
const errors = new WeakMap<Page, string[]>()
test.beforeEach(async ({ page }) => {
    const failures: string[] = []; errors.set(page, failures)
    page.on('pageerror', error => failures.push(error.message))
    await page.addInitScript(() => {
        window.richChanges = []; window.richBefore = 0; window.richLeaks = []; window.richErrors = []
        document.addEventListener('error', event => {
            if (!(event instanceof CustomEvent)) return
            const detail = (event as CustomEvent<{ code?: string; error?: Error }>).detail
            if (detail?.code === 'COMPONENT_ERROR') window.richErrors.push(detail.error?.message ?? detail.code)
        }, true)
    })
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-rich-text-editor')))
})
test.afterEach(async ({ page }) => {
    expect(errors.get(page)).toEqual([])
    expect(await page.evaluate(() => window.richErrors)).toEqual([])
    expect(await page.evaluate(() => window.richLeaks)).toEqual([])
})
test('programmatic focus moves an external text selection into the rich-text surface', async ({ page }) => {
    await mount(page, { variant: 'box' })
    await page.getByRole('heading').first().dblclick()
    const editor = page.locator('cb-rich-text-editor')
    await editor.evaluate(node => { (node as RichTextEditor).focus() })
    const text = page.getByRole('textbox', { name: 'Content', exact: true })
    await text.press('ControlOrMeta+a')
    await text.press('Backspace')
    await expect(editor).toHaveJSProperty('value', '')
})

test('formatting toolbar escapes clipped ancestors, stays in the viewport and preserves the text selection', async ({ page }) => {
    await mount(page, { variant: 'box' })
    const editor = page.locator('cb-rich-text-editor'), text = page.getByRole('textbox', { name: 'Content', exact: true })
    await editor.evaluate(node => {
        const clip = node.parentElement!
        clip.style.cssText = 'height:80px;overflow:hidden;position:fixed;top:0;right:0;width:220px;margin:0;padding:0'
    })
    await text.focus()
    const toolbar = editor.locator('cb-rich-text-toolbar[part~=toolbar]')
    await expect(toolbar).toBeVisible()
    await expect(toolbar).toHaveJSProperty('popover', 'manual')
    await text.press('ControlOrMeta+a')
    await editor.getByRole('button', { name: 'Bold', exact: true }).click()
    await expect(editor).toHaveJSProperty('value', '<strong>Hello world</strong>')
    const bounds = (await toolbar.boundingBox())!
    expect(bounds.y).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    await page.getByRole('heading').first().click()
    await expect(toolbar).toBeHidden()
})

async function mount(page: Page, props: RichTextEditorProps = {}): Promise<void> {
    await page.evaluate(props => {
        const form = document.createElement('form'), fieldset = document.createElement('fieldset')
        form.addEventListener('submit', event => event.preventDefault())
        fieldset.style.minInlineSize = '0'
        const editor = document.createElement('cb-rich-text-editor') as RichTextEditor
        Object.assign(editor, { name: 'copy', accessibleLabel: 'Content', toolbarLabel: 'Formatting', boldLabel: 'Bold', italicLabel: 'Italic', underlineLabel: 'Underline',
            strikethroughLabel: 'Strikethrough', superscriptLabel: 'Superscript', subscriptLabel: 'Subscript', value: 'Hello world', ...props })
        editor.addEventListener('beforechange', event => { if (event.composedPath()[0] === editor) window.richBefore++ })
        editor.addEventListener('change', event => {
            const { value, previousValue } = (event as CustomEvent<Change>).detail
            window.richChanges.push({ value, previousValue })
        })
        editor.addEventListener('action', () => window.richLeaks.push('action'))
        editor.addEventListener('input', () => window.richLeaks.push('input'))
        fieldset.append(editor); form.append(fieldset); document.querySelector('#fixture')!.append(form)
    }, props)
    await expect(page.getByRole('textbox', { name: 'Content', exact: true })).toBeVisible()
}
const textbox = (page: Page) => page.getByRole('textbox', { name: 'Content', exact: true })
const host = (page: Page) => page.locator('cb-rich-text-editor')
async function select(page: Page, start: number, end = start): Promise<void> {
    await textbox(page).evaluate((editor, { start, end }) => {
        editor.focus()
        const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT)
        const point = (position: number): { node: Node; offset: number } => {
            walker.currentNode = editor
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                const length = node.textContent?.length ?? 0
                if (position <= length) return { node, offset: position }
                position -= length
            }
            return { node: editor, offset: editor.childNodes.length }
        }
        const from = point(start), to = point(end), range = document.createRange()
        range.setStart(from.node, from.offset); range.setEnd(to.node, to.offset)
        const selection = document.getSelection(); selection?.removeAllRanges(); selection?.addRange(range)
        editor.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    }, { start, end })
}

for (const [label, tag] of [['Bold', 'strong'], ['Italic', 'em'], ['Underline', 'u'], ['Strikethrough', 's'], ['Superscript', 'sup'], ['Subscript', 'sub']]) {
    test(`${label} formats only the selected text and emits one complete value change`, async ({ page }) => {
        await mount(page); await select(page, 0, 5)
        const button = page.getByRole('button', { name: label, exact: true })
        await button.click()
        await expect(host(page)).toHaveJSProperty('value', `<${tag}>Hello</${tag}> world`)
        await expect(button).toHaveAttribute('aria-pressed', 'true')
        expect(await page.evaluate(() => window.richChanges)).toEqual([{ value: `<${tag}>Hello</${tag}> world`, previousValue: 'Hello world' }])
        expect(await page.evaluate(() => window.richBefore)).toBe(1)
        await button.click(); await expect(host(page)).toHaveJSProperty('value', 'Hello world')
    })
}

test('caret toggles apply to subsequent typing; keyboard shortcuts and undo/redo preserve HTML', async ({ page }) => {
    await mount(page, { value: '' })
    await textbox(page).focus(); await textbox(page).press('ControlOrMeta+B')
    expect(await page.evaluate(() => window.richChanges)).toEqual([])
    await textbox(page).pressSequentially('Hi')
    await expect(host(page)).toHaveJSProperty('value', '<strong>Hi</strong>')
    await textbox(page).press('ControlOrMeta+I'); await textbox(page).pressSequentially('!')
    await expect(host(page)).toHaveJSProperty('value', '<strong>Hi</strong><strong><em>!</em></strong>')
    await textbox(page).press('ControlOrMeta+Z')
    await expect(host(page)).toHaveJSProperty('value', '<strong>Hi</strong>')
    await textbox(page).press('ControlOrMeta+Shift+Z')
    await expect(host(page)).toHaveJSProperty('value', '<strong>Hi</strong><strong><em>!</em></strong>')
})

test('nested formatting, mutually exclusive sup/sub, vetoes, and silent programmatic updates', async ({ page }) => {
    await mount(page); await select(page, 0, 5)
    await page.getByRole('button', { name: 'Bold', exact: true }).click()
    await page.getByRole('button', { name: 'Superscript', exact: true }).press('Enter')
    await page.getByRole('button', { name: 'Subscript', exact: true }).click()
    await expect(host(page)).toHaveJSProperty('value', '<strong><sub>Hello</sub></strong> world')
    await expect(page.getByRole('button', { name: 'Superscript', exact: true })).toHaveAttribute('aria-pressed', 'false')
    await host(page).evaluate(node => node.addEventListener('beforechange', event => event.preventDefault(), { once: true }))
    await page.getByRole('button', { name: 'Italic', exact: true }).click()
    await expect(host(page)).toHaveJSProperty('value', '<strong><sub>Hello</sub></strong> world')
    const count = await page.evaluate(() => window.richChanges.length)
    await host(page).evaluate(node => { (node as RichTextEditor).value = '<b>New</b> <i>value</i>' })
    await expect(host(page)).toHaveJSProperty('value', '<strong>New</strong> <em>value</em>')
    await expect(textbox(page)).toHaveText('New value')
    expect(await page.evaluate(() => window.richChanges.length)).toBe(count)
})

test('inline and box layouts handle Enter, pasted line breaks, caret insertion, and deletion', async ({ page }) => {
    await mount(page, { value: 'A' }); await select(page, 1)
    await textbox(page).press('Enter'); await expect(host(page)).toHaveJSProperty('value', 'A')
    await expect(textbox(page)).toHaveAttribute('aria-multiline', 'false')
    await host(page).evaluate(node => { (node as RichTextEditor).variant = 'box' })
    await textbox(page).press('Enter'); await textbox(page).pressSequentially('B')
    await expect(host(page)).toHaveJSProperty('value', 'A<br>B')
    await expect(textbox(page)).toHaveAttribute('aria-multiline', 'true')
    await textbox(page).press('Backspace'); await expect(host(page)).toHaveJSProperty('value', 'A<br>')
    await host(page).evaluate(node => { (node as RichTextEditor).variant = 'inline' })
    await expect(host(page)).toHaveJSProperty('value', 'A ')
})

test('HTML and paste are inert, allowlisted, canonical, and safe to consume again', async ({ page }) => {
    await mount(page, { value: '<strong onclick="window.richExecuted=true">Safe</strong><img src=x onerror="window.richExecuted=true"><script>window.richExecuted=true</script><a href="javascript:alert(1)"> text</a><svg onload="window.richExecuted=true">bad</svg>' })
    await expect(host(page)).toHaveJSProperty('value', '<strong>Safe</strong> text')
    expect(await page.evaluate(() => window.richExecuted)).toBeUndefined()
    await select(page, 0, 9)
    await textbox(page).evaluate(editor => {
        const clipboardData = new DataTransfer()
        clipboardData.setData('text/html', '<div><b>A</b></div><div><u>B</u><iframe srcdoc="bad"></iframe></div>')
        editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true, composed: true }))
    })
    await expect(host(page)).toHaveJSProperty('value', '<strong>A</strong> <u>B</u>')
    const value = await host(page).evaluate(node => (node as RichTextEditor).value)
    await host(page).evaluate((node, value) => (node as RichTextEditor).value = value, value)
    await expect(host(page)).toHaveJSProperty('value', value)
    expect(await textbox(page).locator('img,script,svg,iframe,[onclick],[style]').count()).toBe(0)
    await select(page, 0, 3)
    await textbox(page).evaluate(editor => {
        const clipboardData = new DataTransfer(); clipboardData.setData('text/html', '<img src=x onerror="window.richExecuted=true">')
        editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }))
    })
    await expect(host(page)).toHaveJSProperty('value', value)
})

test('HTML form submission, reset, restoration, required validation, read-only and disabled fieldsets', async ({ page }) => {
    await mount(page, { value: '<b>Initial</b>', required: true })
    expect(await page.locator('form').evaluate(form => new FormData(form as HTMLFormElement).get('copy'))).toBe('<strong>Initial</strong>')
    await select(page, 0, 7); await textbox(page).press('Backspace')
    expect(await host(page).evaluate(node => (node as RichTextEditor).checkValidity())).toBe(false)
    await host(page).evaluate(node => (node as RichTextEditor).reportValidity())
    await expect(textbox(page)).toBeFocused()
    await page.locator('form').evaluate(form => (form as HTMLFormElement).reset())
    await expect(host(page)).toHaveJSProperty('value', '<strong>Initial</strong>')
    await host(page).evaluate(node => (node as RichTextEditor).formStateRestoreCallback('<u>Restored</u>', 'restore'))
    await expect(host(page)).toHaveJSProperty('value', '<u>Restored</u>')
    const count = await page.evaluate(() => window.richChanges.length)
    await page.locator('fieldset').evaluate(node => (node as HTMLFieldSetElement).disabled = true)
    await expect(textbox(page)).toHaveAttribute('contenteditable', 'false')
    await expect(page.getByRole('button', { name: 'Bold', exact: true, includeHidden: true })).toBeDisabled()
    expect(await page.locator('form').evaluate(form => new FormData(form as HTMLFormElement).has('copy'))).toBe(false)
    await page.locator('fieldset').evaluate(node => (node as HTMLFieldSetElement).disabled = false)
    await host(page).evaluate(node => { (node as RichTextEditor).readOnly = true })
    await expect(textbox(page)).toHaveAttribute('contenteditable', 'false')
    expect(await page.locator('form').evaluate(form => new FormData(form as HTMLFormElement).get('copy'))).toBe('<u>Restored</u>')
    expect(await page.evaluate(() => window.richChanges.length)).toBe(count)
})

test('composition input is committed without replacing the in-progress editing DOM', async ({ page }) => {
    await mount(page, { value: '' })
    await textbox(page).focus(); await textbox(page).press('ControlOrMeta+B')
    await textbox(page).evaluate(editor => {
        editor.focus()
        editor.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
        editor.textContent = '日本'
        const text = editor.firstChild!, range = document.createRange()
        range.setStart(text, 2); range.collapse(true)
        const selection = document.getSelection(); selection?.removeAllRanges(); selection?.addRange(range)
        editor.dispatchEvent(new InputEvent('input', { inputType: 'insertCompositionText', data: '日本', isComposing: true, bubbles: true, composed: true }))
        if (editor.firstChild !== text) throw new Error('Composition DOM was replaced')
        editor.dispatchEvent(new CompositionEvent('compositionend', { data: '日本', bubbles: true }))
    })
    await expect(host(page)).toHaveJSProperty('value', '<strong>日本</strong>')
    expect(await page.evaluate(() => window.richChanges)).toEqual([{ value: '<strong>日本</strong>', previousValue: '' }])
})

test('literal value attributes stay strings, and typing vetoes restore both text and selection', async ({ page }) => {
    await mount(page)
    for (const literal of ['null', 'true', '123', '{"label":"Text"}']) {
        await host(page).evaluate((node, value) => node.setAttribute('value', value), literal)
        await expect(host(page)).toHaveJSProperty('value', literal)
        await expect(textbox(page)).toHaveText(literal)
    }
    await host(page).evaluate(node => { (node as RichTextEditor).value = 'abc' })
    await select(page, 1)
    await host(page).evaluate(node => node.addEventListener('beforechange', event => event.preventDefault(), { once: true }))
    await textbox(page).pressSequentially('x')
    await expect(host(page)).toHaveJSProperty('value', 'abc')
    await textbox(page).pressSequentially('y')
    await expect(host(page)).toHaveJSProperty('value', 'aybc')
    await host(page).evaluate(node => {
        const fresh = document.createElement('cb-rich-text-editor') as RichTextEditor
        Object.assign(fresh, { accessibleLabel: 'Content', toolbarLabel: 'Formatting', boldLabel: 'Bold', italicLabel: 'Italic', underlineLabel: 'Underline',
            strikethroughLabel: 'Strikethrough', superscriptLabel: 'Superscript', subscriptLabel: 'Subscript' })
        fresh.setAttribute('value', 'null'); node.replaceWith(fresh)
    })
    await expect(host(page)).toHaveJSProperty('value', 'null')
    await expect(textbox(page)).toHaveText('null')
})

test('box minimum height fits three rows at the current text size', async ({ page }) => {
    await mount(page, { variant: 'box', value: '' })
    for (const fontSize of ['12px', '20px']) {
        await host(page).evaluate((node, size) => { (node as HTMLElement).style.setProperty('--component-font-size', size) }, fontSize)
        const dimensions = await textbox(page).evaluate(node => {
            const style = getComputedStyle(node)
            return {
                height: node.getBoundingClientRect().height,
                minimum: Number.parseFloat(style.lineHeight) * 3 + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom),
            }
        })
        expect(dimensions.height).toBeCloseTo(dimensions.minimum, 1)
    }
})

for (const variant of ['inline', 'box'] as const) test(`${variant} toolbar appears only while focus remains in the editor`, async ({ page }) => {
    await mount(page, { variant })
    const toolbar = host(page).locator('cb-toolbar[part~=toolbar]')
    await expect(toolbar).toBeHidden()
    const fieldBounds = await textbox(page).boundingBox()
    const editorBounds = await host(page).boundingBox()
    await textbox(page).focus()
    await expect(toolbar).toBeVisible()
    expect(await textbox(page).boundingBox()).toEqual(fieldBounds)
    expect(await host(page).boundingBox()).toEqual(editorBounds)
    const toolbarBounds = (await toolbar.boundingBox())!
    expect(toolbarBounds.y + toolbarBounds.height).toBeLessThanOrEqual(fieldBounds!.y)
    await textbox(page).press('Shift+Tab')
    await expect(page.getByRole('button', { name: 'Subscript', exact: true })).toBeFocused()
    await expect(toolbar).toBeVisible()
    await select(page, 0, 5)
    await page.getByRole('button', { name: 'Bold', exact: true }).click()
    await expect(host(page)).toHaveJSProperty('value', '<strong>Hello</strong> world')
    await expect(toolbar).toBeVisible()
    const formattedBounds = await textbox(page).boundingBox()
    await page.locator('form').evaluate(form => {
        const next = document.createElement('button')
        next.type = 'button'; next.textContent = 'Next control'; form.append(next); next.focus()
    })
    await expect(toolbar).toBeHidden()
    expect(await textbox(page).boundingBox()).toEqual(formattedBounds)
})

for (const variant of ['inline', 'box'] as const) test(`${variant} editor sizes to content and stays left-aligned`, async ({ page }) => {
    await mount(page, { value: 'Hi', variant })
    await page.locator('fieldset').evaluate(node => {
        Object.assign(node.style, { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', justifyItems: 'stretch', textAlign: 'center', padding: '0', border: '0', width: '500px' })
    })
    const compact = (await host(page).boundingBox())!
    expect(compact.width).toBeLessThan(240)
    expect(compact.x).toBe((await page.locator('fieldset').boundingBox())!.x)
    await expect(textbox(page)).toHaveCSS('text-align', 'left')
    await host(page).evaluate(node => { (node as RichTextEditor).value = 'A longer line of rich text that should expand this editor naturally.' })
    await expect.poll(async () => (await host(page).boundingBox())!.width).toBeGreaterThan(compact.width)
    expect((await host(page).boundingBox())!.width).toBeLessThanOrEqual(500)
    await host(page).evaluate(node => { (node as RichTextEditor).value = 'Hi' })
    await expect.poll(async () => (await host(page).boundingBox())!.width).toBe(compact.width)
    await page.locator('fieldset').evaluate(node => { node.style.width = '140px' })
    expect((await host(page).boundingBox())!.width).toBeLessThanOrEqual(140)
})

for (const appearance of ['light', 'dark']) test(`rich text is accessible and fits narrow containers in ${appearance}`, async ({ page }) => {
    await mount(page)
    await page.locator('cb-theme-provider').evaluate((node, appearance) => node.setAttribute('appearance', appearance), appearance)
    await page.locator('form').evaluate(node => { node.style.width = '220px' })
    expect((await host(page).boundingBox())!.width).toBeLessThanOrEqual(220)
    expect((await new AxeBuilder({ page }).include('cb-rich-text-editor').analyze()).violations).toEqual([])
})
