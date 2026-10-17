import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
const meta: Meta = {title:'Charts/CartesianChart',tags:['autodocs'],args:{heading:'Weekly activity',description:'Illustrative data',xAxis:{type:'category',categories:['Mon','Tue','Wed','Thu','Fri']},series:[{id:'visits',name:'Visits',type:'line',data:[12,20,17,null,25]}],height:320},render:(args,c)=>preview('cb-cartesian-chart',args,c.globals.appearance)}
export default meta
type Story = StoryObj
export const Line: Story = {}
export const Mixed: Story = {args:{series:[{id:'one',name:'Actual',type:'column',data:[12,18,15,22,25]},{id:'two',name:'Target',type:'spline',data:[15,17,19,21,23]},{id:'max',name:'Capacity',type:'y-threshold',value:24}],zoomable:true}}
export const Stacked: Story = {args:{stacking:'normal',series:[{id:'desktop',name:'Desktop',type:'area',data:[12,20,17,18,25]},{id:'mobile',name:'Mobile',type:'area',data:[9,12,15,11,20]}]}}
export const Horizontal: Story = {args:{inverted:true,series:[{id:'one',name:'Requests',type:'bar',data:[12,20,17,18,25]}]}}
export const Bubble: Story = {args:{xAxis:{type:'linear'},series:[{id:'items',name:'Items',type:'bubble',data:[{x:1,y:2,size:40},{x:3,y:7,size:80},{x:5,y:4,size:16}]}]}}
export const ErrorRanges: Story = {args:{series:[{id:'base',name:'Mean',data:[12,20,17,18,25]},{id:'range',name:'Range',type:'errorbar',linkedTo:'base',data:[{x:0,low:10,high:14},{x:1,low:18,high:23},{x:2,low:16,high:20}]}]}}
export const Loading: Story = {args:{status:'loading'}}
export const Empty: Story = {args:{series:[]}}
export const NoMatch: Story = {args:{visibleSeries:[]}}
export const Error: Story = {args:{status:'error'}}
