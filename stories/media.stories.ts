import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview, silentAudio } from './helpers.js'
const meta: Meta = { title:'Media/Players', tags:['autodocs'],
    args:{mediaTitle:'Studio recording',seekStep:10,locale:'en'},
    argTypes:{locale:{control:'select',options:['en','pt','es','fr','zh']},seekStep:{control:{type:'number',min:1,max:60}}},
    render:(args,context)=>preview('cb-audio-player',args,context.globals.appearance),
}
export default meta
type Story = StoryObj
export const EmptyAudio: Story = {}
export const Audio: Story = { render:(args,c)=>preview('cb-audio-player',{...args,src:silentAudio()},c.globals.appearance) }
export const Portuguese: Story = { ...Audio,args:{locale:'pt',mediaTitle:'Gravação do estúdio'} }
export const InvalidSource: Story = {args:{src:'javascript:alert(1)'}}
export const Video: Story = {render:(args,c)=>preview('cb-video-player',{...args,mediaTitle:'Studio film',poster:'/poster.svg'},c.globals.appearance)}
export const VideoWithCaptions: Story = {render:(args,c)=>preview('cb-video-player',{...args,poster:'/poster.svg',tracks:[{src:'/captions.vtt',language:'en',label:'English'}]},c.globals.appearance)}
