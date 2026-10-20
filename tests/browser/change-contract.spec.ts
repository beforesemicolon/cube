import { test, expect, type Page } from '@playwright/test'
import type { FilePicker } from '../../components/form/file-picker/index.js'
import type { DatePicker, DatePickerChangeDetail } from '../../components/form/date-picker/index.js'
import type { EditableLabel } from '../../components/form/editable-label/index.js'
import type { Modal } from '../../components/overlay/modal/index.js'
import type { Bezier } from '../../components/editor/bezier/index.js'
import type { Rulers } from '../../components/editor/rulers/index.js'
import type { Timeline } from '../../components/editor/timeline/index.js'
import type { Viewport } from '../../components/editor/viewport/index.js'
import type { DeviceFrame } from '../../components/editor/device-frame/index.js'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-modal')))
}

test.describe('date-picker Date payloads', () => {
    test.use({timezoneId:'America/Los_Angeles'})
    for (const native of [false,true]) {
        test(`date picker emits a local Date with string values (native=${native})`, async ({ page }) => {
            await start(page)
            await page.evaluate(native => {
                const picker = document.createElement('cb-date-picker') as DatePicker
                Object.assign(picker,{native,label:'Date',name:'date',value:'2026-10-18'})
                picker.addEventListener('change',event => {
                    const {value,previousValue,date} = (event as CustomEvent<DatePickerChangeDetail>).detail
                    picker.dataset.detail = JSON.stringify({value,previousValue,date:date instanceof Date ? [date.getFullYear(),date.getMonth()+1,date.getDate(),date.getHours()] : date})
                    picker.dataset.changes = String(Number(picker.dataset.changes ?? 0)+1)
                })
                const form = document.createElement('form')
                form.append(picker)
                document.querySelector('#fixture')!.append(form)
            },native)
            const picker = page.locator('cb-date-picker')
            if (native) await picker.locator('input[type=date]').fill('2026-10-19')
            else {
                await picker.locator('[part~=trigger]').click()
                await picker.locator('cb-calendar [data-value="2026-10-19"]').click()
            }
            await expect(picker).toHaveAttribute('data-detail',JSON.stringify({value:'2026-10-19',previousValue:'2026-10-18',date:[2026,10,19,12]}))
            expect(await page.locator('form').evaluate((form: HTMLFormElement)=>new FormData(form).get('date'))).toBe('2026-10-19')
            expect(await picker.evaluate((host: DatePicker)=>host.setValue('2026-02-30'))).toBe(false)
            await expect(picker).toHaveAttribute('data-changes','1')
            await picker.evaluate((host: DatePicker)=>host.setValue(''))
            await expect(picker).toHaveAttribute('data-detail',JSON.stringify({value:'',previousValue:'2026-10-19',date:null}))
            await expect(picker).toHaveAttribute('data-changes','2')
        })
    }
})

test('file picker replaces same-named files and submits the new bytes', async ({ page }) => {
    await start(page)
    const result = await page.evaluate(async () => {
        const form = document.createElement('form')
        const picker = document.createElement('cb-file-picker') as FilePicker
        picker.name = 'asset'
        form.append(picker)
        document.querySelector('#fixture')!.append(form)
        const changes: Array<{value: string; previousValue: string}> = []
        picker.addEventListener('change', event => {
            const {value,previousValue} = (event as CustomEvent<{value:string;previousValue:string}>).detail
            changes.push({value,previousValue})
        })
        const first = new File(['first'], 'image.png', {type:'image/png'})
        const second = new File(['second'], 'image.png', {type:'image/png'})
        const accepted = [picker.setFiles([first]), picker.setFiles([second]), picker.setFiles([second])]
        const submitted = new FormData(form).get('asset')
        return {accepted, changes, bytes: submitted instanceof File ? await submitted.text() : null}
    })
    expect(result.accepted).toEqual([true,true,false])
    expect(result.bytes).toBe('second')
    expect(result.changes).toEqual([{value:'image.png',previousValue:''},{value:'image.png',previousValue:'image.png'}])
})

test('closed document modals do not block the page, including property-driven close', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const button = document.createElement('button')
        button.textContent = 'Outside action'
        button.onclick = () => { button.dataset.clicked = 'true' }
        const modal = document.createElement('cb-modal') as Modal
        Object.assign(modal,{layer:'document',heading:'Document modal',cancelLabel:'Cancel'})
        document.querySelector('#fixture')!.append(button,modal)
    })
    const button = page.getByRole('button',{name:'Outside action'})
    const modal = page.locator('cb-modal')
    await button.click()
    await expect(button).toHaveAttribute('data-clicked','true')
    await modal.evaluate((host: Modal) => { host.open = true })
    await expect(modal.locator('dialog')).toBeVisible()
    await expect(modal).toHaveAttribute('data-open','')
    await modal.getByRole('button',{name:'Cancel',exact:true}).click()
    await expect(modal.locator('dialog')).toBeHidden()
    await expect(modal).not.toHaveAttribute('data-open')
    await button.click()
    await modal.evaluate((host: Modal) => { host.open = true })
    await modal.evaluate((host: Modal) => { host.open = false })
    await expect(modal.locator('dialog')).toBeHidden()
    await button.click()
})

for (const layer of ['top','document'] as const) {
    test(`long ${layer} modal content scrolls with a visible footer`, async ({ page }) => {
        await page.setViewportSize({width:1000,height:720})
        await start(page)
        await page.evaluate(layer => {
            const modal = document.createElement('cb-modal') as Modal
            Object.assign(modal,{layer,heading:'Long content',cancelLabel:'Cancel'})
            const content = document.createElement('div')
            content.style.height = '2000px'
            content.textContent = 'Long content'
            modal.append(content)
            document.querySelector('#fixture')!.append(modal)
            modal.show()
        },layer)
        const modal = page.locator('cb-modal')
        const body = modal.locator('[part~=body]')
        expect(await body.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true)
        const bounds = await modal.locator('dialog').boundingBox()
        const footer = await modal.locator('footer').boundingBox()
        expect(bounds).not.toBeNull()
        expect(footer).not.toBeNull()
        expect(footer!.y + footer!.height).toBeLessThanOrEqual(bounds!.y + bounds!.height)
        await body.evaluate(node => { node.scrollTop = node.scrollHeight })
        expect(await body.evaluate(node => node.scrollTop)).toBeGreaterThan(0)
        await modal.getByRole('button',{name:'Cancel',exact:true}).click()
        await expect(modal.locator('dialog')).toBeHidden()
    })
}

test('editable label emits change only for confirmed drafts and preserves form values on cancel', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const form = document.createElement('form')
        const label = document.createElement('cb-editable-label') as EditableLabel
        Object.assign(label,{name:'title',label:'Title',value:'Original',saveLabel:'Confirm',cancelLabel:'Cancel'})
        label.addEventListener('change', event => {
            label.dataset.changes = String(Number(label.dataset.changes ?? 0)+1)
            const {value,previousValue} = (event as CustomEvent<{value:string;previousValue:string}>).detail
            label.dataset.detail = JSON.stringify({value,previousValue})
        })
        form.append(label)
        document.querySelector('#fixture')!.append(form)
        label.startEditing()
    })
    const label = page.locator('cb-editable-label')
    const input = label.getByRole('textbox')
    await input.fill('Draft')
    await expect(label).toHaveJSProperty('value','Original')
    await expect(label).not.toHaveAttribute('data-changes')
    expect(await page.locator('form').evaluate((form: HTMLFormElement) => new FormData(form).get('title'))).toBe('Original')
    await input.blur()
    await expect(input).toBeVisible()
    await expect(label).not.toHaveAttribute('data-changes')
    await label.getByRole('button',{name:'Cancel',exact:true}).click()
    await expect(label).not.toHaveAttribute('data-changes')
    await label.evaluate((host: EditableLabel) => host.startEditing())
    await input.fill('Confirmed')
    await label.getByRole('button',{name:'Confirm',exact:true}).click()
    await expect(label).toHaveAttribute('data-changes','1')
    await expect(label).toHaveAttribute('data-detail',JSON.stringify({value:'Confirmed',previousValue:'Original'}))
    expect(await page.locator('form').evaluate((form: HTMLFormElement) => new FormData(form).get('title'))).toBe('Confirmed')
    await label.evaluate((host: EditableLabel) => host.startEditing())
    await input.fill('Discard')
    await input.press('Escape')
    await expect(label).toHaveJSProperty('value','Confirmed')
    await expect(label).toHaveAttribute('data-changes','1')
})

test('editor change events include typed previous and next values', async ({ page }) => {
    await start(page)
    const details = await page.evaluate(() => {
        const details: Array<{tag:string;value: string|number|object;previousValue:string|number|object}> = []
        const add = <T extends HTMLElement>(host:T):T => {
            host.addEventListener('change',event => {
                const detail = (event as CustomEvent<{value:string|number|object;previousValue:string|number|object}>).detail
                details.push({tag:host.localName,value:detail.value,previousValue:detail.previousValue})
            })
            document.querySelector('#fixture')!.append(host)
            return host
        }
        add(document.createElement('cb-bezier') as Bezier).setPoint(1,.5,.5)
        add(document.createElement('cb-rulers') as Rulers).setCursor(10,20,undefined,true)
        add(document.createElement('cb-timeline') as Timeline).seek(2)
        add(document.createElement('cb-viewport') as Viewport).setViewport(150,10,20)
        add(document.createElement('cb-device-frame') as DeviceFrame).toggleOrientation()
        return details
    })
    expect(details).toEqual([
        {tag:'cb-bezier',value:'cubic-bezier(0.5, 0.5, 0.25, 1)',previousValue:'cubic-bezier(0.25, 0.1, 0.25, 1)'},
        {tag:'cb-rulers',value:{x:10,y:20},previousValue:{x:0,y:0}},
        {tag:'cb-timeline',value:2,previousValue:0},
        {tag:'cb-viewport',value:{zoom:150,x:10,y:20},previousValue:{zoom:100,x:0,y:0}},
        {tag:'cb-device-frame',value:'portrait',previousValue:'landscape'},
    ])
})

test('navigation, dropdowns, split actions and form controls include previousValue', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const fixture = document.querySelector<HTMLElement>('#fixture')!
        Object.assign(fixture.style,{display:'grid',gap:'16px',justifyItems:'start'})
        const cases: ReadonlyArray<readonly [string,object]> = [
            ['cb-tabs',{items:[{id:'old',label:'Old tab'},{id:'new',label:'New tab'}],value:'old'}],
            ['cb-segmented-control',{items:[{id:'old',label:'Old segment'},{id:'new',label:'New segment'}],value:'old'}],
            ['cb-pagination',{page:1,totalPages:3,pageLabel:'Page {page}'}],
            ['cb-dropdown',{label:'Dropdown',items:[{id:'new',label:'New dropdown value'}],value:'old'}],
            ['cb-split-button',{label:'Primary action',items:[{id:'new',label:'Menu action'}],value:'old'}],
            ['cb-text-input',{label:'Text',value:'old'}],
            ['cb-checkbox',{label:'Checked',checked:false}],
            ['cb-button',{label:'Pressed',pressed:false}],
        ]
        for(const [tag,props] of cases) {
            const host = document.createElement(tag)
            Object.assign(host,props)
            host.addEventListener('change', event => {
                const {value,previousValue} = (event as CustomEvent<{value:string|number|boolean;previousValue:string|number|boolean}>).detail
                host.dataset.detail = JSON.stringify({value,previousValue})
            })
            fixture.append(host)
        }
    })
    await page.getByRole('tab',{name:'New tab'}).click()
    await page.getByRole('radio',{name:'New segment'}).click()
    await page.getByRole('button',{name:'Page 2',exact:true}).click()
    await page.locator('cb-dropdown').getByRole('button',{name:'Dropdown',exact:true}).click()
    await page.getByRole('menuitem',{name:'New dropdown value'}).click()
    await page.locator('cb-split-button [part=primary]').getByRole('button',{name:'Primary action',exact:true}).click()
    await page.getByRole('textbox',{name:'Text',exact:true}).fill('new')
    await page.getByRole('checkbox',{name:'Checked',exact:true}).check()
    await page.getByRole('button',{name:'Pressed',exact:true}).click()
    for(const tag of ['cb-tabs','cb-segmented-control','cb-dropdown','cb-text-input']) {
        await expect(page.locator(`#fixture > ${tag}`)).toHaveAttribute('data-detail',JSON.stringify({value:'new',previousValue:'old'}))
    }
    await expect(page.locator('cb-pagination')).toHaveAttribute('data-detail',JSON.stringify({value:2,previousValue:1}))
    await expect(page.locator('cb-split-button')).toHaveAttribute('data-detail',JSON.stringify({value:'old',previousValue:'old'}))
    for(const tag of ['cb-checkbox','cb-button']) {
        await expect(page.locator(`#fixture > ${tag}`)).toHaveAttribute('data-detail',JSON.stringify({value:true,previousValue:false}))
    }
})

test('combobox mouse selection closes suggestions without reopening on focus', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-combobox')
        Object.assign(host,{label:'Search',options:[{value:'alpha',label:'Alpha'},{value:'beta',label:'Beta'}]})
        document.querySelector('#fixture')!.append(host)
    })
    const input = page.getByRole('combobox',{name:'Search',exact:true})
    await input.focus()
    await expect(input).toHaveAttribute('aria-expanded','false')
    await input.fill('Al')
    await page.getByRole('option',{name:'Alpha',exact:true}).click()
    await expect(input).toBeFocused()
    await expect(input).toHaveValue('Alpha')
    await expect(input).toHaveAttribute('aria-expanded','false')
    await input.press('ArrowDown')
    await expect(input).toHaveAttribute('aria-expanded','true')
    await page.keyboard.press('Escape')
    await expect(input).toBeFocused()
    await expect(input).toHaveAttribute('aria-expanded','false')
})
