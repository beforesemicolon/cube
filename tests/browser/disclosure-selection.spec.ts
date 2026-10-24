import { test, expect, type Page } from '@playwright/test'
import type { SegmentedControl } from '../../components/navigation/segmented-control/index.js'
import type { Sidebar } from '../../components/layout/sidebar/index.js'
import type { Tabs } from '../../components/navigation/tabs/index.js'
import type { Breadcrumb } from '../../components/navigation/breadcrumb/index.js'
import type { Menu } from '../../components/navigation/menu/index.js'
import type { Pagination } from '../../components/navigation/pagination/index.js'
import type { PanelHeader } from '../../components/layout/panel-header/index.js'
import type { EditableLabel } from '../../components/form/editable-label/index.js'
import type { SelectionOverlay } from '../../components/editor/selection-overlay/index.js'
import type { CubeRuntime } from '../../components/core/runtime.js'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-segmented-control')))
}

test('selection handles do not emit empty button actions after resizing or rotating', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-selection-overlay') as SelectionOverlay
        Object.assign(host,{rect:{x:100,y:100,width:180,height:100},resizable:true,rotatable:true,resizeLabel:'Resize {handle}',rotateLabel:'Rotate selection'})
        const events: string[] = []
        host.dataset.events = '[]'
        for(const type of ['rectchange','rotationchange','action','beforeaction']) host.addEventListener(type,() => {
            events.push(type); host.dataset.events = JSON.stringify(events)
        })
        document.querySelector('#fixture')!.append(host)
    })
    const host = page.locator('cb-selection-overlay')
    const resize = host.getByRole('button',{name:'Resize e',exact:true})
    await resize.click()
    await resize.press('ArrowRight')
    const rotate = host.getByRole('button',{name:'Rotate selection',exact:true})
    await rotate.click()
    await rotate.press('ArrowRight')
    await expect(host).toHaveAttribute('data-events','["rectchange","rotationchange"]')
})

test('pagination emits one change and no empty actions including canceled and no-op selections', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-pagination') as Pagination
        Object.assign(host,{page:2,totalPages:4,previousLabel:'Previous page',nextLabel:'Next page',pageLabel:'Page {page}'})
        for(const type of ['beforechange','change']) host.addEventListener(type,event => {
            host.dataset.hasPreviousPage = String(Object.hasOwn((event as CustomEvent<object>).detail,'previousPage'))
        })
        const events: Array<{type:string;value:number;previousValue?:number}> = []
        host.dataset.events = '[]'
        for(const type of ['change','action','beforeaction']) host.addEventListener(type,event => {
            const {value,previousValue} = (event as CustomEvent<{value:number;previousValue?:number}>).detail
            events.push({type,value,previousValue})
            host.dataset.events = JSON.stringify(events)
        })
        document.querySelector('#fixture')!.append(host)
    })
    const host = page.locator('cb-pagination')
    await host.getByRole('button',{name:'Page 3',exact:true}).click()
    const expected = [{type:'change',value:3,previousValue:2}]
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
    await expect(host).toHaveAttribute('data-has-previous-page','false')
    await host.getByRole('button',{name:'Page 3',exact:true}).click()
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
    await host.getByRole('button',{name:'Next page',exact:true}).focus()
    await page.keyboard.press('Enter')
    expected.push({type:'change',value:4,previousValue:3})
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
    await host.getByRole('button',{name:'Previous page',exact:true}).focus()
    await page.keyboard.press('Space')
    expected.push({type:'change',value:3,previousValue:4})
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
    await host.evaluate(node => node.addEventListener('beforechange',event => event.preventDefault(),{once:true}))
    await host.getByRole('button',{name:'Page 1',exact:true}).click()
    await expect(host).toHaveJSProperty('page',3)
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
})

test('panel header toggle contains its internal button actions', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-panel-header') as PanelHeader
        Object.assign(host,{collapsible:true,expanded:true,collapseLabel:'Collapse panel',expandLabel:'Expand panel'})
        const events: string[] = []
        for(const type of ['toggle','action','beforeaction']) host.addEventListener(type,() => {
            events.push(type); host.dataset.events = JSON.stringify(events)
        })
        document.querySelector('#fixture')!.append(host)
    })
    const host = page.locator('cb-panel-header')
    await host.getByRole('button',{name:'Collapse panel',exact:true}).click()
    await expect(host).toHaveAttribute('data-events','["toggle"]')
    await host.getByRole('button',{name:'Expand panel',exact:true}).click()
    await expect(host).toHaveAttribute('data-events','["toggle","toggle"]')
})

test('editable label start, confirm, and cancel do not leak blank actions', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-editable-label') as EditableLabel
        Object.assign(host,{value:'Original',editLabel:'Edit label',saveLabel:'Save label',cancelLabel:'Cancel label'})
        const events: string[] = []
        for(const type of ['editstart','editend','change','action','beforeaction']) host.addEventListener(type,() => {
            events.push(type); host.dataset.events = JSON.stringify(events)
        })
        document.querySelector('#fixture')!.append(host)
    })
    const host = page.locator('cb-editable-label')
    await host.getByRole('button',{name:'Edit label',exact:true}).click()
    await host.getByRole('textbox').fill('Updated')
    await expect(host).toHaveAttribute('data-events','["editstart"]')
    await host.getByRole('button',{name:'Save label',exact:true}).click()
    await expect(host).toHaveAttribute('data-events','["editstart","change","editend"]')
    await host.getByRole('button',{name:'Edit label',exact:true}).click()
    await host.getByRole('textbox').fill('Canceled')
    await host.getByRole('button',{name:'Cancel label',exact:true}).click()
    await expect(host).toHaveJSProperty('value','Updated')
    await expect(host).toHaveAttribute('data-events','["editstart","change","editend","editstart","editend"]')
})

test('menu action payload includes checked only for checkable items', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-menu') as Menu
        host.items = [
            {id:'action',label:'Regular action'},
            {id:'check',label:'Unchecked option',type:'checkbox',checked:false},
            {id:'uncheck',label:'Checked option',type:'checkbox',checked:true},
            {id:'radio',label:'Radio option',type:'radio',checked:false},
        ]
        const events: Array<{id:string;hasChecked:boolean;checked?:boolean}> = []
        host.addEventListener('action',event => {
            const detail = (event as CustomEvent<{id:string;checked?:boolean}>).detail
            events.push({id:detail.id,hasChecked:Object.hasOwn(detail,'checked'),checked:detail.checked})
            host.dataset.events = JSON.stringify(events)
        })
        document.querySelector('#fixture')!.append(host)
    })
    const host = page.locator('cb-menu')
    await host.getByRole('menuitem',{name:'Regular action',exact:true}).click()
    await host.getByRole('menuitemcheckbox',{name:'Unchecked option',exact:true}).click()
    await host.getByRole('menuitemcheckbox',{name:'Checked option',exact:true}).click()
    await host.getByRole('menuitemradio',{name:'Radio option',exact:true}).click()
    await expect(host).toHaveAttribute('data-events',JSON.stringify([
        {id:'action',hasChecked:false},
        {id:'check',hasChecked:true,checked:true},
        {id:'uncheck',hasChecked:true,checked:false},
        {id:'radio',hasChecked:true,checked:true},
    ]))
})

test('breadcrumbs contain internal events for buttons, links, and overflow expansion', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-breadcrumb') as Breadcrumb
        Object.assign(host,{maxItems:3,expandLabel:'Show ancestors',items:[
            {id:'one',label:'First'}, {id:'two',label:'Second',href:'#second'},
            {id:'three',label:'Third'}, {id:'four',label:'Current'},
        ]})
        const events: Array<{type:string;id?:string}> = []
        host.dataset.events = '[]'
        for(const type of ['beforenavigate','navigate','beforeaction','action']) host.addEventListener(type,event => {
            const {id} = (event as CustomEvent<{id?:string}>).detail
            events.push({type,id})
            host.dataset.events = JSON.stringify(events)
        })
        document.querySelector('#fixture')!.append(host)
    })
    const host = page.locator('cb-breadcrumb')
    await host.getByRole('button',{name:'Show ancestors',exact:true}).click()
    await expect(host).toHaveAttribute('data-events','[]')
    await host.getByRole('button',{name:'First',exact:true}).click()
    const expected = [{type:'beforenavigate',id:'one'},{type:'navigate',id:'one'}]
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
    await host.getByRole('link',{name:'Second',exact:true}).click()
    expected.push({type:'beforenavigate',id:'two'},{type:'navigate',id:'two'})
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
    await expect(page).toHaveURL(/#second$/)
    await host.evaluate(node => node.addEventListener('beforenavigate',event => event.preventDefault(),{once:true}))
    await host.getByRole('button',{name:'Third',exact:true}).focus()
    await page.keyboard.press('Enter')
    expected.push({type:'beforenavigate',id:'three'})
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
    await host.evaluate(node => node.addEventListener('beforenavigate',event => event.preventDefault(),{once:true}))
    await page.evaluate(() => { location.hash = 'unchanged' })
    await host.getByRole('link',{name:'Second',exact:true}).click()
    expected.push({type:'beforenavigate',id:'two'})
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
    await expect(page).toHaveURL(/#unchanged$/)
})

test('segmented controls support independent multiple choices with one cancelable change', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-segmented-control') as SegmentedControl
        Object.assign(host, { multiple: true, allowEmpty: true, iconOnly: true, accessibleLabel: 'Formatting',
            items: [{ id: 'one', label: 'First', icon: 'uppercase' }, { id: 'two', label: 'Second', icon: 'fullWidth' }, { id: 'disabled', label: 'Unavailable', disabled: true }], values: [] } satisfies Partial<SegmentedControl>)
        const changes: string[][] = []
        host.dataset.events = '[]'
        host.addEventListener('change', event => {
            changes.push((event as CustomEvent<{ values: string[] }>).detail.values)
            host.dataset.events = JSON.stringify(changes)
        })
        host.addEventListener('beforechange', event => {
            if (host.hasAttribute('data-veto')) event.preventDefault()
            const { value, values } = (event as CustomEvent<{ value: string; values: string[] }>).detail
            if (host.hasAttribute('data-exclusive') && values.includes(value)) values.splice(0, values.length, value)
        })
        document.querySelector('#fixture')!.append(host)
    })
    const host = page.locator('cb-segmented-control'), group = host.getByRole('group', { name: 'Formatting', exact: true })
    const first = group.getByRole('checkbox', { name: 'First', exact: true }), second = group.getByRole('checkbox', { name: 'Second', exact: true })
    await expect(group.getByRole('checkbox', { name: 'Unavailable', exact: true })).toBeDisabled()
    await expect(first).not.toBeChecked()
    await first.click()
    await second.click()
    await expect(first).toBeChecked()
    await expect(second).toBeChecked()
    await first.click()
    await expect(first).not.toBeChecked()
    await expect(second).toBeChecked()
    await second.press('Space')
    await expect(group.locator('[aria-checked="true"]')).toHaveCount(0)
    await expect(host).toHaveAttribute('data-events', JSON.stringify([['one'], ['one', 'two'], ['two'], []]))
    await host.evaluate(node => { (node as SegmentedControl).values = ['one', 'two'] })
    await expect(first).toBeChecked()
    await expect(second).toBeChecked()
    await host.evaluate(node => { (node as SegmentedControl).values = ['two'] })
    await expect(first).not.toBeChecked()
    await expect(second).toBeChecked()
    await host.evaluate(node => { (node as SegmentedControl).values = [] })
    await host.evaluate(node => node.setAttribute('data-veto', ''))
    await first.click()
    await expect(first).not.toBeChecked()
    await expect(host).toHaveAttribute('data-events', JSON.stringify([['one'], ['one', 'two'], ['two'], []]))
    await host.evaluate(node => { node.removeAttribute('data-veto'); node.setAttribute('data-exclusive', '') })
    await first.click()
    await second.click()
    await expect(first).not.toBeChecked()
    await expect(second).toBeChecked()
    await expect(host).toHaveJSProperty('values', ['two'])
})

test('segmented controls can opt into cancelable mouse and keyboard deselection', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-segmented-control') as SegmentedControl
        Object.assign(host, { allowEmpty: true, items: [{ id: 'one', label: 'First' }, { id: 'two', label: 'Second' }] } satisfies Partial<SegmentedControl>)
        const changes: string[] = []
        host.dataset.events = '[]'
        host.addEventListener('change', event => {
            changes.push((event as CustomEvent<{ value: string }>).detail.value)
            host.dataset.events = JSON.stringify(changes)
        })
        host.addEventListener('beforechange', event => { if (host.hasAttribute('data-veto')) event.preventDefault() })
        document.querySelector('#fixture')!.append(host)
    })
    const host = page.locator('cb-segmented-control'), first = host.getByRole('radio', { name: 'First', exact: true })
    await expect(host.locator('[aria-checked="true"]')).toHaveCount(0)
    await expect(first).toHaveAttribute('tabindex', '0')
    await first.click()
    await expect(first).toHaveAttribute('aria-checked', 'true')
    await first.click()
    await expect(host.locator('[aria-checked="true"]')).toHaveCount(0)
    await expect(host).toHaveAttribute('data-events', JSON.stringify(['one', '']))
    await first.press('Space')
    await expect(first).toHaveAttribute('aria-checked', 'true')
    await first.press('Space')
    await expect(host.locator('[aria-checked="true"]')).toHaveCount(0)
    await first.click()
    await host.evaluate(node => node.setAttribute('data-veto', ''))
    await first.click()
    await expect(first).toHaveAttribute('aria-checked', 'true')
    await expect(host).toHaveAttribute('data-events', JSON.stringify(['one', '', 'one', '', 'one']))
})

test('segmented selection emits one meaningful outcome for mouse and keyboard activation', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-segmented-control') as SegmentedControl
        Object.assign(host,{value:'one',items:[{id:'one',label:'First'},{id:'two',label:'Second'},{id:'disabled',label:'Unavailable',disabled:true}]})
        const events: Array<{type:string;value:string;previousValue?:string}> = []
        for(const type of ['change','action','beforeaction']) host.addEventListener(type,event => {
            const {value,previousValue} = (event as CustomEvent<{value:string;previousValue?:string}>).detail
            events.push({type,value,previousValue})
            host.dataset.events = JSON.stringify(events)
        })
        document.querySelector('#fixture')!.append(host)
    })
    const host = page.locator('cb-segmented-control')
    await page.getByRole('radio',{name:'Second',exact:true}).click()
    await expect(host).toHaveAttribute('data-events',JSON.stringify([{type:'change',value:'two',previousValue:'one'}]))
    await page.getByRole('radio',{name:'Second',exact:true}).click()
    await expect(host).toHaveAttribute('data-events',JSON.stringify([{type:'change',value:'two',previousValue:'one'}]))
    await page.getByRole('radio',{name:'First',exact:true}).focus()
    await page.keyboard.press('Space')
    const expected = [{type:'change',value:'two',previousValue:'one'},{type:'change',value:'one',previousValue:'two'}]
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
    await host.evaluate(node => node.addEventListener('beforechange',event => event.preventDefault(),{once:true}))
    await page.getByRole('radio',{name:'Second',exact:true}).focus()
    await page.keyboard.press('Enter')
    await expect(host).toHaveJSProperty('value','one')
    await expect(host).toHaveAttribute('data-events',JSON.stringify(expected))
})

test('tabs contain button actions for selection and close outcomes', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-tabs') as Tabs
        Object.assign(host,{value:'one',closeLabel:'Close {tab}',items:[{id:'one',label:'First'},{id:'two',label:'Second',closable:true}]})
        const events: Array<{type:string;value:string}> = []
        for(const type of ['change','close','action','beforeaction']) host.addEventListener(type,event => {
            const {value} = (event as CustomEvent<{value:string}>).detail
            events.push({type,value})
            host.dataset.events = JSON.stringify(events)
        })
        document.querySelector('#fixture')!.append(host)
    })
    const host = page.locator('cb-tabs')
    await page.getByRole('tab',{name:'Second',exact:true}).click()
    await expect(host).toHaveAttribute('data-events',JSON.stringify([{type:'change',value:'two'}]))
    await page.getByRole('button',{name:'Close Second',exact:true}).click()
    await expect(host).toHaveAttribute('data-events',JSON.stringify([{type:'change',value:'two'},{type:'close',value:'one'}]))
})

test('tabs render custom templates and nodes with label fallback and retain native selection and close', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const browser = globalThis as typeof globalThis & { BFS: { MARKUP: Pick<CubeRuntime, 'html'> } }
        const { html } = browser.BFS.MARKUP
        const host = document.createElement('cb-tabs') as Tabs
        host.id = 'custom-tabs'
        Object.assign(host, {
            accessibleLabel: 'Documents', value: 'pages', closeLabel: 'Close {tab}',
            items: [
                { id: 'pages', label: 'Pages' },
                { id: 'component', label: 'Component', closable: true,
                    renderItem: () => html`<span data-template-header><b>Custom component</b><span aria-hidden="true"> *</span></span>` },
                { id: 'node', label: 'Node', renderItem: () => {
                    const node = document.createElement('em')
                    node.textContent = 'Node header'
                    return node
                } },
                { id: 'disabled', label: 'Disabled', disabled: true, renderItem: () => html`<span>Unavailable document</span>` },
            ],
        } satisfies Partial<Tabs>)
        document.getElementById('fixture')!.append(host)
    })
    const host = page.locator('#custom-tabs')
    const pages = host.getByRole('tab', { name: 'Pages', exact: true })
    const component = host.getByRole('tab', { name: 'Component', exact: true })
    const node = host.getByRole('tab', { name: 'Node', exact: true })
    await expect(pages).toHaveText('Pages')
    await expect(component).toContainText('Custom component')
    await expect(node).toHaveText('Node header')
    await component.click()
    await expect(component).toHaveAttribute('aria-selected', 'true')
    const close = host.getByRole('button', { name: 'Close Component', exact: true })
    const closeBounds = (await close.boundingBox())!
    const labelBounds = (await component.getByText('Custom component', { exact: true }).boundingBox())!
    const iconBounds = (await close.locator('svg').boundingBox())!
    expect(Math.abs(labelBounds.y + labelBounds.height / 2 - iconBounds.y - iconBounds.height / 2)).toBeLessThanOrEqual(1)
    expect(closeBounds.x).toBeGreaterThan(labelBounds.x + labelBounds.width)
    const header = await component.evaluate(element => {
        const group = element.parentElement!
        const marker = getComputedStyle(group, '::after')
        return { left: group.getBoundingClientRect().left, width: Number.parseFloat(marker.width), color: marker.backgroundColor }
    })
    expect(header.left + header.width).toBeGreaterThanOrEqual(closeBounds.x + closeBounds.width - 1)
    expect(header.color).not.toBe('rgba(0, 0, 0, 0)')
    await component.focus()
    await page.keyboard.press('ArrowRight')
    await expect(node).toBeFocused()
    await expect(node).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowRight')
    await expect(pages).toBeFocused()
    await close.click()
    await expect(component).toHaveCount(0)
    await expect(pages).toHaveAttribute('aria-selected', 'true')
})

for(const direction of ['ltr','rtl'] as const) for(const placement of ['start','end'] as const) {
    test(`sidebar arrow follows horizontal expansion (${direction}, ${placement})`, async ({ page }) => {
        await start(page)
        await page.evaluate(({direction,placement}) => {
            const host = document.createElement('cb-sidebar') as Sidebar
            host.dir = direction
            Object.assign(host,{label:'Sidebar',placement,collapsible:true,expanded:true,expandLabel:'Expand',collapseLabel:'Collapse'})
            document.querySelector('#fixture')!.append(host)
        },{direction,placement})
        const host = page.locator('cb-sidebar')
        const toggle = host.locator('cb-panel-header [part~=toggle]')
        const expandedAngle = (direction === 'rtl' ? -1 : 1) * (placement === 'end' ? -1 : 1) * 90
        await expect(toggle).toHaveCSS('rotate',`${expandedAngle}deg`)
        await host.getByRole('button',{name:'Collapse',exact:true}).click()
        await expect(host).toHaveAttribute('data-collapsed','')
        await expect(toggle).toHaveCSS('rotate',`${-expandedAngle}deg`)
        await host.getByRole('button',{name:'Expand',exact:true}).click()
        await expect(toggle).toHaveCSS('rotate',`${expandedAngle}deg`)
    })
}
