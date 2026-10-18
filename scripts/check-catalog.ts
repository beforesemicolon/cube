import {readFile,access} from 'node:fs/promises'
import assert from 'node:assert/strict'
import {componentEntries} from './component-entries.js'
import {studioBoardItems,studioDefinitions} from '../components/studio/catalog.js'
for(const {path,name,className}of componentEntries){
    await access(`components/${path}/${className}Base.ts`)
    assert.match(await readFile(`components/${path}/index.ts`,'utf8'),new RegExp(`register\\('cb-${name}'`))
}
for(const {category,name,className}of studioDefinitions){
    assert.match(await readFile(`components/${category}/${name}/${className}Base.ts`,'utf8'),/extends StudioComponentBase/)
    await access(`components/${category}/${name}/base.ts`)
}
assert.equal(studioBoardItems.length,217,'The eleven Studio boards contain 217 component cards')
for(const {name}of studioBoardItems)assert(componentEntries.some(entry=>entry.name===name),`Missing Studio board component: ${name}`)
const index=JSON.parse(await readFile('storybook-static/index.json','utf8'))
for(const id of ['bar','line','mixed-line-and-bar','area','bubble','scatter','pie','donut'])assert(index.entries[`charts--${id}`],`Missing ${id} story`)
for(const {category,name}of studioBoardItems)assert(index.entries[`${category}--${name}`],`Missing ${category}/${name} story`)
console.log(`${componentEntries.length} entry points, all ${studioBoardItems.length} Studio-board cards, and all eight required chart stories verified.`)
