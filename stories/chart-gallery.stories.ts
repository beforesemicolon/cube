import type { Meta,StoryObj } from '@storybook/web-components-vite'
import { chartExamples } from './fixtures/chart-types.js'
import '../components/client.js'
const meta:Meta={title:'Examples/All eight chart types',parameters:{layout:'fullscreen'}}
export default meta
export const Gallery:StoryObj={render:(_args,c)=>{
    const provider=document.createElement('cb-theme-provider');Object.assign(provider,{appearance:c.globals.appearance})
    const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));gap:24px;padding:24px;background:var(--color-background);color:var(--color-foreground)'
    for(const example of Object.values(chartExamples)){const chart=document.createElement(example.tag);Object.assign(chart,example.props);grid.append(chart)}provider.append(grid);return provider
}}
