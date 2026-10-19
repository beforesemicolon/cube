import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-text-input')))
})

test('every Studio design entry registers and mounts without missing-property failures', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))
    const result = await page.evaluate(async () => {
        const { studioDefinitions } = await import('/components/studio/catalog.ts')
        const fixture = document.querySelector<HTMLElement>('#fixture')!
        const componentErrors: string[] = []
        fixture.addEventListener('error', event => componentErrors.push((event as CustomEvent<{ code?: string }>).detail.code ?? 'error'))
        for (const definition of studioDefinitions) {
            const element = document.createElement(`cb-${definition.name}`) as HTMLElement & {
                label: string
                accessibleLabel: string
                value: string | number
                progress: number
                items: ReadonlyArray<{ id: string; label: string }>
            }
            element.label = definition.title
            element.accessibleLabel = definition.title
            element.value = definition.kind === 'number' || definition.kind === 'range' ? 40 : 'one'
            element.progress = 40
            element.items = [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }]
            fixture.append(element)
        }
        return {
            definitions: studioDefinitions.length,
            registered: studioDefinitions.filter(definition => Boolean(customElements.get(`cb-${definition.name}`))).length,
            mounted: fixture.querySelectorAll(':scope > :not(script)').length,
            componentErrors,
        }
    })
    expect(result.definitions).toBe(53)
    expect(result.registered).toBe(53)
    expect(result.mounted).toBe(53)
    expect(result.componentErrors).toEqual([])
    expect(pageErrors).toEqual([])
})

test('representative Studio controls expose keyboard semantics, parts, theme inheritance and no axe violations', async ({ page }) => {
    await page.evaluate(() => {
        const fixture = document.querySelector<HTMLElement>('#fixture')!
        const text = document.createElement('cb-text-input') as HTMLElement & { label: string; value: string }
        text.label = 'Layer name'; text.value = 'Hero'
        const collection = document.createElement('cb-tree') as HTMLElement & { label: string; items: ReadonlyArray<{ id: string; label: string }> }
        collection.label = 'Layers'; collection.items = [{id:'hero',label:'Hero'},{id:'copy',label:'Copy'}]
        const canvas = document.createElement('cb-artboard') as HTMLElement & { label: string; accessibleLabel: string }
        canvas.label = 'Artboard'; canvas.accessibleLabel = 'Homepage artboard'
        fixture.append(text, collection, canvas)
    })
    const input = page.locator('cb-text-input').locator('[part~="control"]')
    await expect(input).toHaveAttribute('aria-label', 'Layer name')
    await input.fill('Navigation')
    await input.press('Tab')
    await expect(page.locator('cb-text-input')).toHaveJSProperty('value', 'Navigation')

    const treeItems = page.locator('cb-tree').getByRole('treeitem')
    await treeItems.first().focus()
    await page.keyboard.press('ArrowDown')
    await expect(treeItems.nth(1)).toBeFocused()

    const artboard = page.locator('cb-artboard').getByRole('region', { name:'Homepage artboard' })
    await artboard.focus()
    await expect(artboard).toBeFocused()
    await expect(page.locator('cb-artboard').locator('[part~="canvas-marker"]')).toBeVisible()

    const accessibility = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(accessibility.violations).toEqual([])

    await page.locator('#theme').evaluate((element: HTMLElement & { appearance: string }) => { element.appearance = 'dark' })
    await expect(page.locator('cb-artboard').locator('[part~="canvas"]')).toHaveCSS('background-color', 'rgb(29, 33, 36)')
})

test('generated data displays only render containers that belong to the component', async ({ page }) => {
    await page.evaluate(() => {
        const list = document.createElement('cb-list') as HTMLElement & {
            label: string
            items: ReadonlyArray<{ id: string; label: string }>
        }
        list.label = 'Project pages'
        list.items = [{ id: 'home', label: 'Home' }, { id: 'pricing', label: 'Pricing' }]
        const badge = document.createElement('cb-badge') as HTMLElement & { label: string; value: string }
        badge.label = 'Status'
        badge.value = 'Ready'
        const description = document.createElement('cb-description-row') as HTMLElement & { label: string; value: string }
        description.label = 'Owner'
        description.value = 'Maya Chen'
        const tree = document.createElement('cb-tree') as HTMLElement & {
            label: string
            items: ReadonlyArray<{ id: string; label: string }>
        }
        tree.label = 'Project pages'
        tree.items = [{ id: 'home', label: 'Home' }, { id: 'pricing', label: 'Pricing' }]
        const card = document.createElement('cb-card') as HTMLElement & { label: string }
        card.label = 'Project summary'
        document.querySelector('#fixture')?.append(list, badge, description, tree, card)
    })

    const list = page.locator('cb-list')
    const root = list.locator('[part~="root"]')
    await expect(root).toHaveAttribute('part', 'root')
    await expect(list.locator('[part~="list"]')).toHaveCount(1)
    await expect(root).toHaveCSS('border-top-width', '0px')
    await expect(list.locator('[part~="list"]')).toHaveCSS('border-top-width', '1px')

    const badge = page.locator('cb-badge').locator('[part~="display"]')
    const description = page.locator('cb-description-row').locator('[part~="display"]')
    const tree = page.locator('cb-tree').locator('[part~="list"]')
    await expect(page.locator('cb-badge').locator('[part~="panel"]')).toHaveCount(0)
    await expect(page.locator('cb-description-row').locator('[part~="panel"]')).toHaveCount(0)
    await expect(badge).toHaveCSS('border-top-width', '0px')
    await expect(badge).toHaveCSS('padding-top', '0px')
    await expect(description).toHaveCSS('border-top-width', '0px')
    await expect(description).toHaveCSS('padding-top', '0px')
    await expect(tree).toHaveCSS('border-top-width', '0px')
    await expect(tree).toHaveCSS('padding-top', '0px')
    await expect(tree).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(page.locator('cb-card').locator('[part~="panel"]')).toHaveCount(1)
})

test('text input and textarea keep a usable minimum width without overflowing narrow containers', async ({ page }) => {
    await page.evaluate(() => {
        const input = document.createElement('cb-text-input') as HTMLElement & { value: string }
        input.value = 'Short'
        const textarea = document.createElement('cb-textarea') as HTMLElement & { value: string }
        textarea.value = 'Short'
        const narrow = document.createElement('div')
        narrow.style.inlineSize = '180px'
        const responsiveInput = document.createElement('cb-text-input') as HTMLElement & { value: string }
        responsiveInput.value = 'Short'
        narrow.append(responsiveInput)
        document.querySelector('#fixture')?.append(input, textarea, narrow)
    })

    const inputWidth = await page.locator('cb-text-input').first().evaluate(element => element.getBoundingClientRect().width)
    const textareaWidth = await page.locator('cb-textarea').evaluate(element => element.getBoundingClientRect().width)
    const responsiveWidth = await page.locator('div[style] cb-text-input').evaluate(element => element.getBoundingClientRect().width)
    expect(inputWidth).toBeGreaterThanOrEqual(240)
    expect(textareaWidth).toBeGreaterThanOrEqual(240)
    expect(responsiveWidth).toBeLessThanOrEqual(180)
})

test('range slider keeps its width and reaches both visual endpoints', async ({ page }) => {
    await page.evaluate(() => {
        const slider = document.createElement('cb-range-slider') as HTMLElement & {
            accessibleLabel: string
            value: number
            min: number
            max: number
            step: number
        }
        Object.assign(slider, { accessibleLabel: 'Opacity', value: 50, min: 0, max: 100, step: 1 })
        document.querySelector('#fixture')?.append(slider)
    })

    const host = page.locator('cb-range-slider')
    const slider = host.getByRole('slider', { name: 'Opacity' })
    const box = await slider.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return
    expect(box.width).toBeGreaterThanOrEqual(240)
    await slider.click({ position: { x: 1, y: box.height / 2 } })
    await expect(slider).toHaveValue('0')
    await expect(host).toHaveJSProperty('value', 0)
    await slider.click({ position: { x: box.width - 1, y: box.height / 2 } })
    await expect(slider).toHaveValue('100')
    await expect(host).toHaveJSProperty('value', 100)
    const styles = await slider.evaluate(element => {
        const style = getComputedStyle(element)
        return { paddingInline: style.paddingInline, borderInlineWidth: style.borderInlineWidth }
    })
    expect(styles).toEqual({ paddingInline: '0px', borderInlineWidth: '0px' })
})

test('token input keeps a usable width without overflowing narrow containers', async ({ page }) => {
    await page.evaluate(() => {
        type TokenInputElement = HTMLElement & {
            accessibleLabel: string
            items: ReadonlyArray<{ id: string; label: string; disabled?: boolean }>
        }
        const items = [
            { id: 'one', label: 'Primary item' },
            { id: 'two', label: 'Secondary item' },
            { id: 'three', label: 'Disabled item', disabled: true },
        ]
        const input = document.createElement('cb-token-input') as TokenInputElement
        input.accessibleLabel = 'Selected items'
        input.items = items
        const narrow = document.createElement('div')
        narrow.style.inlineSize = '180px'
        const responsiveInput = document.createElement('cb-token-input') as TokenInputElement
        responsiveInput.accessibleLabel = 'Responsive selected items'
        responsiveInput.items = items
        narrow.append(responsiveInput)
        document.querySelector('#fixture')?.append(input, narrow)
    })

    const inputs = page.locator('cb-token-input')
    const inputWidth = await inputs.first().evaluate(element => element.getBoundingClientRect().width)
    const responsiveWidth = await inputs.nth(1).evaluate(element => element.getBoundingClientRect().width)
    expect(inputWidth).toBeGreaterThanOrEqual(240)
    expect(responsiveWidth).toBeLessThanOrEqual(180)
    await expect(inputs.first().getByRole('button', { name: 'Primary item' })).toBeVisible()
    await expect(inputs.first().getByRole('button', { name: 'Secondary item' })).toBeVisible()
})

test('Studio fields expose invalid and read-only states without throwing or accepting changes', async ({ page }) => {
    await page.evaluate(() => {
        const control = document.createElement('cb-text-input') as HTMLElement & {
            value: string
            readOnly: boolean
        }
        control.value = 'Homepage'
        control.readOnly = true
        const field = document.createElement('cb-field') as HTMLElement & { label: string; invalid: boolean; errorText: string }
        field.label = 'Page title'
        field.invalid = true
        field.errorText = 'Enter a valid page title.'
        field.append(control)
        document.querySelector('#fixture')!.append(field)
    })
    const field = page.locator('cb-field')
    const control = field.locator('cb-text-input')
    const input = control.locator('[part~="control"]')
    await expect(field).toHaveAttribute('data-invalid')
    await expect(control).toHaveAttribute('data-field-invalid')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAttribute('aria-readonly', 'true')
    await expect(field.getByRole('alert')).toHaveText('Enter a valid page title.')
    await input.evaluate((node: HTMLInputElement) => {
        node.value = 'Changed title'
        node.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await expect(control).toHaveJSProperty('value', 'Homepage')
})

test('code preview uses Highlight.js without interpreting source markup', async ({ page }) => {
    await page.evaluate(() => {
        const preview = document.createElement('cb-code-preview') as HTMLElement & { label:string; code:string; codeLanguage:string; copyLabel:string }
        preview.label = 'HTML example'
        preview.code = '<cb-button label="Save"></cb-button>'
        preview.codeLanguage = 'html'
        preview.copyLabel = 'Copy'
        document.querySelector('#fixture')!.append(preview)
    })
    const preview = page.locator('cb-code-preview')
    await expect(preview.locator('[part~="language"]')).toHaveText('html')
    await expect(preview.locator('[part~="code"]')).toContainText('<cb-button label="Save"></cb-button>')
    await expect(preview.locator('[part~="code"] .hljs-tag')).toHaveCount(2)
    await expect(preview.locator('[part~="code"] cb-button')).toHaveCount(0)
    await expect(preview.getByRole('button', { name:'Copy' })).toBeEnabled()
})
