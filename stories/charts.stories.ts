import type { Meta,StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import { controlsFor, storyArgsFor, type StoryArgs } from './controls.js'
import { chartExamples } from './fixtures/chart-types.js'
import { exerciseChart } from './chart-interactions.js'
const chartText={accessibleLabel:'Chart',loadingText:'Loading chart',emptyText:'No data available.',noMatchText:'No visible data',errorText:'Unable to load chart.',retryLabel:'Retry',showAllLabel:'Show all',legendLabel:'Legend',tableLabel:'View data table',seriesLabel:'Series',categoryLabel:'Category',valueLabel:'Value',rangeLabel:'Range',sizeLabel:'Size',percentageLabel:'Percentage',missingText:'Not available',navigateLabel:'Explore chart',instructionsText:'Use arrow keys to explore data points. Press Enter to pin and Escape to unpin.',pinnedText:'Pinned',unpinLabel:'Unpin',zoomInLabel:'Zoom in',zoomOutLabel:'Zoom out',resetZoomLabel:'Reset zoom'}
const meta:Meta={
    title:'Charts',tags:['autodocs'],args:{...chartText,...chartExamples.line.props,height:320},
    parameters:{docs:{description:{component:'Cartesian, pie and donut visualizations share Cube controls, theme tokens, accessibility behavior and Apache ECharts rendering. Switch the appearance toolbar for light and dark; values, labels, axes, stacking and data remain editable in Controls.'}}},
    render:(args,c)=>preview('cb-cartesian-chart',args,c.globals.appearance),
}
export default meta
type Story=StoryObj
const play:Story['play']=async({canvasElement})=>exerciseChart(canvasElement)
const cartesianArgTypes=controlsFor('cb-cartesian-chart')
const pieArgTypes=controlsFor('cb-pie-chart')
function cartesian(args:StoryArgs,interactive=false):Story{return{args:storyArgsFor('cb-cartesian-chart',args),argTypes:cartesianArgTypes,...(interactive?{play}:{})}}

export const Bar:Story=cartesian({...chartExamples.bar.props},true)
export const Line:Story=cartesian({...chartExamples.line.props},true)
export const MixedLineAndBar:Story=cartesian({...chartExamples.mixed.props},true)
export const Area:Story=cartesian({...chartExamples.area.props},true)
export const Bubble:Story=cartesian({...chartExamples.bubble.props},true)
export const Scatter:Story=cartesian({...chartExamples.scatter.props},true)
export const HorizontalBar:Story=cartesian({...chartExamples.bar.props,inverted:true},true)
export const StackedArea:Story=cartesian({stacking:'normal',series:[{id:'desktop',name:'Desktop',type:'area',data:[12,20,17,18,25]},{id:'mobile',name:'Mobile',type:'area',data:[9,12,15,11,20]}]},true)
export const ZoomableMixed:Story=cartesian({...chartExamples.mixed.props,zoomable:true},true)
export const MissingValues:Story=cartesian({series:[{id:'visits',name:'Visits',type:'line',data:[12,20,null,18,25]}]},true)
export const ErrorRanges:Story=cartesian({series:[{id:'base',name:'Mean',data:[12,20,17,18,25]},{id:'range',name:'Range',type:'errorbar',linkedTo:'base',data:[{x:0,low:10,high:14},{x:1,low:18,high:23},{x:2,low:16,high:20}]}]},true)
export const Loading:Story=cartesian({status:'loading'})
export const Empty:Story=cartesian({series:[]})
export const NoMatch:Story=cartesian({visibleSeries:[]})
export const Error:Story=cartesian({status:'error'})
export const PatternedSeries:Story=cartesian({...chartExamples.mixed.props,patterns:true},true)

const renderPie:NonNullable<Story['render']>=(args,context)=>preview('cb-pie-chart',args,context.globals.appearance)
function pie(args:StoryArgs,interactive=false):Story{return{args:storyArgsFor('cb-pie-chart',args),argTypes:pieArgTypes,render:renderPie,...(interactive?{play}:{})}}
export const Pie:Story=pie({...chartExamples.pie.props},true)
export const Donut:Story=pie({...chartExamples.donut.props},true)
export const AllZero:Story=pie({series:{data:[{id:'a',name:'A',value:0},{id:'b',name:'B',value:0}]}})
export const Invalid:Story=pie({series:{data:[{id:'a',value:-2},{id:'b',value:NaN}]}})
export const ControlledFilter:Story=pie({visibleSegments:['direct','search']})
export const PatternedDonut:Story=pie({...chartExamples.donut.props,patterns:true},true)
