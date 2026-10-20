import { test, expect, type Page } from '@playwright/test'
import type { LinkedValues, LinkedValuesChangeDetail } from '../../components/form/linked-values/index.js'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-linked-values')))
}

test('CSV attributes render a pair, submit names, and preserve native labels', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const form = document.createElement('form')
        const fieldset = document.createElement('fieldset')
        const label = document.createElement('label')
        label.htmlFor = 'dimensions'; label.textContent = 'Dimensions'
        const linked = document.createElement('cb-linked-values') as LinkedValues
        linked.id = 'dimensions'
        linked.setAttribute('values','320, 180')
        linked.setAttribute('names','width, height')
        linked.setAttribute('field-labels','Width, Height')
        linked.setAttribute('linked','')
        linked.linkLabel = 'Link dimensions'; linked.unlinkLabel = 'Unlink dimensions'
        linked.addEventListener('change',event => {
            const {value,previousValue,index,linked:locked} = (event as CustomEvent<LinkedValuesChangeDetail>).detail
            linked.dataset.detail = JSON.stringify({value,previousValue,index,linked:locked})
            linked.dataset.changes = String(Number(linked.dataset.changes ?? 0)+1)
        })
        fieldset.append(linked); form.append(label,fieldset)
        document.querySelector('#fixture')!.append(form)
    })
    const host = page.locator('cb-linked-values')
    await expect(host.getByRole('spinbutton',{name:'Width',exact:true})).toHaveValue('320')
    await expect(host.getByRole('spinbutton',{name:'Height',exact:true})).toHaveValue('180')
    expect(await host.evaluate((host: LinkedValues) => Array.from(host.labels ?? []).map(node => node.textContent))).toEqual(['Dimensions'])
    expect(await page.locator('form').evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form)))).toEqual({width:'320',height:'180'})
    await host.getByRole('spinbutton',{name:'Width',exact:true}).fill('640')
    await expect(host).toHaveJSProperty('values',[640,360])
    await expect(host).toHaveAttribute('data-detail',JSON.stringify({value:[640,360],previousValue:[320,180],index:0,linked:true}))
    await expect(host).toHaveAttribute('data-changes','1')
    expect(await page.locator('form').evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form)))).toEqual({width:'640',height:'360'})
    await page.locator('form').evaluate((form: HTMLFormElement) => form.reset())
    await expect(host).toHaveJSProperty('values',[320,180])
    await expect(host).toHaveAttribute('data-changes','1')
    await page.locator('fieldset').evaluate((node: HTMLFieldSetElement) => { node.disabled = true })
    await expect(host.getByRole('spinbutton',{name:'Width',exact:true})).toBeDisabled()
    expect(await page.locator('form').evaluate((form: HTMLFormElement) => [...new FormData(form)])).toEqual([])
})

test('array properties remain reactive and input arrays are never mutated', async ({ page }) => {
    await start(page)
    const result = await page.evaluate(() => {
        const host = document.createElement('cb-linked-values') as LinkedValues
        const values = Object.freeze([3,2])
        Object.assign(host,{values,fieldLabels:['Width','Height'],names:['width','height'],linked:true})
        document.querySelector('#fixture')!.append(host)
        host.setValueAt(0,4)
        const intermediate = host.values
        host.setValueAt(0,6)
        const rounded = host.values
        host.values = [100,50]
        host.setValueAt(1,100)
        return {values,intermediate,rounded,next:host.values}
    })
    expect(result).toEqual({values:[3,2],intermediate:[4,3],rounded:[6,4],next:[200,100]})
    const host = page.locator('cb-linked-values')
    await expect(host.getByRole('spinbutton',{name:'Width',exact:true})).toHaveValue('200')
    await host.evaluate((host: LinkedValues) => {
        host.setAttribute('values','40,20')
        host.fieldLabels = ['X','Y']
        host.names = ['x','y']
    })
    await expect(host.getByRole('spinbutton',{name:'X',exact:true})).toHaveValue('40')
    await expect(host.getByRole('spinbutton',{name:'Y',exact:true})).toHaveValue('20')
    await host.evaluate((host: LinkedValues) => host.setValueAt(0,80))
    await expect(host).toHaveJSProperty('values',[80,40])
})

test('quoted CSV captions support commas and escaped quotes', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const host = document.createElement('cb-linked-values') as LinkedValues
        host.setAttribute('values','-12.5,24')
        host.setAttribute('field-labels','"Width, px","Height ""fixed"""')
        document.querySelector('#fixture')!.append(host)
    })
    await expect(page.getByRole('spinbutton',{name:'Width, px',exact:true})).toHaveValue('-12.5')
    await expect(page.getByRole('spinbutton',{name:'Height "fixed"',exact:true})).toHaveValue('24')
    await page.locator('cb-linked-values').evaluate((host: LinkedValues) => {
        host.setAttribute('values','320')
        host.setAttribute('field-labels','123')
    })
    await expect(page.getByRole('spinbutton',{name:'123',exact:true})).toHaveValue('320')
    await expect(page.locator('cb-linked-values [part~=second]').getByRole('spinbutton')).toHaveValue('0')
})

test('unlinked updates, cancellation, read-only, and state restoration use grouped values', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const form = document.createElement('form')
        const host = document.createElement('cb-linked-values') as LinkedValues
        Object.assign(host,{values:[10,20],fieldLabels:['X','Y'],names:['x','y']})
        form.append(host); document.querySelector('#fixture')!.append(form)
    })
    const host = page.locator('cb-linked-values')
    await host.evaluate((host: LinkedValues) => host.setValueAt(1,30))
    await expect(host).toHaveJSProperty('values',[10,30])
    await host.evaluate((host: LinkedValues) => {
        host.addEventListener('beforechange',event => event.preventDefault(),{once:true})
        host.setValueAt(0,50)
    })
    await expect(host).toHaveJSProperty('values',[10,30])
    await host.evaluate((host: LinkedValues) => { host.readOnly = true })
    await expect(host.getByRole('spinbutton',{name:'X',exact:true})).toHaveAttribute('readonly')
    expect(await host.evaluate((host: LinkedValues) => host.setValueAt(0,60))).toBe(false)
    await host.evaluate((host: LinkedValues) => {
        host.readOnly = false
        const state = new FormData(); state.append('x','25'); state.append('y','50')
        host.formStateRestoreCallback(state,'restore')
    })
    await expect(host).toHaveJSProperty('values',[25,50])
    expect(await page.locator('form').evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form)))).toEqual({x:'25',y:'50'})
})
