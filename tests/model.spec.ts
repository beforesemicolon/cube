import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cartesianModel, pieModel, type ChartSkin } from '../components/charts/model.js'
const skin: ChartSkin = { palette: ['red','blue','green'], text:'black',muted:'gray',border:'silver',surface:'white',font:'sans-serif',fontSize:12,reducedMotion:true }
test('empty props produce empty charts without fabricated points', () => {
    assert.equal(cartesianModel({},skin).empty,true); assert.equal(pieModel({},skin).empty,true)
    assert.deepEqual(cartesianModel({},skin).issues,[])
})
test('zero and null remain distinct and data is not mutated', () => {
    const data = Object.freeze([0,null,4]); const series = [{id:'a',data:[...data]}]
    const result = cartesianModel({series},skin)
    assert.deepEqual(result.points.map(p=>p.y),[0,null,4]); assert.equal(result.empty,false)
    assert.deepEqual(series[0].data,data)
})
test('visibility follows stable ids and preserves linked error ranges', () => {
    const input = {series:[{id:'a',data:[2]},{id:'e',type:'errorbar' as const,linkedTo:'a',data:[{x:0,low:1,high:3}]},{id:'b',data:[4]}]}
    const result = cartesianModel(input,skin,new Set(['b']))
    assert.deepEqual(result.points.map(p=>p.seriesId),['b']); assert.equal(result.legend.length,2)
    assert.equal(cartesianModel(input,skin,new Set()).noMatch,true)
})
test('unsupported series and invalid numeric values are recoverable', () => {
    const result = cartesianModel({series:[{id:'a',data:[NaN,Infinity,2]},{id:'a',data:[1]}]},skin)
    assert.equal(result.issues.length,3); assert.equal(result.points[2].y,2)
})
test('dual axes, inversion, stacking, scatter and bubbles map independently', () => {
    const result = cartesianModel({inverted:true,stacking:'normal',yAxis:[{id:'one'},{id:'two'}],series:[{type:'column',data:[2]},{type:'area',data:[3],yAxis:'two'},{type:'bubble',data:[{x:1,y:2,size:25}]}]},skin)
    const s = result.option.series as Array<Record<string,any>>
    assert.equal(s[0].type,'bar'); assert.equal(s[0].stack,'stack-0'); assert.equal(s[1].xAxisIndex,1)
    assert.equal(s[2].symbolSize([2,1,25]),10); assert.deepEqual(s[0].data[0],[2,0,null])
})
test('time axes parse dates, logarithmic axes reject nonpositive values', () => {
    const result = cartesianModel({xAxis:{type:'datetime'},yAxis:{type:'logarithmic'},series:[{data:[{x:'2026-01-01',y:-1},{x:'2026-01-02',y:10}]}]},skin)
    assert.equal(result.points[0].y,null); assert.equal(typeof result.points[1].x,'number')
    assert.equal(result.issues.length,1)
})
test('thresholds and errorbar custom renderer are separate primitives', () => {
    const r = cartesianModel({series:[{id:'base',data:[3]},{id:'range',type:'errorbar',linkedTo:'base',data:[{low:1,high:5}]},{id:'threshold',type:'y-threshold',value:4}]},skin)
    const s = r.option.series as Array<Record<string,any>>
    const drawing = s[1].renderItem({}, {value:(i:number)=>[0,1,5][i],coord:(v:number[])=>v})
    assert.equal(drawing.children.length,3); assert.equal(s[2].markLine.data[0].yAxis,4)
})
test('all-zero pie is empty rather than misleading equal wedges', () => {
    const r=pieModel({series:{data:[{id:'a',value:0},{id:'b',value:0}]}},skin)
    assert.equal(r.empty,true); assert.equal((r.option.series as any[])[0].stillShowZeroSum,false)
})
test('pie values reject negatives/nonfinite and percentages use visible denominator', () => {
    const r=pieModel({variant:'donut',series:{data:[{id:'a',value:3},{id:'b',value:1},{id:'bad',value:-2},{id:'nan',value:NaN}]}},skin,new Set(['a']))
    assert.equal(r.points[0].percentage,100); assert.equal(r.issues.length,2)
    assert.deepEqual((r.option.series as any[])[0].radius,['52%','78%'])
})
test('very large pie values do not overflow percentage calculation', () => {
    const r=pieModel({series:{data:[{id:'a',value:1e308},{id:'b',value:1e308}]}},skin)
    assert.deepEqual(r.points.map(p=>p.percentage),[50,50])
})
test('reduced motion disables engine animation',()=>assert.equal(cartesianModel({},skin).option.animation,false))

test('unlinked thresholds remain visible after the component applies legend filtering', () => {
    const r=cartesianModel({series:[{id:'a',data:[2]},{id:'limit',type:'y-threshold',value:3}]},skin,new Set(['a']))
    assert.equal((r.option.series as any[]).length,2)
})
test('forward links resolve to their parent and invalid links stay recoverable', () => {
    const input={series:[{id:'range',linkedTo:'base',type:'errorbar' as const,data:[{low:1,high:3}]},{id:'base',name:'',data:[2]},{id:'orphan',linkedTo:'absent',data:[4]}]}
    const r=cartesianModel(input,skin,new Set(['base','orphan']))
    assert.equal(r.points.length,3);assert.equal(r.legend[0].name,'base')
    assert.ok(r.issues.includes('invalid-link:orphan'))
})
