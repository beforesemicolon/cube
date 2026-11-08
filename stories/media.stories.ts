import type { Meta,StoryObj } from '@storybook/web-components-vite'
import { expect,userEvent,waitFor } from 'storybook/test'
import { preview,silentAudio } from './helpers.js'
import { controlsFor, storyArgsFor, type StoryArgs } from './controls.js'
const mediaText={playLabel:'Play',pauseLabel:'Pause',stopLabel:'Stop',backwardLabel:'Seek backward',forwardLabel:'Seek forward',seekLabel:'Seek',volumeLabel:'Volume',muteLabel:'Mute',unmuteLabel:'Unmute',rateLabel:'Playback speed',captionsLabel:'Captions',captionsOffLabel:'Captions off',fullscreenLabel:'Enter fullscreen',exitFullscreenLabel:'Exit fullscreen',emptyText:'No media source.',errorText:'Unable to play this media.',bufferingText:'Buffering',liveText:'Live'}
const meta:Meta={title:'Media',tags:['autodocs'],args:storyArgsFor('cb-audio-player',{...mediaText,mediaTitle:'Studio recording',seekStep:10}),argTypes:controlsFor('cb-audio-player'),parameters:{docs:{description:{component:'Transport buttons are cb-button; timeline and volume are cb-slider; speed and captions are cb-select. Native audio/video elements retain playback state. All visible and accessible text is supplied by the application. Themes and CSS parts are inherited. The video example uses an original four-second offline clip with finite seekable duration.'}}},render:args=>preview('cb-audio-player',args)}
export default meta
type Story=StoryObj
export const Image:Story={render:args=>preview('cb-image',{...args,src:'/poster.svg',alt:'Cube media preview',variant:'thumbnail',size:'md',fallbackIcon:'image',loadingLabel:'Loading image',errorLabel:'Image unavailable'})}
export const EmptyAudio:Story={}
export const Audio:Story={render:args=>preview('cb-audio-player',{...args,src:silentAudio(8)}),play:async({canvasElement})=>{
    const host=canvasElement.querySelector('cb-audio-player')! as HTMLElement,media=host.shadowRoot!.querySelector('audio')!
    await waitFor(()=>expect(media.readyState).toBeGreaterThan(0),{timeout:10000})
    const play=host.shadowRoot!.querySelector('[part=play]')!.shadowRoot!.querySelector('button')!
    await userEvent.click(play);await waitFor(()=>expect(media.paused).toBe(false))
    const stop=host.shadowRoot!.querySelector('[part=stop]')!.shadowRoot!.querySelector('button')!
    await userEvent.click(stop);await expect(media.paused).toBe(true);host.dataset.storyReady='true'
}}
export const TranslatedCopy:Story={...Audio,args:{mediaTitle:'Gravação do estúdio',playLabel:'Ouvir',pauseLabel:'Pausar',stopLabel:'Parar',backwardLabel:'Recuar',forwardLabel:'Avançar',seekLabel:'Procurar',volumeLabel:'Volume',muteLabel:'Silenciar',unmuteLabel:'Ativar som',rateLabel:'Velocidade',emptyText:'Nenhuma fonte multimédia.',errorText:'Não foi possível reproduzir o conteúdo.',bufferingText:'A carregar',liveText:'Ao vivo'}}
export const InvalidSource:Story={args:{src:'javascript:alert(1)'}}
function video(args:StoryArgs,captions=false){
    return preview('cb-video-player',{...args,mediaTitle:'Studio film',src:'/fixtures/studio.webm',poster:'/poster.svg',...(captions?{tracks:[{src:'/captions.vtt',language:'en',label:'English'}]}:{})})
}
export const Video:Story={render:args=>video(args),play:async({canvasElement})=>{
    const host=canvasElement.querySelector('cb-video-player')! as HTMLElement,media=host.shadowRoot!.querySelector('video')!
    await waitFor(()=>expect(media.readyState).toBeGreaterThan(0),{timeout:15000})
    await expect(media.duration).toBe(4)
    const play=host.shadowRoot!.querySelector('[part=play]')!.shadowRoot!.querySelector('button')!;await userEvent.click(play)
    await waitFor(()=>expect(media.paused).toBe(false))
    await userEvent.click(host.shadowRoot!.querySelector('[part=stop]')!.shadowRoot!.querySelector('button')!)
    await expect(media.paused).toBe(true);host.dataset.storyReady='true'
}}
export const VideoWithCaptions:Story={render:args=>video(args,true)}
export const EmptyVideo:Story={render:args=>preview('cb-video-player',{...args,poster:'/poster.svg'})}
