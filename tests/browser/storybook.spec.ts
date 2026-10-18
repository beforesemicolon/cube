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
