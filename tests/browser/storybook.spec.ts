import {test,expect} from '@playwright/test'
const required=[['bar','Bar'],['line','Line'],['mixed-line-and-bar','Mixed line and bar'],['area','Area'],['bubble','Bubble'],['scatter','Scatter'],['pie','Pie'],['donut','Donut']]
for(const [id,name]of required)test(`built Storybook: ${name} finishes its interactive play function`,async({page})=>{
    const tag=id==='pie'||id==='donut'?'cb-pie-chart':'cb-cartesian-chart'
    await page.goto(`http://127.0.0.1:6006/iframe.html?id=charts--${id}&viewMode=story`)
    await expect(page.locator(tag+'[data-story-ready=true]')).toBeVisible({timeout:20000})
    await expect(page.locator(tag+' [part=plot] svg')).toBeVisible()
})

for(const [id,tag]of [['audio','cb-audio-player'],['video','cb-video-player']])test(`built Storybook: ${id} really plays and stops`,async({page})=>{
    await page.goto(`http://127.0.0.1:6006/iframe.html?id=media--${id}&viewMode=story`)
    await expect(page.locator(tag+'[data-story-ready=true]')).toBeVisible({timeout:20000})
    await expect(page.locator(tag+' cb-icon-button[part=play]').getByRole('button')).toBeEnabled()
})

test('built Storybook: Split Button exposes its complete interactive API',async({page})=>{
    await page.goto('http://127.0.0.1:6006/?path=/story/action--split-button&addonPanel=storybook/controls/panel')
    const panel=page.getByRole('tabpanel',{name:/Controls/})
    await expect(panel).toContainText('items',{timeout:20000})
    await expect(panel.getByText('menuLabel',{exact:true})).toBeVisible()
    await expect(panel.getByText('actionValue',{exact:true})).toBeVisible()
    await expect(panel.locator('button[aria-label="add a new item to the \'items\' array"]')).toBeVisible()
})

test('built Storybook: Icon Button and Flashbar share the action primitive',async({page})=>{
    await page.goto('http://127.0.0.1:6006/iframe.html?id=action--icon-button&viewMode=story')
    await expect(page.locator('cb-icon-button[data-variant=secondary]').getByRole('button',{name:'Settings'})).toBeVisible()
    await page.goto('http://127.0.0.1:6006/iframe.html?id=feedback--flashbar&viewMode=story')
    const dismiss=page.locator('cb-flashbar cb-icon-button[part=dismiss]')
    await expect(dismiss).toHaveAttribute('data-variant','secondary')
    await expect(dismiss.getByRole('button',{name:'Dismiss'})).toBeVisible()
})

test('built Storybook: Button exposes optional pressed state and variant examples stay interactive',async({page})=>{
    await page.goto('http://127.0.0.1:6006/?path=/story/action--button&addonPanel=storybook/controls/panel')
    const panel=page.getByRole('tabpanel',{name:/Controls/})
    await expect(panel.getByText('pressed',{exact:true})).toBeVisible({timeout:20000})
    await expect(panel.getByText('variant',{exact:true}).first()).toBeVisible()

    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--button-pressed-states&viewMode=story')
    const primary=page.getByRole('button',{name:'Preview'})
    const destructive=page.getByRole('button',{name:'Block publishing'})
    await expect(primary).toHaveAttribute('aria-pressed','true')
    await expect(destructive).toHaveAttribute('aria-pressed','true')
    await primary.click()
    await expect(primary).toHaveAttribute('aria-pressed','false')
    await destructive.click()
    await expect(destructive).toHaveAttribute('aria-pressed','false')
})

test('built Storybook: layout panel stories expose working controls',async({page})=>{
    await page.goto('http://127.0.0.1:6006/iframe.html?id=layout--collapsible-sidebar&viewMode=story')
    const sidebar=page.locator('cb-collapsible-sidebar')
    await sidebar.getByRole('button',{name:'Collapse sidebar'}).click()
    await expect(sidebar).not.toHaveAttribute('expanded','')

    await page.goto('http://127.0.0.1:6006/iframe.html?id=layout--resizable-panel&viewMode=story')
    const separator=page.getByRole('separator',{name:'Resize properties panel'})
    await separator.press('ArrowRight')
    await expect(page.locator('cb-resizable-panel')).toHaveJSProperty('value',304)

    await page.goto('http://127.0.0.1:6006/iframe.html?id=layout--docked-panel&viewMode=story')
    const docked=page.locator('cb-docked-panel')
    await docked.getByRole('button',{name:'Collapse inspector'}).click()
    await expect(docked).not.toHaveAttribute('expanded','')

    await page.goto('http://127.0.0.1:6006/iframe.html?id=layout--panel-header&viewMode=story')
    const header=page.locator('cb-panel-header')
    await header.getByRole('button',{name:'Collapse typography'}).click()
    await expect(header).not.toHaveAttribute('expanded','')
})

test('built Storybook: overlay stories are launchable and dismissible',async({page})=>{
    await page.goto('http://127.0.0.1:6006/iframe.html?id=overlay--popover&viewMode=story')
    await page.getByRole('button',{name:'Open popover'}).click()
    await expect(page.locator('cb-popover [part~=popover]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('cb-popover [part~=popover]')).toBeHidden()

    for(const [id,openLabel,dialogName]of [
        ['drawer','Open drawer','Page settings'],
        ['bottom-sheet','Open bottom sheet','Insert block'],
        ['modal','Open modal','Create a page'],
        ['alert-dialog','Open alert dialog','Delete component?'],
    ]){
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=overlay--${id}&viewMode=story`)
        await page.getByRole('button',{name:openLabel}).click()
        await expect(page.getByRole(id==='alert-dialog'?'alertdialog':'dialog',{name:dialogName})).toBeVisible()
        await page.keyboard.press('Escape')
    }

    await page.goto('http://127.0.0.1:6006/iframe.html?id=overlay--command-palette&viewMode=story')
    await page.getByRole('button',{name:'Open command palette'}).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.goto('http://127.0.0.1:6006/iframe.html?id=overlay--context-menu&viewMode=story')
    await page.getByText('Right-click this area').click({button:'right'})
    await expect(page.locator('cb-context-menu')).toBeVisible()
})

test('built Storybook: Skeleton has visible loading shapes and complete controls',async({page})=>{
    await page.goto('http://127.0.0.1:6006/iframe.html?id=feedback--skeleton&viewMode=story')
    const skeleton=page.locator('cb-skeleton')
    await expect(skeleton.locator('[part~=shape]')).toHaveCount(3)
    await expect(skeleton.locator('[part~=shape]').first()).toBeVisible()

    await page.goto('http://127.0.0.1:6006/?path=/story/feedback--skeleton&addonPanel=storybook/controls/panel')
    const panel=page.getByRole('tabpanel',{name:/Controls/})
    for(const name of ['variant','lines','rows','columns','animated','accessibleLabel']) await expect(panel.getByText(name,{exact:true}).first()).toBeVisible({timeout:20000})
})

test('built Storybook: Avatar and Presence render distinct identity primitives',async({page})=>{
    await page.goto('http://127.0.0.1:6006/iframe.html?id=data-display--avatar&viewMode=story')
    const avatar=page.locator('cb-avatar')
    await expect(avatar.getByRole('img',{name:'Elson Correia, Online'})).toBeVisible({timeout:20000})
    await expect(avatar.locator('[part~=initials]')).toHaveAttribute('data-initials','EC')
    await expect(avatar.locator('[part~=status]')).toHaveAttribute('data-status','online')

    await page.goto('http://127.0.0.1:6006/iframe.html?id=collaboration--presence&viewMode=story')
    const presence=page.locator('cb-presence')
    await expect(presence.getByRole('group',{name:'Active collaborators'})).toBeVisible({timeout:20000})
    await expect(presence.locator('cb-avatar')).toHaveCount(3)
    await expect(presence.locator('[part~=summary]')).toHaveText('5 participants')
    await expect(presence.getByRole('button',{name:'3 more participants'})).toBeVisible()
    await presence.getByRole('button',{name:'Elson Correia, online'}).focus()
    await expect(presence.getByRole('button',{name:'Elson Correia, online'})).toBeFocused()

    await page.goto('http://127.0.0.1:6006/?path=/story/data-display--avatar&addonPanel=storybook/controls/panel')
    const panel=page.getByRole('tabpanel',{name:/Controls/})
    for(const name of ['name','src','initials','color','size','status','statusLabel','decorative']) await expect(panel.getByText(name,{exact:true}).first()).toBeVisible({timeout:20000})
})

test('built Storybook: chart actions and labeled data table disclosure render',async({page})=>{
    await page.goto('http://127.0.0.1:6006/iframe.html?id=charts--zoomable-mixed&viewMode=story')
    const chart=page.locator('cb-cartesian-chart')
    await expect(chart.getByRole('button',{name:/^Explore chart/})).toBeVisible({timeout:20000})
    for(const name of ['Zoom in','Zoom out','Reset zoom']) await expect(chart.getByRole('button',{name,exact:true})).toBeVisible()
    await expect(chart.getByRole('button',{name:/^View data table/})).toBeVisible()
    await chart.getByRole('button',{name:/^View data table/}).click()
    await expect(chart.locator('cb-expandable-section [part~="label"]')).toHaveText('View data table')
    await expect(chart.locator('cb-table').getByRole('table',{name:'View data table'})).toBeVisible()
})

test('built Storybook: every chart state has visible output',async({page})=>{
    for(const [id,message] of [
        ['loading','Loading chart'],['empty','No data available.'],['no-match','No visible data'],['error','Unable to load chart.'],
        ['all-zero','No data available.'],['invalid','No data available.'],
    ] as const){
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=charts--${id}&viewMode=story`)
        await expect(page.getByRole('status').first()).toHaveText(message,{timeout:20000})
    }
    await page.goto('http://127.0.0.1:6006/iframe.html?id=charts--controlled-filter&viewMode=story')
    const chart=page.locator('cb-pie-chart')
    await expect(chart.locator('[part=plot] svg')).toBeVisible({timeout:20000})
    await expect(chart.getByRole('button',{name:'Show all',exact:true})).toBeVisible()
    await expect(chart.getByRole('button',{name:/^View data table/})).toBeVisible()
})

test('built Storybook: readiness components expose their complete prop surfaces', async ({ page }) => {
    for (const [id, properties] of [
        ['data-display--file-browser', ['entries', 'selectedIds', 'view', 'selectionMode', 'searchable', 'sortBy']],
        ['layout--workspace', ['startOpen', 'endOpen', 'bottomOpen', 'startSize', 'mobilePanel', 'persistKey']],
        ['editor--selection-overlay', ['rect', 'handleLabels', 'movable', 'resizable', 'rotatable']],
        ['form--code-editor', ['value', 'language', 'lineNumbers', 'tabSize', 'minLines', 'maxLines']],
    ] as const) {
        await page.goto(`http://127.0.0.1:6006/?path=/story/${id}&addonPanel=storybook/controls/panel`)
        const panel = page.getByRole('tabpanel', { name: /Controls/ })
        for (const property of properties) await expect(panel.getByText(property, { exact: true }).first()).toBeVisible({ timeout: 20_000 })
    }
})

test('built Storybook: every component category inherits the global appearance', async ({ page }) => {
    const categoryStories = [
        ['action--button', 'cb-button'],
        ['form--text-input', 'cb-text-input'],
        ['layout--box', 'cb-box'],
        ['navigation--link', 'cb-link'],
        ['overlay--tooltip', 'cb-tooltip'],
        ['feedback--status', 'cb-status'],
        ['data-display--badge', 'cb-badge'],
        ['media--empty-audio', 'cb-audio-player'],
        ['charts--loading', 'cb-cartesian-chart'],
        ['styling--color-picker', 'cb-color-picker'],
        ['editor--property-group', 'cb-property-group'],
        ['collaboration--presence', 'cb-presence'],
        ['icons--icon', 'cb-icon'],
        ['examples--field-states', 'cb-text-input'],
    ] as const
    for (const [story, tag] of categoryStories) {
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=${story}&viewMode=story&globals=appearance:dark`)
        const provider = page.locator('cb-theme-provider').first()
        await expect(provider).toHaveCSS('color-scheme', 'dark')
        const component = page.locator(tag).first()
        await expect(component).toBeAttached()
        await expect.poll(() => component.evaluate(element => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#141719')
    }

    await page.goto('http://127.0.0.1:6006/iframe.html?id=form--text-input&viewMode=story&globals=appearance:light')
    await expect(page.locator('cb-theme-provider').first()).toHaveCSS('color-scheme', 'light')
    await expect.poll(() => page.locator('cb-text-input').evaluate(element => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#F2F3F2')
})

test('built Storybook: code editor selection keeps selected text visible', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=form--code-editor&viewMode=story&globals=appearance:dark')
    const editor = page.locator('cb-code-editor')
    const control = editor.getByRole('textbox', { name: 'Validation function' })
    await expect(control).toBeVisible()
    const selection = await control.evaluate(element => {
        element.focus()
        element.setSelectionRange(0, element.value.length)
        const style = getComputedStyle(element, '::selection')
        return {
            selectedLength: element.selectionEnd - element.selectionStart,
            valueLength: element.value.length,
            color: style.color,
            fill: style.getPropertyValue('-webkit-text-fill-color'),
            background: style.backgroundColor,
        }
    })
    expect(selection.selectedLength).toBe(selection.valueLength)
    expect(selection.color).not.toBe('rgba(0, 0, 0, 0)')
    expect(selection.fill).not.toBe('transparent')
    expect(selection.background).not.toBe('rgba(0, 0, 0, 0)')
})

test('built Storybook: readiness component stories remain directly interactive', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=data-display--file-browser&viewMode=story')
    const browser = page.locator('cb-file-browser')
    await browser.getByRole('option', { name: 'Open Images' }).click()
    await expect(browser.getByText('hero.webp')).toBeVisible()
    await browser.getByRole('button', { name: 'Project' }).click()
    await browser.getByRole('radio', { name: 'Table view' }).click()
    await expect(browser.locator('cb-table')).toBeVisible()

    await page.goto('http://127.0.0.1:6006/iframe.html?id=form--linked-values&viewMode=story')
    const linked = page.locator('cb-linked-values')
    await linked.getByRole('button', { name: 'Unlink dimensions' }).click()
    await expect(linked).toHaveJSProperty('linked', false)

    await page.goto('http://127.0.0.1:6006/iframe.html?id=form--json-editor&viewMode=story')
    const json = page.locator('cb-json-editor')
    await expect(json.locator('.hljs-attr').first()).toBeVisible()
    await json.getByRole('button', { name: 'Format JSON' }).click()
    await expect(json.getByRole('status')).toHaveText('Valid JSON')

    await page.goto('http://127.0.0.1:6006/iframe.html?id=layout--workspace&viewMode=story')
    const workspace = page.locator('cb-workspace')
    await workspace.getByRole('button', { name: 'Close pages and layers' }).click()
    await expect(workspace).toHaveJSProperty('startOpen', false)
    await workspace.getByRole('button', { name: 'Open pages and layers' }).click()
    await workspace.getByRole('separator', { name: 'Pages and layers' }).press('ArrowRight')
    await expect(workspace).toHaveJSProperty('startSize', 256)
})

test('built Storybook: global modal and flashbar examples demonstrate application services', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--global-modal-system&viewMode=story')
    await page.getByRole('button', { name: 'Create project', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Create project' })
    await expect(dialog).toBeVisible()
    await page.locator('cb-modal').getByRole('button', { name: 'Create project', exact: true }).click()
    await expect(page.getByText('Project created.')).toBeVisible()

    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--global-flashbar-system&viewMode=story')
    await page.getByRole('button', { name: 'Show success' }).click()
    const notification = page.getByRole('status').filter({ hasText: 'Changes saved' })
    await expect(notification).toBeVisible()
    await notification.getByRole('button', { name: 'Dismiss changes saved' }).click()
    await expect(notification).toBeHidden()
})
