import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cubeTheme, flattenTheme } from '../components/theme/tokens.js'
const theme = (tokens: Record<string,unknown>)=>({schemaVersion:'1.0',name:'test',tokens:{color:{primary:'red'},...tokens}})
test('default themes match site-builder mode-aware contract',()=>{
    const light=flattenTheme(cubeTheme,'light'), dark=flattenTheme(cubeTheme,'dark')
    assert.equal(light['--color-primary'],'#2563EB');assert.equal(dark['--color-primary'],'#83B6FF')
    assert.equal(Object.keys(light).length,Object.keys(dark).length)
})
test('theme exposes a coherent application layer scale and local editor layers', () => {
    for (const appearance of ['light', 'dark'] as const) {
        const tokens = flattenTheme(cubeTheme, appearance)
        assert.deepEqual(['root', 'popup', 'overlay', 'modal', 'tooltip', 'flashbar', 'top'].map(name => tokens[`--z-index-${name}`]),
            ['0', '100', '200', '300', '400', '250', '10000'])
        // Optional per-surface overrides must not freeze the inherited popup value at provider scope.
        assert.equal(tokens['--z-index-dropdown'], undefined)
        assert.equal(tokens['--z-index-popover'], undefined)
        assert.equal(tokens['--z-index-selection'], '20')
        assert.equal(tokens['--component-control-touch-height'], '44px')
        assert.equal(tokens['--z-index-guide-labels'], undefined, 'guide labels derive from the local selection layer')
    }
})
test('missing mode falls back to default, but default-only objects remain groups',()=>{
    const t=theme({custom:{mode:{default:1,light:2},group:{default:3},pair:{light:4,dark:5}}})
    const result=flattenTheme(t,'dark')
    assert.equal(result['--custom-mode'],'1');assert.equal(result['--custom-group-default'],'3');assert.equal(result['--custom-pair-light'],'4')
})
test('uppercase DEFAULT scale and camelCase match site-builder names',()=>{
    const result=flattenTheme(theme({color:{brand:{DEFAULT:'red',100:'pink'}},typography:{body:{fontFamily:'sans-serif'}}}),'light')
    assert.equal(result['--color-brand'],'red');assert.equal(result['--color-brand-100'],'pink')
    assert.equal(result['--typography-body-font-family'],'sans-serif')
})
test('arrays and null do not emit declarations',()=>{
    const result=flattenTheme(theme({custom:{a:[1,2],b:null,c:false}}),'light')
    assert.equal(result['--custom-a'],undefined);assert.equal(result['--custom-b'],undefined);assert.equal(result['--custom-c'],'false')
})
test('malicious, cyclic, colliding and oversized tokens fail atomically',()=>{
    assert.throws(()=>flattenTheme(theme({custom:{a:'red;display:none'}}),'light'))
    assert.throws(()=>flattenTheme(theme({custom:{a:'url(https://example.com)'}}),'light'))
    assert.throws(()=>flattenTheme(theme({custom:{fontSize:1,'font-size':2}}),'light'))
    const cyclic:Record<string,unknown>={};cyclic.a=cyclic
    assert.throws(()=>flattenTheme(theme({custom:cyclic}),'light'))
    assert.throws(()=>flattenTheme({schemaVersion:'1.0',name:'bad',tokens:{}},'light'))
    assert.throws(()=>flattenTheme(theme({custom:Object.fromEntries(Array.from({length:4097},(_,i)=>['t'+i,i]))}),'light'))
})
