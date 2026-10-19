import { commonCSS,el,label,sheet } from '../core/dom.js'
import { text,bool } from '../core/value.js'
import { token as v } from '../theme/tokens.js'
import { createIconButton,actionLabel } from '../action/create.js'
import type { Slider } from '../form/slider/index.js'
import type { Select } from '../form/select/index.js'
import '../form/slider/index.js'
import '../form/select/index.js'
import '../icons/registry.js'
import type { MediaBase } from './MediaBase.js'
import { clock,type PlaybackState } from './controller.js'

/** Composition only: transport, sliders and selectors are the same Cube controls used elsewhere. */
export function mediaView(owner:MediaBase,kind:'audio'|'video'){
    const root=document.createDocumentFragment(),group=el('section','player'),media=el(kind,'media')
    const title=el('div','title'),controls=el('div','controls'),transport=el('div','transport'),settings=el('div','settings'),timeline=el('div','timeline'),status=el('p','status')
    group.setAttribute('role','group');status.setAttribute('role','status')
    const play=createIconButton('play','play',()=>{if(media.paused)void owner.play();else owner.pause()});play.variant='primary'
    const stop=createIconButton('stop','stop',()=>owner.stop()),backward=createIconButton('backward','backward',()=>owner.backward()),forward=createIconButton('forward','forward',()=>owner.forward())
    const mute=createIconButton('mute','volume',()=>owner.setMuted(!media.muted)),fullscreen=createIconButton('fullscreen','fullscreen',()=>void owner.fullscreen())
    const seek=document.createElement('cb-slider') as Slider;seek.setAttribute('part','seek');seek.setAttribute('exportparts','control:seek-control');Object.assign(seek,{step:.1,min:0,max:0,value:0})
    const volume=document.createElement('cb-slider') as Slider;volume.setAttribute('part','volume');volume.setAttribute('exportparts','control:volume-control');Object.assign(volume,{min:0,max:1,step:.05,value:1})
    const rate=document.createElement('cb-select') as Select, captions=document.createElement('cb-select') as Select
    rate.setAttribute('part','rate');rate.setAttribute('exportparts','control:rate-control');captions.setAttribute('part','captions');captions.setAttribute('exportparts','control:captions-control')
    const time=el('output','time');time.setAttribute('aria-live','off')
    seek.addEventListener('cb-change',event=>{event.stopPropagation();owner.seek(Number((event as CustomEvent).detail.value))})
    volume.addEventListener('cb-change',event=>{event.stopPropagation();owner.setVolume(Number((event as CustomEvent).detail.value))})
    rate.addEventListener('cb-change',event=>{event.stopPropagation();owner.setRate(Number((event as CustomEvent).detail.value))})
    captions.addEventListener('cb-change',event=>{event.stopPropagation();Array.from(media.textTracks).forEach((track,i)=>track.mode=i===Number((event as CustomEvent).detail.value)?'showing':'disabled')})
    transport.append(backward,play,stop,forward);settings.append(mute,volume,rate)
    if(kind==='video')settings.append(captions,fullscreen)
    timeline.append(seek,time);controls.append(transport,settings)
    const transcript=el('slot','transcript');transcript.name='transcript'
    group.append(title,media,timeline,controls,status,transcript)
    root.append(sheet(commonCSS+`
[part=player]{background:${v('--color-surface')};border:1px solid ${v('--color-separator')};border-radius:${v('--radius-md')};padding:${v('--spacing-md')}}
[part=title]{font-weight:600;font-size:var(--component-title-font-size,14px);margin-block-end:${v('--spacing-sm')}}
video{display:block;inline-size:100%;aspect-ratio:${v('--component-media-aspect-ratio')};background:${v('--color-background')};object-fit:contain;border-radius:${v('--radius-sm')}}
audio{display:none}
[part=timeline]{display:flex;align-items:center;gap:${v('--spacing-md')};margin-block:${v('--spacing-sm')}}
[part=seek]{flex:1;min-inline-size:0}
[part=time]{flex:none;font:var(--component-caption-font-size,11px)/1.4 ${v('--typography-mono-font-family')};color:${v('--color-muted-foreground')}}
[part=controls],[part=transport],[part=settings]{display:flex;align-items:center;gap:${v('--spacing-xs')};flex-wrap:wrap}
[part=controls]{justify-content:space-between;gap:${v('--spacing-sm')}}
[part=volume]{inline-size:var(--component-media-volume-width,72px);min-inline-size:0;margin-inline-end:${v('--spacing-xs')}}
[part=rate]{inline-size:var(--component-media-rate-width,72px)}
[part=captions]{max-inline-size:var(--component-media-captions-width,128px)}
[part=status]{margin-block-start:${v('--spacing-sm')}}
:host(:fullscreen){background:${v('--color-background')};display:block;inline-size:100vw;block-size:100vh;overflow:hidden}
:host(:fullscreen) [part=player]{display:grid;grid-template-rows:max-content minmax(0,1fr) max-content max-content max-content max-content;inline-size:100%;block-size:100%;border:0;border-radius:0;padding:0;overflow:hidden}
:host(:fullscreen) video{inline-size:100%;block-size:100%;min-block-size:0;aspect-ratio:auto;border-radius:0;background:${v('--component-media-fullscreen-background')};object-fit:var(--component-media-fullscreen-fit,contain)}
:host(:fullscreen) [part=title]{padding:${v('--spacing-md')} ${v('--spacing-md')} 0;margin:0}
:host(:fullscreen) [part=timeline]{padding-inline:${v('--spacing-md')}}
:host(:fullscreen) [part=controls]{padding:0 ${v('--spacing-md')} ${v('--spacing-md')}}
:host(:fullscreen) [part=status]{padding-inline:${v('--spacing-md')}}
@container(max-width:360px){[part=timeline]{gap:${v('--spacing-sm')}}[part=settings]{flex:1;justify-content:flex-end}[part=volume]{inline-size:var(--component-media-volume-compact-width,48px)}}
`),group)
    let captionKey='', rateReady = false
    return {root,media,update(state:PlaybackState){
        const source=!!media.getAttribute('src'), accessibleName=text(owner.accessibleLabel)||text(owner.mediaTitle)
        label(group,accessibleName);label(media,accessibleName);title.textContent=text(owner.mediaTitle);title.hidden=!title.textContent
        actionLabel(play,state.paused?owner.playLabel:owner.pauseLabel);play.icon=state.paused?'play':'pause';actionLabel(stop,owner.stopLabel);actionLabel(backward,owner.backwardLabel);actionLabel(forward,owner.forwardLabel)
        actionLabel(mute,state.muted?owner.unmuteLabel:owner.muteLabel);mute.icon=state.muted?'muted':'volume'
        actionLabel(fullscreen,document.fullscreenElement===owner?owner.exitFullscreenLabel:owner.fullscreenLabel);fullscreen.hidden=kind!=='video'||!document.fullscreenEnabled||!owner.requestFullscreen
        for(const control of [play,stop])if(bool(control.disabled)!==!source)control.disabled=!source
        const noSeek=state.seekEnd<=state.seekStart||!source
        for(const control of [backward,forward,seek])if(bool(control.disabled)!==noSeek)control.disabled=noSeek
        Object.assign(seek,{accessibleLabel:owner.seekLabel,min:state.seekStart,max:Math.max(state.seekStart,state.seekEnd),valueText:`${clock(state.position)} / ${Number.isFinite(state.duration)?clock(state.duration):owner.liveText}`})
        if(!seek.interacting)seek.value=state.position
        volume.accessibleLabel=owner.volumeLabel;if(!volume.interacting)volume.value=state.volume
        rate.accessibleLabel=owner.rateLabel;captions.accessibleLabel=owner.captionsLabel
        if(!rateReady){rateReady=true;rate.options=[.5,.75,1,1.25,1.5,2].map(value=>({value:String(value),label:`${String(value)}×`}))}
        rate.value=String(state.rate)
        time.textContent=`${clock(state.position)} / ${Number.isFinite(state.duration)?clock(state.duration):state.duration===Infinity?owner.liveText:'0:00'}`
        status.textContent=owner.hasPlaybackError||state.error?owner.errorText:!source?owner.emptyText:state.buffering?owner.bufferingText:'';status.hidden=!status.textContent
        const tracks=Array.from(media.querySelectorAll('track')),key=JSON.stringify([owner.captionsOffLabel,tracks.map(t=>[t.src,t.srclang,t.label])])
        if(key!==captionKey){captionKey=key;captions.options=[{value:'-1',label:owner.captionsOffLabel},...tracks.map((track,i)=>({value:String(i),label:track.label||track.srclang}))]}
        captions.value=String(Array.from(media.textTracks).findIndex(t=>t.mode==='showing'));captions.hidden=!tracks.length
    }}
}
