import type { Meta,StoryObj } from '@storybook/web-components-vite'
import { chartExamples } from './fixtures/chart-types.js'
import './setup.js'
const meta:Meta={title:'Examples',parameters:{layout:'fullscreen'}}
export default meta
export const AllEightChartTypes:StoryObj={name:'All eight chart types',render:()=>{
    const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));gap:24px;padding:24px;background:var(--color-background);color:var(--color-foreground)'
    for(const example of Object.values(chartExamples)){const chart=document.createElement(example.tag);Object.assign(chart,example.props);grid.append(chart)}return grid
}}
