import type { Meta,StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import { chartExamples } from './fixtures/chart-types.js'
import { exerciseChart } from './chart-interactions.js'
const meta:Meta={title:'Charts/PieChart',tags:['autodocs'],args:{...chartExamples.pie.props,locale:'en'},argTypes:{variant:{control:'select',options:['pie','donut']},locale:{control:'select',options:['en','pt','es','fr','zh']}},parameters:{docs:{description:{component:'Pie and donut are variants of one component, not separate plotting implementations. Segment controls are Cube toggle buttons, with keyboard exploration and an accessible data table.'}}},render:(args,c)=>preview('cb-pie-chart',args,c.globals.appearance)}
export default meta
type Story=StoryObj
const play:Story['play']=async({canvasElement})=>exerciseChart(canvasElement)
export const Pie:Story={args:chartExamples.pie.props,play}
export const Donut:Story={args:chartExamples.donut.props,play}
export const AllZero:Story={args:{series:{data:[{id:'a',name:'A',value:0},{id:'b',name:'B',value:0}]}}}
export const Invalid:Story={args:{series:{data:[{id:'a',value:-2},{id:'b',value:NaN}]}}}
export const ControlledFilter:Story={args:{visibleSegments:['direct','search']}}
