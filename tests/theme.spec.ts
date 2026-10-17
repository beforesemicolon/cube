import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cubeTheme, flattenTheme } from '../components/theme/tokens.js'
import { messages } from '../components/locales/index.js'
const theme = (tokens: Record<string,unknown>)=>({schemaVersion:'1.0',name:'test',tokens:{color:{primary:'red'},...tokens}})
test('default themes match site-builder mode-aware contract',()=>{
    const light=flattenTheme(cubeTheme,'light'), dark=flattenTheme(cubeTheme,'dark')
    assert.equal(light['--color-primary'],'#2563EB');assert.equal(dark['--color-primary'],'#83B6FF')
    assert.equal(Object.keys(light).length,Object.keys(dark).length)
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
test('localized labels fall back safely and caller overrides win',()=>{
    assert.equal(messages('pt-BR',{play:'Ouvir'}).play,'Ouvir')
    assert.equal(messages('xx',{play:null} as any).play,'Play')
    assert.equal(messages('en',{play:''}).play,'Play')
})

test('all supported component locales provide translated media and chart labels', () => {
    for (const locale of ['pt-PT', 'es-ES', 'fr-FR', 'zh-CN']) {
        assert.notEqual(messages(locale, {}).play, messages('en', {}).play)
        assert.notEqual(messages(locale, {}).chart, messages('en', {}).chart)
    }
})
