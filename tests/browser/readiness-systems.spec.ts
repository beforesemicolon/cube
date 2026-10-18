import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-workspace')))
}

test('editable label, masked input, editable list, and linked values expose distinct behavior', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const form = document.createElement('form')
        const editable = document.createElement('cb-editable-label') as HTMLElement & Record<string, string | boolean>
        Object.assign(editable, { label: 'Layer name', accessibleLabel: 'Layer name', name: 'layer', value: 'Hero section', editLabel: 'Edit {value}', saveLabel: 'Save layer name', cancelLabel: 'Cancel editing', selectOnEdit: true, submitOnBlur: true })
        const masked = document.createElement('cb-masked-input') as HTMLElement & Record<string, string | boolean>
        Object.assign(masked, { name: 'phone', value: '6175550142', mask: '(999) 999-9999', maskPlaceholder: '•', guide: true, unmask: true, inputMode: 'tel' })
        const list = document.createElement('cb-editable-list') as HTMLElement & { items: readonly object[] } & Record<string, string | number | boolean>
        Object.assign(list, { items: [{ id: 'home', label: '/home', value: '/home' }], minItems: 1, maxItems: 3, addLabel: 'Add path', editLabel: 'Edit {item}', saveLabel: 'Save path', cancelLabel: 'Cancel', removeLabel: 'Remove {item}', moveUpLabel: 'Move {item} up', moveDownLabel: 'Move {item} down', inputLabel: 'New redirect path', emptyLabel: 'No paths' })
        const linked = document.createElement('cb-linked-values') as HTMLElement & { firstValue: number; secondValue: number; linked: boolean; setFirst(value: number): boolean }
        Object.assign(linked, { firstValue: 320, secondValue: 180, firstLabel: 'Width', secondLabel: 'Height', linked: true, linkLabel: 'Link dimensions', unlinkLabel: 'Unlink dimensions' })
        const field = (control: HTMLElement, label: string, description: string): HTMLElement => {
            const wrapper = document.createElement('cb-field') as HTMLElement & { label: string; description: string }
            Object.assign(wrapper, { label, description })
            wrapper.append(control)
            return wrapper
        }
        form.append(
            editable,
            field(masked, 'Phone number', 'Enter ten digits; punctuation is added while typing.'),
            field(list, 'Redirect paths', 'Add one or more redirect paths.'),
            field(linked, 'Dimensions', 'Set the width and height.'),
        )
        document.querySelector('#fixture')?.append(form)
    })

    const editable = page.locator('cb-editable-label')
    await editable.getByRole('button', { name: 'Edit Hero section' }).click()
    const editableInput = editable.getByRole('textbox', { name: 'Layer name' })
    await expect(editableInput).toBeFocused()
    await editableInput.fill('Hero banner')
    await editableInput.press('Enter')
    await expect(editable).toHaveJSProperty('value', 'Hero banner')
    await expect(editable.getByRole('button', { name: 'Edit Hero banner' })).toBeVisible()

    const phone = page.locator('cb-masked-input').getByRole('textbox', { name: 'Phone number' })
    await expect(phone).toHaveValue('(617) 555-0142')
    await phone.fill('2125550188')
    await expect(phone).toHaveValue('(212) 555-0188')
    await expect(page.locator('cb-masked-input')).toHaveJSProperty('rawValue', '2125550188')
    await expect(page.locator('cb-masked-input cb-field')).toHaveCount(0)
    await expect(page.locator('cb-editable-list cb-field')).toHaveCount(0)
    await phone.blur()
    const formValues = await page.locator('form').evaluate(form => Object.fromEntries(new FormData(form).entries()))
    expect(formValues).toMatchObject({ layer: 'Hero banner', phone: '2125550188' })

    const list = page.locator('cb-editable-list')
    await list.getByRole('textbox', { name: 'New redirect path' }).fill('/pricing')
    await list.getByRole('button', { name: 'Add path' }).click()
    expect(await list.evaluate((node: HTMLElement & { items: Array<{ label: string; value: string }> }) => node.items)).toMatchObject([{ label: '/home', value: '/home' }, { label: '/pricing', value: '/pricing' }])
    await list.getByRole('button', { name: 'Move /pricing up' }).click()
    expect(await list.evaluate((node: HTMLElement & { items: Array<{ label: string }> }) => node.items.map(item => item.label))).toEqual(['/pricing', '/home'])
    await list.getByRole('textbox', { name: 'New redirect path' }).fill('/blog')
    await list.getByRole('textbox', { name: 'New redirect path' }).press('Enter')
    expect(await list.evaluate((node: HTMLElement & { items: Array<{ label: string }> }) => node.items.map(item => item.label))).toEqual(['/pricing', '/home', '/blog'])
    await list.getByRole('button', { name: 'Edit /home' }).click()
    const editedPath = list.locator('cb-text-input[part~="edit-input"]').getByRole('textbox', { name: 'New redirect path' })
    await editedPath.fill('/company')
    await editedPath.press('Enter')
    expect(await list.evaluate((node: HTMLElement & { items: Array<{ label: string }> }) => node.items.map(item => item.label))).toEqual(['/pricing', '/company', '/blog'])

    const linked = page.locator('cb-linked-values')
    await linked.evaluate((node: HTMLElement & { setFirst(value: number): boolean }) => node.setFirst(640))
    await expect(linked).toHaveJSProperty('firstValue', 640)
    await expect(linked).toHaveJSProperty('secondValue', 360)

    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('file browser and layer tree support navigation, view changes, selection, and inline editing', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const browser = document.createElement('cb-file-browser') as HTMLElement & { entries: readonly object[]; selectedIds: readonly string[] }
        Object.assign(browser, {
            label: 'Assets', accessibleLabel: 'Asset browser', selectionMode: 'multiple', selectedIds: [], searchable: true,
            searchLabel: 'Filter assets', searchPlaceholder: 'Search', gridViewLabel: 'Grid view', tableViewLabel: 'Table view',
            breadcrumbLabel: 'Current folder', expandPathLabel: 'Expand path', rootLabel: 'Project', nameLabel: 'Name', typeLabel: 'Type', sizeLabel: 'Size', modifiedLabel: 'Modified',
            emptyLabel: 'Empty folder', noMatchLabel: 'No matches', loadingLabel: 'Loading assets', openEntryLabel: 'Open {entry}', selectEntryLabel: 'Select {entry}', deselectEntryLabel: 'Deselect {entry}',
            sortAscendingLabel: 'Sort {column} ascending', sortDescendingLabel: 'Sort {column} descending',
            entries: [{ id: 'images', name: 'Images', type: 'folder' }, { id: 'logo', name: 'logo.svg', type: 'file', size: 1200 }, { id: 'hero', name: 'hero.webp', type: 'file', parentId: 'images', size: 3200 }],
        })
        const tree = document.createElement('cb-layer-tree') as HTMLElement & { items: readonly object[]; selectedIds: readonly string[]; expandedIds: readonly string[] }
        Object.assign(tree, {
            label: 'Layers', accessibleLabel: 'Page layers', selectedIds: ['heading'], expandedIds: ['page'], editable: true, reorderable: true,
            expandLabel: 'Expand {item}', collapseLabel: 'Collapse {item}', showLabel: 'Show {item}', hideLabel: 'Hide {item}', lockLabel: 'Lock {item}', unlockLabel: 'Unlock {item}', renameLabel: 'Rename {item}', saveLabel: 'Save name', cancelLabel: 'Cancel rename', moveLabel: 'Move {item}',
            items: [{ id: 'page', label: 'Page', children: [{ id: 'heading', label: 'Main heading', icon: 'text' }, { id: 'image', label: 'Hero image', icon: 'image' }] }],
        })
        document.querySelector('#fixture')?.append(browser, tree)
    })

    const browser = page.locator('cb-file-browser')
    await browser.getByRole('textbox', { name: 'Filter assets' }).fill('logo')
    await expect(browser.getByText('Images')).toBeHidden()
    await expect(browser.getByText('logo.svg')).toBeVisible()
    await browser.getByRole('textbox', { name: 'Filter assets' }).fill('')
    await browser.getByRole('option', { name: 'Open Images' }).click()
    await expect(browser).toHaveJSProperty('currentFolderId', 'images')
    await expect(browser.getByText('hero.webp')).toBeVisible()
    await browser.getByRole('button', { name: 'Project' }).click()
    await browser.getByRole('radio', { name: 'Table view' }).click()
    await expect(browser.locator('cb-table')).toBeVisible()
    await browser.getByRole('checkbox', { name: 'Select logo.svg' }).check()
    await expect(browser).toHaveJSProperty('selectedIds', ['logo'])

    const tree = page.locator('cb-layer-tree')
    await tree.getByRole('button', { name: 'Rename Main heading' }).click()
    const rename = tree.getByRole('textbox', { name: 'Rename Main heading' })
    await rename.fill('Hero title')
    await rename.press('Enter')
    await expect(tree.getByRole('treeitem', { name: /Hero title/ })).toBeVisible()
    await tree.getByRole('button', { name: 'Hide Hero title' }).click()
    expect(await tree.evaluate((node: HTMLElement & { items: Array<{ children?: Array<{ label: string; hidden?: boolean }> }> }) => node.items[0]?.children?.[0])).toMatchObject({ label: 'Hero title', hidden: true })
})

test('workspace coordinates panel disclosure, keyboard resizing, and mobile overlays', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const workspace = document.createElement('cb-workspace') as HTMLElement
        Object.assign(workspace, {
            label: 'Editor', accessibleLabel: 'Editor workspace', startOpen: true, endOpen: true, bottomOpen: false,
            startSize: 240, endSize: 300, bottomSize: 180, minStartSize: 180, maxStartSize: 480, resizeStep: 20, mobileBreakpoint: 600,
            startLabel: 'Layers', endLabel: 'Properties', bottomLabel: 'Timeline', openStartLabel: 'Open layers', closeStartLabel: 'Close layers',
            openEndLabel: 'Open properties', closeEndLabel: 'Close properties', openBottomLabel: 'Open timeline', closeBottomLabel: 'Close timeline', closeMobileLabel: 'Close open panel',
        })
        workspace.style.cssText = 'display:grid;inline-size:900px;block-size:540px'
        const start = document.createElement('p'); start.slot = 'start'; start.textContent = 'Layer list'
        const end = document.createElement('p'); end.slot = 'end'; end.textContent = 'Property list'
        const bottom = document.createElement('p'); bottom.slot = 'bottom'; bottom.textContent = 'Animation timeline'
        const main = document.createElement('p'); main.textContent = 'Canvas'
        workspace.append(start, main, end, bottom)
        document.querySelector('#fixture')?.append(workspace)
    })
    const workspace = page.locator('cb-workspace')
    await workspace.getByRole('button', { name: 'Close layers' }).click()
    await expect(workspace).toHaveJSProperty('startOpen', false)
    await workspace.getByRole('button', { name: 'Open layers' }).click()
    const separator = workspace.getByRole('separator', { name: 'Layers' })
    await separator.press('ArrowRight')
    await expect(workspace).toHaveJSProperty('startSize', 260)
    await workspace.evaluate((node: HTMLElement) => { node.style.inlineSize = '480px' })
    await expect(workspace).toHaveAttribute('data-mobile', '')
    await workspace.evaluate((node: HTMLElement & { togglePanel(panel: 'start', open: boolean): boolean }) => node.togglePanel('start', true))
    await expect(workspace.getByText('Layer list')).toBeVisible()
    await workspace.getByRole('button', { name: 'Close open panel' }).click({ position: { x: 470, y: 300 } })
    await expect(workspace).toHaveJSProperty('mobilePanel', '')
})

test('code, JSON, property, and canvas primitives are interactive and render meaningful state', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const code = document.createElement('cb-code-editor') as HTMLElement
        Object.assign(code, { label: 'TypeScript', accessibleLabel: 'TypeScript source', value: 'const answer: number = 42', language: 'typescript', lineNumbers: true, positionLabel: 'Line {line}, column {column}', submitLabel: 'Run code' })
        const json = document.createElement('cb-json-editor') as HTMLElement
        Object.assign(json, { label: 'Configuration', accessibleLabel: 'JSON configuration', value: '{"name":"cube","features":["themes","components"]}', formatLabel: 'Format JSON', validLabel: 'Valid JSON', invalidLabel: 'Invalid JSON: {error}', positionLabel: 'Line {line}, column {column}' })
        const group = document.createElement('cb-property-group') as HTMLElement
        Object.assign(group, { label: 'Layout', expanded: true, dirty: true, resetLabel: 'Reset layout', mixedLabel: 'Mixed', expandLabel: 'Expand layout', collapseLabel: 'Collapse layout' })
        group.append(document.createTextNode('Layout controls'))
        const canvas = document.createElement('div'); canvas.style.cssText = 'position:relative;width:600px;height:360px'
        const selection = document.createElement('cb-selection-overlay') as HTMLElement
        Object.assign(selection, { accessibleLabel: 'Selected card', rect: { x: 40, y: 50, width: 180, height: 100 }, movable: true, resizable: true, rotatable: true, moveLabel: 'Move selected card', rotateLabel: 'Rotate selected card', sizeLabel: '{width} × {height}', handleLabels: { e: 'Resize right' } })
        const guides = document.createElement('cb-guide-overlay') as HTMLElement
        Object.assign(guides, { guides: [{ id: 'center', axis: 'y', position: 300, label: 'center' }], zoom: 1 })
        canvas.append(guides, selection)
        document.querySelector('#fixture')?.append(code, json, group, canvas)
    })
    const code = page.locator('#fixture > cb-code-editor')
    await expect(code.locator('.hljs-keyword')).toContainText('const')
    const codeControl = code.getByRole('textbox', { name: 'TypeScript source' })
    await codeControl.press('End')
    await expect(code.locator('[part~=position]')).toContainText('Line 1')
    const codeSelection = await codeControl.evaluate(control => {
        control.setSelectionRange(0, control.value.length)
        const selectionStyle = getComputedStyle(control, '::selection')
        return {
            start: control.selectionStart,
            end: control.selectionEnd,
            length: control.value.length,
            color: selectionStyle.color,
            fill: selectionStyle.getPropertyValue('-webkit-text-fill-color'),
            background: selectionStyle.backgroundColor,
        }
    })
    expect(codeSelection.start).toBe(0)
    expect(codeSelection.end).toBe(codeSelection.length)
    expect(codeSelection.color).not.toBe('rgba(0, 0, 0, 0)')
    expect(codeSelection.fill).not.toBe('transparent')
    expect(codeSelection.background).not.toBe('rgba(0, 0, 0, 0)')
    await codeControl.fill('{"compact":true}')
    await expect(codeControl).toHaveValue('{"compact":true}')
    await expect(code).toHaveJSProperty('value', '{"compact":true}')
    await expect(codeControl).toBeFocused()
    const json = page.locator('cb-json-editor')
    const jsonControl = json.getByRole('textbox', { name: 'JSON configuration' })
    await jsonControl.fill('{"name":"cube","enabled":true}')
    await expect(jsonControl).toHaveValue('{"name":"cube","enabled":true}')
    await expect(json).toHaveJSProperty('value', '{"name":"cube","enabled":true}')
    await expect(jsonControl).toBeFocused()
    await jsonControl.fill('"cube"')
    await expect(jsonControl).toHaveValue('"cube"')
    await expect(json).toHaveJSProperty('value', '"cube"')
    await jsonControl.fill('{"name":"cube","features":["themes","components"]}')
    await expect(jsonControl).toHaveValue('{"name":"cube","features":["themes","components"]}')
    await json.getByRole('button', { name: 'Format JSON' }).click()
    expect(await jsonControl.inputValue()).toContain('\n')
    await expect(json.getByRole('status')).toHaveText('Valid JSON')
    const formatted = await jsonControl.inputValue()
    await json.evaluate(node => node.addEventListener('cb-before-change', event => event.preventDefault(), { once: true }))
    await jsonControl.fill('{"blocked":true}')
    await expect(jsonControl).toHaveValue(formatted)
    await jsonControl.fill('{"name":}')
    await expect(json.getByRole('status')).toContainText('Invalid JSON:')
    await expect(json.getByRole('status')).not.toContainText('{error}')
    const group = page.locator('cb-property-group')
    await group.getByRole('button', { name: 'Collapse layout' }).click()
    await expect(group).toHaveJSProperty('expanded', false)
    await group.getByRole('button', { name: 'Reset layout' }).click()
    const selection = page.locator('cb-selection-overlay')
    await selection.getByRole('group', { name: 'Move selected card' }).press('ArrowRight')
    expect(await selection.evaluate((node: HTMLElement & { rect: { x: number } }) => node.rect.x)).toBe(41)
    await expect(page.locator('cb-guide-overlay').locator('[part~=line]')).toHaveCount(1)
})

test('global modal and flashbar services support asynchronous application workflows', async ({ page }) => {
    await start(page)
    await page.evaluate(async () => {
        const launcher = document.createElement('button'); launcher.textContent = 'Launch workflow'; document.querySelector('#fixture')?.append(launcher)
        const { showModal } = await import('/components/overlay/modal/service.ts')
        const { createFlashbar, configureFlashbarHost } = await import('/components/feedback/flashbar/service.ts')
        configureFlashbarHost({ parent: document.querySelector('#fixture') as HTMLElement, accessibleLabel: 'Application notifications' })
        launcher.addEventListener('click', async () => {
            const handle = showModal({ heading: 'Publish project', description: 'Confirm the publish action.', cancelLabel: 'Cancel', actions: [{ id: 'publish', label: 'Publish', value: 'published', onAction: async () => Promise.resolve() }] })
            const result = await handle
            if (result.reason === 'action') createFlashbar({ id: 'published', type: 'success', heading: 'Published', message: 'The project is live.', dismissible: true, dismissLabel: 'Dismiss published message' })
        })
    })
    const launcher = page.getByRole('button', { name: 'Launch workflow' })
    await launcher.focus()
    await launcher.click()
    await expect(page.getByRole('dialog', { name: 'Publish project' })).toBeVisible()
    await page.getByRole('button', { name: 'Publish', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Publish project' })).toBeHidden()
    await expect(page.getByRole('status').filter({ hasText: 'Published' })).toBeVisible()
    await expect(launcher).toBeFocused()

    const cancelled = await page.evaluate(async () => {
        const { showModal } = await import('/components/overlay/modal/service.ts')
        const cancelOpen = (event: Event): void => {
            const modal = event.target
            if (modal instanceof HTMLElement && modal.id === 'cancelled-document-modal') event.preventDefault()
        }
        document.addEventListener('cb-before-open', cancelOpen, { once: true })
        const result = await showModal({ id: 'cancelled-document-modal', layer: 'document', heading: 'Never shown' })
        return { reason: result.reason, fixtureInert: (document.querySelector('#fixture') as HTMLElement).inert, modalExists: Boolean(document.getElementById('cancelled-document-modal')) }
    })
    expect(cancelled).toEqual({ reason: 'cancelled', fixtureInert: false, modalExists: false })

    await page.evaluate(async () => {
        const { createFlashbar } = await import('/components/feedback/flashbar/service.ts')
        createFlashbar({
            id: 'linked-action',
            heading: 'Review ready',
            message: 'Open the review.',
            actionLabel: 'Open review',
            actionHref: '#review',
            dismissOnAction: true,
        })
    })
    await page.getByRole('link', { name: 'Open review' }).click()
    await expect(page.locator('cb-flashbar [data-id="linked-action"]')).toHaveCount(0)
})
