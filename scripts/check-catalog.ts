import {readFile,access} from 'node:fs/promises'
import assert from 'node:assert/strict'
import {componentEntries} from './component-entries.js'
import {studioBoardItems,studioDefinitions,studioDesignReferences} from '../components/studio/catalog.js'
for(const {path,name,className}of componentEntries){
    const baseSource=await readFile(`components/${path}/${className}Base.ts`,'utf8')
    const componentSource=await readFile(`components/${path}/index.ts`,'utf8')
    assert.match(componentSource,new RegExp(`register\\('cb-${name}', ${className}\\)`), `${className} must register on import`)
    assert.match(componentSource, /render\(\): Template/, `${className} must return a Markup template`)
    assert.match(componentSource,new RegExp(`class ${className}(?:<[^\\n]+>)? extends ${className}Base`),`${className} must inherit its component base`)
    assert.match(baseSource,new RegExp(`class ${className}Base(?:<[^\\n]+>)? extends (?:[A-Za-z]+Base|Component)(?:<[^\\n]+>)?`),`${className}Base must inherit Component or a named family base`)
    assert.doesNotMatch(baseSource,/UIComponent|StudioComponentBase|FormFieldBase/,`${className}Base uses a retired hierarchy layer`)
}
for(const {category,name,className}of studioDefinitions){
    const source=await readFile(`components/${category}/${name}/${className}Base.ts`,'utf8')
    assert.doesNotMatch(source,/StudioComponentBase|StudioProps/)
    assert.match(source,/extends (?:[A-Za-z]+Base|Component)/)
    await access(`components/${category}/${name}/base.ts`)
}
assert.equal(studioDefinitions.length,52,'The audited Studio catalog contains 52 component families')
assert.equal(studioDesignReferences.length,216,'The eleven Studio boards remain available as 216 design references')
for(const {name}of studioBoardItems)assert(componentEntries.some(entry=>entry.name===name),`Missing Studio board component: ${name}`)
const index=JSON.parse(await readFile('storybook-static/index.json','utf8'))
for(const id of ['bar','line','mixed-line-and-bar','area','bubble','scatter','pie','donut'])assert(index.entries[`charts--${id}`],`Missing ${id} story`)
for(const {category,name}of studioBoardItems)assert(index.entries[`${category}--${name}`],`Missing ${category}/${name} story`)
for(const {name}of studioDesignReferences)assert(name.length>0,'Every design reference has a stable name')
console.log(`${componentEntries.length} entry points, ${studioBoardItems.length} audited Studio components, all ${studioDesignReferences.length} design references, and all eight required chart stories verified.`)
