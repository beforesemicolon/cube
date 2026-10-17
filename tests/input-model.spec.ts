import {test} from 'node:test'
import assert from 'node:assert/strict'
import {normalizeRange,normalizeOptions} from '../components/inputs/model.js'
test('shared slider normalization handles missing, invalid, reversed and finite bounds',()=>{assert.deepEqual(normalizeRange({}),{min:0,max:100,step:1,value:0,percent:0});assert.equal(normalizeRange({min:10,max:0,value:5}).value,10);assert.equal(normalizeRange({min:0,max:1,step:.1,value:.34}).value,.3);assert.equal(normalizeRange({value:Infinity}).value,0);assert.equal(normalizeRange({min:5,max:5}).percent,0)})
test('continuous ranges preserve precision and invalid steps fall back safely',()=>{assert.equal(normalizeRange({min:0,max:1,step:'any',value:.3456}).value,.3456);assert.equal(normalizeRange({step:0}).step,1);assert.equal(normalizeRange({step:-1}).step,1)})
test('shared select options normalize malformed or duplicate input without inventing rows',()=>{assert.deepEqual(normalizeOptions(null),[]);assert.deepEqual(normalizeOptions([null,12,{},false]),[]);assert.deepEqual(normalizeOptions(['A','A',{value:'B',label:'Bee',disabled:true}]),[{value:'A',label:'A',disabled:false,group:''},{value:'B',label:'Bee',disabled:true,group:''}])})

test('select values preserve scalar identities instead of replacing numeric IDs with labels',()=>{assert.deepEqual(normalizeOptions([{value:1,label:'Normal'},{value:2,label:'Double'}]).map(o=>o.value),['1','2'])})
