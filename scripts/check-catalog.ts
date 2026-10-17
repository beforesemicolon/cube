import {readFile,access} from 'node:fs/promises'
import assert from 'node:assert/strict'
import {componentEntries} from './component-entries.js'
for(const {path,name,className}of componentEntries){
    await access(`components/${path}/${className}Base.ts`)
    assert.match(await readFile(`components/${path}/index.ts`,'utf8'),new RegExp(`register\\('cb-${name}'`))
}
const index=JSON.parse(await readFile('storybook-static/index.json','utf8'))
for(const id of ['bar','line','mixed-line-and-bar','area','bubble','scatter'])assert(index.entries[`charts-cartesianchart--${id}`],`Missing ${id} story`)
for(const id of ['pie','donut'])assert(index.entries[`charts-piechart--${id}`],`Missing ${id} story`)
console.log(`${componentEntries.length} implemented entry points and all eight required chart stories verified.`)
