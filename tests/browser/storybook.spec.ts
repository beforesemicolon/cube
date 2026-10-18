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
