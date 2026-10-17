import {test,expect} from '@playwright/test'
const required=[['bar','Bar'],['line','Line'],['mixed-line-and-bar','Mixed line and bar'],['area','Area'],['bubble','Bubble'],['scatter','Scatter'],['pie','Pie'],['donut','Donut']]
for(const [id,name]of required)test(`built Storybook: ${name} finishes its interactive play function`,async({page})=>{
    const category=id==='pie'||id==='donut'?'piechart':'cartesianchart',tag=category==='piechart'?'cb-pie-chart':'cb-cartesian-chart'
    await page.goto(`http://127.0.0.1:6006/iframe.html?id=charts-${category}--${id}&viewMode=story`)
    await expect(page.locator(tag+'[data-story-ready=true]')).toBeVisible({timeout:20000})
    await expect(page.locator(tag+' [part=plot] svg')).toBeVisible()
})
