import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
const meta: Meta = {title:'Charts/PieChart',tags:['autodocs'],args:{heading:'Traffic sources',description:'Illustrative data',series:{data:[{id:'direct',name:'Direct',value:48},{id:'search',name:'Search',value:32},{id:'social',name:'Social',value:20}]}},render:(args,c)=>preview('cb-pie-chart',args,c.globals.appearance)}
export default meta
type Story = StoryObj
export const Pie: Story = {}
export const Donut: Story = {args:{variant:'donut',innerTitle:'100',innerDescription:'Total visits'}}
export const AllZero: Story = {args:{series:{data:[{id:'a',name:'A',value:0},{id:'b',name:'B',value:0}]}}}
export const Invalid: Story = {args:{series:{data:[{id:'a',value:-2},{id:'b',value:NaN}]}}}
export const ControlledFilter: Story = {args:{visibleSegments:['direct','search']}}
