import {readFile,access} from 'node:fs/promises'
import assert from 'node:assert/strict'
import {componentEntries} from './component-entries.js'
import {studioBoardItems,studioDefinitions,studioDesignReferences} from '../components/studio/catalog.js'
for(const {path,name,className}of componentEntries){
    await access(`components/${path}/${className}Base.ts`)
    assert.match(await readFile(`components/${path}/index.ts`,'utf8'),new RegExp(`register\\('cb-${name}'`))
}
for(const {category,name,className}of studioDefinitions){
    assert.match(await readFile(`components/${category}/${name}/${className}Base.ts`,'utf8'),/extends (?:StudioComponentBase|FormFieldBase|UIComponent|Component|ModalBase)/)
    await access(`components/${category}/${name}/base.ts`)
}
assert.equal(studioDefinitions.length,54,'The audited Studio catalog contains 54 component families')
assert.equal(studioDesignReferences.length,217,'The eleven Studio boards remain available as 217 design references')
for(const {name}of studioBoardItems)assert(componentEntries.some(entry=>entry.name===name),`Missing Studio board component: ${name}`)
const index=JSON.parse(await readFile('storybook-static/index.json','utf8'))
for(const id of ['bar','line','mixed-line-and-bar','area','bubble','scatter','pie','donut'])assert(index.entries[`charts--${id}`],`Missing ${id} story`)
for(const {category,name}of studioBoardItems)assert(index.entries[`${category}--${name}`],`Missing ${category}/${name} story`)
for(const {name}of studioDesignReferences)assert(name.length>0,'Every design reference has a stable name')
console.log(`${componentEntries.length} entry points, ${studioBoardItems.length} audited Studio components, all ${studioDesignReferences.length} design references, and all eight required chart stories verified.`)
