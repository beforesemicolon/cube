import type { Meta,StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import { chartExamples } from './fixtures/chart-types.js'
import { exerciseChart } from './chart-interactions.js'
const meta:Meta={
    title:'Charts',tags:['autodocs'],args:{...chartExamples.line.props,height:320,locale:'en'},
    argTypes:{locale:{control:'select',options:['en','pt','es','fr','zh']},height:{control:{type:'number',min:160,max:1200}},status:{control:'select',options:['finished','loading','error']},variant:{control:'select',options:['pie','donut']},inverted:{control:'boolean'},zoomable:{control:'boolean'},patterns:{control:'boolean'}},
    parameters:{docs:{description:{component:'Cartesian, pie and donut visualizations share Cube controls, theme tokens, accessibility behavior and Apache ECharts rendering. Switch the appearance toolbar for light and dark; values, labels, axes, stacking and data remain editable in Controls.'}}},
    render:(args,c)=>preview('cb-cartesian-chart',args,c.globals.appearance),
}
export default meta
type Story=StoryObj
const play:Story['play']=async({canvasElement})=>exerciseChart(canvasElement)
export const Bar:Story={args:chartExamples.bar.props,play}
export const Line:Story={args:chartExamples.line.props,play}
export const MixedLineAndBar:Story={args:chartExamples.mixed.props,play}
export const Area:Story={args:chartExamples.area.props,play}
export const Bubble:Story={args:chartExamples.bubble.props,play}
export const Scatter:Story={args:chartExamples.scatter.props,play}
export const HorizontalBar:Story={args:{...chartExamples.bar.props,inverted:true},play}
export const StackedArea:Story={args:{stacking:'normal',series:[{id:'desktop',name:'Desktop',type:'area',data:[12,20,17,18,25]},{id:'mobile',name:'Mobile',type:'area',data:[9,12,15,11,20]}]},play}
export const ZoomableMixed:Story={args:{...chartExamples.mixed.props,zoomable:true},play}
export const MissingValues:Story={args:{series:[{id:'visits',name:'Visits',type:'line',data:[12,20,null,18,25]}]},play}
export const ErrorRanges:Story={args:{series:[{id:'base',name:'Mean',data:[12,20,17,18,25]},{id:'range',name:'Range',type:'errorbar',linkedTo:'base',data:[{x:0,low:10,high:14},{x:1,low:18,high:23},{x:2,low:16,high:20}]}]},play}
export const Loading:Story={args:{status:'loading'}}
export const Empty:Story={args:{series:[]}}
export const NoMatch:Story={args:{visibleSeries:[]}}
export const Error:Story={args:{status:'error'}}
export const PatternedSeries:Story={args:{...chartExamples.mixed.props,patterns:true},play}

const renderPie:NonNullable<Story['render']>=(args,context)=>preview('cb-pie-chart',args,context.globals.appearance)
export const Pie:Story={args:chartExamples.pie.props,render:renderPie,play}
export const Donut:Story={args:chartExamples.donut.props,render:renderPie,play}
export const AllZero:Story={args:{series:{data:[{id:'a',name:'A',value:0},{id:'b',name:'B',value:0}]}},render:renderPie}
export const Invalid:Story={args:{series:{data:[{id:'a',value:-2},{id:'b',value:NaN}]}},render:renderPie}
export const ControlledFilter:Story={args:{visibleSegments:['direct','search']},render:renderPie}
export const PatternedDonut:Story={args:{...chartExamples.donut.props,patterns:true},render:renderPie,play}
