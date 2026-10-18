import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
async function start(page:import('@playwright/test').Page){await page.goto('/tests/browser/fixture.html');await page.waitForFunction(()=>!!customElements.get('cb-select'))}
test('shared controls accept application-supplied names and report no component errors',async({page})=>{
    await start(page)
    await page.evaluate(()=>{(window as any).componentErrors=[];document.addEventListener('cb-error',e=>(window as any).componentErrors.push(String((e as CustomEvent).detail.error)));const values=[['button',{accessibleLabel:'Action'}],['slider',{accessibleLabel:'Value'}],['select',{accessibleLabel:'Choose an option'}],['calendar',{accessibleLabel:'Calendar',previousLabel:'Previous month',nextLabel:'Next month'}],['icon',{label:'Icon'}]] as const;for(const [name,props] of values){const element=document.createElement('cb-'+name);Object.assign(element,props);document.querySelector('#fixture')!.append(element)}})
    await expect(page.locator('cb-button').getByRole('button')).toHaveAccessibleName('Action')
    await expect(page.locator('cb-slider').getByRole('slider')).toHaveAccessibleName('Value')
    await expect(page.locator('cb-select').getByRole('button')).toHaveAccessibleName('Choose an option')
    expect(await page.evaluate(()=>(window as any).componentErrors)).toEqual([])
    const audit=await new AxeBuilder({page}).include('#fixture').analyze();expect(audit.violations).toEqual([])
})
test('slider and select use native form association, keyboard editing, reset and fieldset disabling',async({page})=>{
    await start(page)
    await page.evaluate(()=>{const form=document.createElement('form'),fieldset=document.createElement('fieldset');fieldset.id='controls';const range=document.createElement('cb-slider');Object.assign(range,{label:'Volume',name:'volume',min:0,max:100,step:5,value:50});const select=document.createElement('cb-select');Object.assign(select,{label:'Speed',name:'speed',value:'1',options:[{value:'1',label:'Normal'},{value:'2',label:'Double'}]});fieldset.append(range,select);form.append(fieldset);document.querySelector('#fixture')!.append(form)})
    const range=page.getByRole('slider',{name:'Volume'});await range.focus();await page.keyboard.press('ArrowRight');await expect(range).toHaveValue('55')
    const selectTrigger=page.locator('cb-select').getByRole('button',{name:/^Speed:/});await selectTrigger.click();await page.getByRole('option',{name:'Double'}).click()
    expect(await page.locator('form').evaluate((n:HTMLFormElement)=>Object.fromEntries(new FormData(n)))).toEqual({volume:'55',speed:'2'})
    await page.locator('form').evaluate((n:HTMLFormElement)=>n.reset());await expect(range).toHaveValue('50');await expect(page.locator('cb-select')).toHaveJSProperty('value',1)
    await page.locator('#controls').evaluate((n:HTMLFieldSetElement)=>n.disabled=true);await expect(range).toBeDisabled();await expect(selectTrigger).toBeDisabled();await page.locator('#controls').evaluate((n:HTMLFieldSetElement)=>n.disabled=false);await expect(range).toBeEnabled();await expect(selectTrigger).toBeEnabled()
})
test('button preserves keyboard and cancelable action behavior',async({page})=>{
    await start(page)
    await page.evaluate(()=>{(window as any).actionCount=0;const node=document.createElement('cb-button');Object.assign(node,{label:'Run action'});node.addEventListener('cb-action',()=>((window as any).actionCount++));document.querySelector('#fixture')!.append(node)})
    const button=page.getByRole('button',{name:'Run action'});await button.focus();await page.keyboard.press('Space');expect(await page.evaluate(()=>(window as any).actionCount)).toBe(1)
    await page.locator('cb-button').evaluate(n=>n.addEventListener('cb-before-action',e=>e.preventDefault()))
    await page.keyboard.press('Enter');expect(await page.evaluate(()=>(window as any).actionCount)).toBe(1)
})

test('false disabled attributes re-enable form-associated controls',async({page})=>{
    await start(page);await page.evaluate(()=>{const button=document.createElement('cb-button');Object.assign(button,{label:'Play',disabled:true});document.querySelector('#fixture')!.append(button)})
    const button=page.getByRole('button',{name:'Play',exact:true});await expect(button).toBeDisabled();await page.locator('cb-button').evaluate((n:any)=>n.disabled=false);await expect(button).toBeEnabled();await button.focus();await expect(button).toBeFocused();await expect(page.locator('cb-button')).not.toHaveAttribute('disabled')
})
