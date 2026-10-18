import type { Meta,StoryObj } from '@storybook/web-components-vite'
import { expect,userEvent,waitFor } from 'storybook/test'
import { preview,silentAudio } from './helpers.js'
import { controlsFor, storyArgsFor } from './controls.js'
const meta:Meta={title:'Media',tags:['autodocs'],args:storyArgsFor('cb-audio-player',{mediaTitle:'Studio recording',seekStep:10,locale:'en'}),argTypes:controlsFor('cb-audio-player'),parameters:{docs:{description:{component:'Transport buttons are cb-icon-button; timeline and volume are cb-slider; speed and captions are cb-select. Native audio/video elements retain playback state. Themes and CSS parts are inherited. The video example uses an original four-second offline clip with finite seekable duration.'}}},render:(args,c)=>preview('cb-audio-player',args,c.globals.appearance)}
export default meta
type Story=StoryObj
export const EmptyAudio:Story={}
export const Audio:Story={render:(args,c)=>preview('cb-audio-player',{...args,src:silentAudio(8)},c.globals.appearance),play:async({canvasElement})=>{
    const host=canvasElement.querySelector('cb-audio-player')! as HTMLElement,media=host.shadowRoot!.querySelector('audio')!
    await waitFor(()=>expect(media.readyState).toBeGreaterThan(0),{timeout:10000})
    const play=host.shadowRoot!.querySelector('[part=play]')!.shadowRoot!.querySelector('button')!
    await userEvent.click(play);await waitFor(()=>expect(media.paused).toBe(false))
    const stop=host.shadowRoot!.querySelector('[part=stop]')!.shadowRoot!.querySelector('button')!
    await userEvent.click(stop);await expect(media.paused).toBe(true);host.dataset.storyReady='true'
}}
export const Portuguese:Story={...Audio,args:{locale:'pt',mediaTitle:'Gravação do estúdio'}}
export const InvalidSource:Story={args:{src:'javascript:alert(1)'}}
function video(args:Record<string,unknown>,appearance:string,captions=false){
    return preview('cb-video-player',{...args,mediaTitle:'Studio film',src:'/fixtures/studio.webm',poster:'/poster.svg',...(captions?{tracks:[{src:'/captions.vtt',language:'en',label:'English'}]}:{})},appearance)
}
export const Video:Story={render:(args,c)=>video(args,c.globals.appearance),play:async({canvasElement})=>{
    const host=canvasElement.querySelector('cb-video-player')! as HTMLElement,media=host.shadowRoot!.querySelector('video')!
    await waitFor(()=>expect(media.readyState).toBeGreaterThan(0),{timeout:15000})
    await expect(media.duration).toBe(4)
    const play=host.shadowRoot!.querySelector('[part=play]')!.shadowRoot!.querySelector('button')!;await userEvent.click(play)
    await waitFor(()=>expect(media.paused).toBe(false))
    await userEvent.click(host.shadowRoot!.querySelector('[part=stop]')!.shadowRoot!.querySelector('button')!)
    await expect(media.paused).toBe(true);host.dataset.storyReady='true'
}}
export const VideoWithCaptions:Story={render:(args,c)=>video(args,c.globals.appearance,true)}
export const EmptyVideo:Story={render:(args,c)=>preview('cb-video-player',{...args,poster:'/poster.svg'},c.globals.appearance)}
