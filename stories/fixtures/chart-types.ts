import type { CartesianOptions,PieOptions } from '../../components/charts/model.js'
const xAxis={type:'category' as const,categories:['Mon','Tue','Wed','Thu','Fri']}
const traffic={data:[{id:'direct',name:'Direct',value:48},{id:'search',name:'Search',value:32},{id:'social',name:'Social',value:20}]}
export const chartExamples={
    bar:{tag:'cb-cartesian-chart',props:{heading:'Requests by day',description:'Illustrative data',xAxis,series:[{id:'requests',name:'Requests',type:'bar',data:[12,20,17,18,25]}]}},
    line:{tag:'cb-cartesian-chart',props:{heading:'Daily activity',description:'Illustrative data',xAxis,series:[{id:'visits',name:'Visits',type:'line',data:[12,20,17,18,25]}]}},
    mixed:{tag:'cb-cartesian-chart',props:{heading:'Actual and target',description:'Illustrative data',xAxis,series:[{id:'actual',name:'Actual',type:'bar',data:[12,18,15,22,25]},{id:'target',name:'Target',type:'line',data:[15,17,19,21,23]}]}},
    area:{tag:'cb-cartesian-chart',props:{heading:'Usage over time',description:'Illustrative data',xAxis,series:[{id:'usage',name:'Usage',type:'area',data:[12,20,17,18,25]}]}},
    bubble:{tag:'cb-cartesian-chart',props:{heading:'Reach, engagement and audience',description:'Bubble area represents audience size. Illustrative data.',xAxis:{type:'linear',title:'Reach'},yAxis:{type:'linear',title:'Engagement'},series:[{id:'campaigns',name:'Campaigns',type:'bubble',data:[{x:1,y:2,size:16},{x:3,y:7,size:81},{x:5,y:4,size:256},{x:7,y:9,size:144}]}]}},
    scatter:{tag:'cb-cartesian-chart',props:{heading:'Response time and throughput',description:'Illustrative data',xAxis:{type:'linear',title:'Response time'},yAxis:{type:'linear',title:'Throughput'},series:[{id:'samples',name:'Samples',type:'scatter',data:[{x:1,y:2},{x:3,y:7},{x:5,y:4},{x:7,y:9},{x:8,y:6}]}]}},
    pie:{tag:'cb-pie-chart',props:{heading:'Traffic sources',description:'Illustrative data',variant:'pie',series:traffic}},
    donut:{tag:'cb-pie-chart',props:{heading:'Traffic sources',description:'Illustrative data',variant:'donut',innerTitle:'100',innerDescription:'Total visits',series:traffic}},
} satisfies Record<string,{tag:string;props:(CartesianOptions|PieOptions)&{heading:string;description:string}}>
export type ChartExampleName=keyof typeof chartExamples
