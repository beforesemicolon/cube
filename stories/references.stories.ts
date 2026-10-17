import type {Meta,StoryObj} from '@storybook/web-components-vite'
const meta:Meta={title:'Design references/Uploaded sheets',parameters:{layout:'fullscreen'},render:args=>{const frame=document.createElement('div');frame.style.cssText='max-height:95vh;overflow:auto;padding:16px';const image=document.createElement('img');image.src='/figma-layers/Studio/'+String(args.path).split('/').map(encodeURIComponent).join('/');image.alt=String(args.description);image.style.cssText='display:block;width:100%;height:auto';frame.append(image);return frame}}
export default meta
export const Actions:StoryObj={args:{path:'01/Actions.png',description:'Uploaded action component dimensions, states and appearances'}}
export const Inputs:StoryObj={args:{path:'02/Inputs.png',description:'Uploaded input component dimensions, states and appearances'}}
export const ColorAndStyle:StoryObj={args:{path:'03/Color & style.png',description:'Uploaded color and style component reference'}}
