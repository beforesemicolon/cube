import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
async function start(page:import('@playwright/test').Page){await page.goto('/tests/browser/fixture.html');await page.waitForFunction(()=>!!customElements.get('cb-select'))}
test('shared controls have safe defaults, translated names and no component errors',async({page})=>{
    await start(page)
    await page.evaluate(()=>{(window as any).componentErrors=[];document.addEventListener('cb-error',e=>(window as any).componentErrors.push(String((e as CustomEvent).detail.error)));for(const name of ['button','icon-button','toggle-button','link-button','slider','select','icon'])document.querySelector('#fixture')!.append(document.createElement('cb-'+name))})
    await expect(page.locator('cb-button').getByRole('button')).toHaveAccessibleName('Action')
    await expect(page.locator('cb-slider').getByRole('slider')).toHaveAccessibleName('Value')
    await expect(page.locator('cb-select').getByRole('combobox')).toHaveAccessibleName('Choose an option')
    expect(await page.evaluate(()=>(window as any).componentErrors)).toEqual([])
    const audit=await new AxeBuilder({page}).include('#fixture').analyze();expect(audit.violations).toEqual([])
})
test('slider and select use native form association, keyboard editing, reset and fieldset disabling',async({page})=>{
    await start(page)
    await page.evaluate(()=>{const form=document.createElement('form'),fieldset=document.createElement('fieldset');fieldset.id='controls';const range=document.createElement('cb-slider');Object.assign(range,{label:'Volume',name:'volume',min:0,max:100,step:5,value:50});const select=document.createElement('cb-select');Object.assign(select,{label:'Speed',name:'speed',value:'1',options:[{value:'1',label:'Normal'},{value:'2',label:'Double'}]});fieldset.append(range,select);form.append(fieldset);document.querySelector('#fixture')!.append(form)})
    const range=page.getByRole('slider',{name:'Volume'});await range.focus();await page.keyboard.press('ArrowRight');await expect(range).toHaveValue('55')
    await page.getByRole('combobox',{name:'Speed'}).selectOption('2')
    expect(await page.locator('form').evaluate((n:HTMLFormElement)=>Object.fromEntries(new FormData(n)))).toEqual({volume:'55',speed:'2'})
    await page.locator('form').evaluate((n:HTMLFormElement)=>n.reset());await expect(range).toHaveValue('50');await expect(page.getByRole('combobox',{name:'Speed'})).toHaveValue('1')
    await page.locator('#controls').evaluate((n:HTMLFieldSetElement)=>n.disabled=true);await expect(range).toBeDisabled();await expect(page.getByRole('combobox',{name:'Speed'})).toBeDisabled();await page.locator('#controls').evaluate((n:HTMLFieldSetElement)=>n.disabled=false);await expect(range).toBeEnabled();await expect(page.getByRole('combobox',{name:'Speed'})).toBeEnabled()
})
test('shared button and anchor renderer preserve keyboard and cancelable action behavior',async({page})=>{
    await start(page)
    await page.evaluate(()=>{(window as any).actionCount=0;const node=document.createElement('cb-link-button');Object.assign(node,{label:'Run action'});node.addEventListener('cb-action',()=>((window as any).actionCount++));document.querySelector('#fixture')!.append(node)})
    const button=page.getByRole('button',{name:'Run action'});await button.focus();await page.keyboard.press('Space');expect(await page.evaluate(()=>(window as any).actionCount)).toBe(1)
    await page.locator('cb-link-button').evaluate(n=>n.addEventListener('cb-before-action',e=>e.preventDefault()))
    await page.keyboard.press('Enter');expect(await page.evaluate(()=>(window as any).actionCount)).toBe(1)
})

test('false disabled attributes re-enable composed form-associated controls',async({page})=>{
    await start(page);await page.evaluate(()=>{const button=document.createElement('cb-icon-button');Object.assign(button,{accessibleLabel:'Play',icon:'play',disabled:true});document.querySelector('#fixture')!.append(button)})
    const button=page.getByRole('button',{name:'Play',exact:true});await expect(button).toBeDisabled();await page.locator('cb-icon-button').evaluate((n:any)=>n.disabled=false);await expect(button).toBeEnabled();await button.focus();await expect(button).toBeFocused();await expect(page.locator('cb-icon-button')).not.toHaveAttribute('disabled')
})
