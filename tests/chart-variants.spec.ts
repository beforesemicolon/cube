import {test} from 'node:test'
import assert from 'node:assert/strict'
import {cartesianModel,pieModel,type ChartSkin,type CartesianOptions} from '../components/charts/model.js'
import {chartExamples} from '../stories/fixtures/chart-types.js'
const skin:ChartSkin={palette:['#2563EB','#08764F','#855700'],text:'#20262B',muted:'#606B73',border:'#DAE0E4',surface:'#FFFFFF',font:'Inter',fontSize:12,reducedMotion:true}
for(const type of ['bar','line','mixed','area','bubble','scatter'] as const)test(`${type} uses the shared Cartesian model with the intended ECharts series`,()=>{
    const model=cartesianModel(chartExamples[type].props as CartesianOptions,skin),series=model.option.series as Array<Record<string,unknown>>
    assert.deepEqual(model.issues,[]);assert.equal(model.empty,false);assert.ok(model.points.length>0)
    if(type==='mixed')assert.deepEqual(series.map(s=>s.type),['bar','line'])
    else assert.equal(series[0].type,type==='area'?'line':type==='bubble'?'scatter':type)
    if(type==='area')assert.ok(series[0].areaStyle)
    if(type==='bubble'){const size=series[0].symbolSize as (d:number[])=>number;assert.ok(size([1,2,256])>size([1,2,16]));assert.equal(size([1,2,0]),0)}
})
for(const type of ['pie','donut'] as const)test(`${type} is a variant of the same pie model`,()=>{
    const model=pieModel(chartExamples[type].props,skin),series=model.option.series as Array<Record<string,unknown>>
    assert.equal(series[0].type,'pie');assert.deepEqual(series[0].radius,type==='donut'?['52%','78%']:['0%','78%']);assert.equal(model.points.length,3);assert.equal(Math.round(model.points.reduce((sum,p)=>sum+(p.percentage??0),0)),100)
})
test('all chart options use theme colors and honor reduced-motion instead of their own theme',()=>{
    const model=cartesianModel(chartExamples.mixed.props,{...skin,reducedMotion:false,motionDuration:120})
    assert.deepEqual(model.option.color,skin.palette);assert.equal(model.option.animationDuration,120);assert.equal(model.option.animationDurationUpdate,120)
    assert.equal(cartesianModel(chartExamples.bar.props,skin).option.animation,false)
})
