import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
async function start(page:import('@playwright/test').Page){await page.goto('/tests/browser/fixture.html');await page.waitForFunction(()=>!!customElements.get('cb-select'))}
test('shared controls accept application-supplied names and report no component errors',async({page})=>{
    await start(page)
    await page.evaluate(()=>{(window as any).componentErrors=[];document.addEventListener('error',e=>(window as any).componentErrors.push(String((e as CustomEvent).detail.error)));const values=[['button',{accessibleLabel:'Action'}],['slider',{accessibleLabel:'Value'}],['select',{accessibleLabel:'Choose an option'}],['calendar',{accessibleLabel:'Calendar',previousLabel:'Previous month',nextLabel:'Next month'}],['icon',{label:'Icon'}]] as const;for(const [name,props] of values){const element=document.createElement('cb-'+name);Object.assign(element,props);document.querySelector('#fixture')!.append(element)}})
    await expect(page.locator('#fixture > cb-button').getByRole('button')).toHaveAccessibleName('Action')
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
    await page.evaluate(()=>{(window as any).actionCount=0;const node=document.createElement('cb-button');Object.assign(node,{label:'Run action'});node.addEventListener('action',()=>((window as any).actionCount++));document.querySelector('#fixture')!.append(node)})
    const button=page.getByRole('button',{name:'Run action'});await button.focus();await page.keyboard.press('Space');expect(await page.evaluate(()=>(window as any).actionCount)).toBe(1)
    await page.locator('cb-button').evaluate(n=>n.addEventListener('beforeaction',e=>e.preventDefault()))
    await page.keyboard.press('Enter');expect(await page.evaluate(()=>(window as any).actionCount)).toBe(1)
})

test('false disabled attributes re-enable form-associated controls',async({page})=>{
    await start(page);await page.evaluate(()=>{const button=document.createElement('cb-button');Object.assign(button,{label:'Play',disabled:true});document.querySelector('#fixture')!.append(button)})
    const button=page.getByRole('button',{name:'Play',exact:true});await expect(button).toBeDisabled();await page.locator('cb-button').evaluate((n:any)=>n.disabled=false);await expect(button).toBeEnabled();await button.focus();await expect(button).toBeFocused();await expect(page.locator('cb-button')).not.toHaveAttribute('disabled')
})

test('all value controls use the shared native form-control contract',async({page})=>{
    await start(page)
    const formAssociated=await page.evaluate(()=>{
        const tags=['cb-text-input','cb-textarea','cb-number-input','cb-unit-input','cb-combobox','cb-checkbox','cb-switch','cb-range-slider','cb-stepper','cb-date-picker','cb-time-picker','cb-file-picker','cb-token-input','cb-slider','cb-select','cb-radio-group','cb-calendar','cb-editable-list','cb-code-editor','cb-json-editor','cb-linked-values','cb-editable-label','cb-masked-input','cb-color-picker','cb-gradient-editor']
        return Object.fromEntries(tags.map(tag=>[tag,Reflect.get(customElements.get(tag)??{},'formAssociated')]))
    })
    expect(Object.values(formAssociated).every(Boolean)).toBe(true)
})

test('primitive controls submit, reset, disable, and emit one real-time change',async({page})=>{
    await start(page)
    await page.evaluate(()=>{
        const form=document.createElement('form')
        const fieldset=document.createElement('fieldset');fieldset.id='primitive-controls'
        const text=document.createElement('cb-text-input');Object.assign(text,{label:'Title',name:'title',value:'Initial'})
        const number=document.createElement('cb-number-input');Object.assign(number,{label:'Count',name:'count',value:2,min:0,max:10})
        const range=document.createElement('cb-range-slider');Object.assign(range,{label:'Opacity',name:'opacity',value:25,min:0,max:100})
        const choice=document.createElement('cb-checkbox');Object.assign(choice,{label:'Published',name:'published',value:'yes',checked:true})
        const tokens=document.createElement('cb-token-input');Object.assign(tokens,{label:'Tags',name:'tags',value:['design','system'],items:[]})
        text.addEventListener('change',()=>{text.dataset.changeCount=String(Number(text.dataset.changeCount??0)+1)})
        text.addEventListener('cb-change',()=>{text.dataset.prefixedChangeCount=String(Number(text.dataset.prefixedChangeCount??0)+1)})
        range.addEventListener('change',()=>{range.dataset.changeCount=String(Number(range.dataset.changeCount??0)+1)})
        fieldset.append(text,number,range,choice,tokens);form.append(fieldset);document.querySelector('#fixture')!.append(form)
    })
    const submitted=await page.locator('form').evaluate((form:HTMLFormElement)=>{const data=new FormData(form);return{values:Object.fromEntries([...data.entries()].map(([name,value])=>[name,String(value)])),tags:data.getAll('tags')}})
    expect(submitted).toEqual({values:{title:'Initial',count:'2',opacity:'25',published:'yes',tags:'system'},tags:['design','system']})
    const text=page.getByRole('textbox',{name:'Title'});await text.fill('Edited')
    await expect(page.locator('cb-text-input')).toHaveAttribute('data-change-count','1')
    await expect(page.locator('cb-text-input')).not.toHaveAttribute('data-prefixed-change-count')
    const range=page.getByRole('slider',{name:'Opacity'});await range.focus();await page.keyboard.press('ArrowRight')
    await expect(page.locator('cb-range-slider')).toHaveAttribute('data-change-count','1')
    await page.locator('form').evaluate((form:HTMLFormElement)=>form.reset())
    await expect(text).toHaveValue('Initial');await expect(range).toHaveValue('25')
    await page.locator('#primitive-controls').evaluate((fieldset:HTMLFieldSetElement)=>{fieldset.disabled=true})
    await expect(text).toBeDisabled();await expect(range).toBeDisabled()
})

test('token selection is a live form value change',async({page})=>{
    await start(page)
    await page.evaluate(()=>{
        const form=document.createElement('form')
        const tokens=document.createElement('cb-token-input');Object.assign(tokens,{label:'Tags',name:'tags',value:[],items:[{id:'design',label:'Design'},{id:'system',label:'System'}]})
        tokens.addEventListener('change',()=>{tokens.dataset.changeCount=String(Number(tokens.dataset.changeCount??0)+1)})
        form.append(tokens);document.querySelector('#fixture')!.append(form)
    })
    await page.getByRole('button',{name:'Design'}).click()
    await expect(page.locator('cb-token-input')).toHaveAttribute('data-change-count','1')
    expect(await page.locator('form').evaluate((form:HTMLFormElement)=>new FormData(form).getAll('tags'))).toEqual(['design'])
})

test('editing controls use change as their single live value event',async({page})=>{
    await start(page)
    await page.evaluate(()=>{
        const fixture=document.querySelector('#fixture')!
        for(const [tag,props] of [
            ['cb-text-input',{label:'Live text',value:'before'}],
            ['cb-slider',{label:'Live slider',value:20,min:0,max:100}],
            ['cb-code-editor',{label:'Live code',value:'const before = true'}],
            ['cb-color-picker',{label:'Live color',value:'#2563eb',native:true}],
            ['cb-gradient-editor',{label:'Live gradient'}],
        ] as const){
            const control=document.createElement(tag);Object.assign(control,props)
            control.addEventListener('change',()=>{control.dataset.changeCount=String(Number(control.dataset.changeCount??0)+1)})
            control.addEventListener('input',()=>{control.dataset.inputCount=String(Number(control.dataset.inputCount??0)+1)})
            fixture.append(control)
        }
    })
    const text=page.getByRole('textbox',{name:'Live text'});await text.fill('after');await text.blur()
    const slider=page.getByRole('slider',{name:'Live slider'});await slider.focus();await page.keyboard.press('ArrowRight');await slider.blur()
    await page.locator('cb-code-editor textarea').fill('const after = true')
    await page.locator('#fixture > cb-color-picker input[type=color]').evaluate((input:HTMLInputElement)=>{input.value='#ff0000';input.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true}))})
    await page.locator('cb-gradient-editor input[part~=angle]').evaluate((input:HTMLInputElement)=>{input.value='45';input.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true}))})
    for(const tag of ['cb-text-input','cb-slider','cb-code-editor','cb-color-picker','cb-gradient-editor']){
        await expect(page.locator(`#fixture > ${tag}`)).toHaveAttribute('data-change-count','1')
        await expect(page.locator(`#fixture > ${tag}`)).not.toHaveAttribute('data-input-count')
    }
})

test('file controls submit File values and clear them on form reset',async({page})=>{
    await start(page)
    await page.evaluate(()=>{
        const form=document.createElement('form')
        const picker=document.createElement('cb-file-picker');Object.assign(picker,{label:'Assets',name:'assets',multiple:true,required:true})
        form.append(picker);document.querySelector('#fixture')!.append(form)
    })
    expect(await page.locator('form').evaluate((form:HTMLFormElement)=>form.checkValidity())).toBe(false)
    await page.locator('cb-file-picker input[type=file]').evaluate((input:HTMLInputElement)=>{
        const transfer=new DataTransfer();transfer.items.add(new File(['first'],'first.txt',{type:'text/plain'}));transfer.items.add(new File(['second'],'second.txt',{type:'text/plain'}))
        input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true,composed:true}))
    })
    const names=await page.locator('form').evaluate((form:HTMLFormElement)=>new FormData(form).getAll('assets').map(value=>value instanceof File?value.name:String(value)))
    expect(names).toEqual(['first.txt','second.txt'])
    expect(await page.locator('form').evaluate((form:HTMLFormElement)=>form.checkValidity())).toBe(true)
    await page.locator('form').evaluate((form:HTMLFormElement)=>form.reset())
    expect(await page.locator('form').evaluate((form:HTMLFormElement)=>new FormData(form).has('assets'))).toBe(false)
    await expect(page.locator('cb-file-picker input[type=file]')).toHaveValue('')
})
