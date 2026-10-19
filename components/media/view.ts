import { html, repeat, state, type Template } from '../core/runtime.js';
import { commonCSS } from '../theme/styles.js';
import { bool, text, mediaURL } from '../core/value.js';
import { token as v } from '../theme/tokens.js';
import type { MediaBase } from './MediaBase.js';
import { clock, type PlaybackState } from './controller.js';
const css=commonCSS+`
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
`;
/** Native playback remains a side effect; all player presentation is reactive markup. */
export function mediaView(owner:MediaBase,kind:'audio'|'video') {
    const playback=state<PlaybackState>({position:0,duration:NaN,paused:true,ended:false,volume:1,muted:false,rate:1,buffering:false,error:null,seekStart:0,seekEnd:0});
    const fullscreen=state(false);
    const accessibleName=():string=>text(owner.accessibleLabel)||text(owner.mediaTitle);
    const source=():boolean=>Boolean(mediaURL(owner.src,owner.baseURI));
    const noSeek=():boolean=>!source()||playback[0]().seekEnd<=playback[0]().seekStart;
    const timeText=():string=>`${clock(playback[0]().position)} / ${Number.isFinite(playback[0]().duration)?clock(playback[0]().duration):playback[0]().duration===Infinity?owner.liveText:'0:00'}`;
    const status=():string=>owner.hasPlaybackError||playback[0]().error?owner.errorText:!source()?owner.emptyText:playback[0]().buffering?owner.bufferingText:'';
    const action=(part:string,icon:()=>string,label:()=>string,handler:()=>void,disabled=()=>false,variant='ghost'):Template=>html`
        <cb-button part=${part} icon-only icon=${icon} variant=${variant} size="sm" label=${label} accessible-label=${label} disabled=${disabled}
            onaction=${(event:Event)=>{event.stopPropagation();handler();}}></cb-button>`;
    const tracks=():Template=>html`${repeat(()=>Array.isArray(owner.tracks)?owner.tracks.filter(track=>track&&text(track.src)):[],track=>html`
        <track part="track" kind="captions" src=${()=>mediaURL(track.src,owner.baseURI)} srclang=${()=>text(track.language)} label=${()=>text(track.label,text(track.language))} default=${()=>bool(track.default)}>`)}`;
    const mediaTemplate=kind==='video'?html`<video part="media" ref="media" playsinline aria-label=${accessibleName}
        autoplay=${()=>bool(owner.autoplay)} loop=${()=>bool(owner.loop)} muted=${()=>bool(owner.muted)}
        preload=${()=>owner.preload} crossorigin=${()=>owner.crossOrigin||null} poster=${()=>owner.poster?mediaURL(owner.poster,owner.baseURI):null}>${tracks()}</video>`
        :html`<audio part="media" ref="media" aria-label=${accessibleName} autoplay=${()=>bool(owner.autoplay)} loop=${()=>bool(owner.loop)}
            muted=${()=>bool(owner.muted)} preload=${()=>owner.preload} crossorigin=${()=>owner.crossOrigin||null}>${tracks()}</audio>`;
    const root=html`<style part="styles">${css}</style><section part="player" role="group" aria-label=${accessibleName}>
        <div part="title" hidden=${()=>!text(owner.mediaTitle)}>${()=>text(owner.mediaTitle)}</div>${mediaTemplate}
        <div part="timeline"><cb-slider part="seek" exportparts="control:seek-control" step="0.1" min=${()=>playback[0]().seekStart}
            max=${()=>Math.max(playback[0]().seekStart,playback[0]().seekEnd)} value=${()=>playback[0]().position}
            accessible-label=${()=>owner.seekLabel} value-text=${timeText} disabled=${noSeek}
            onchange=${(event:CustomEvent<{value:number}>)=>{event.stopPropagation();owner.seek(Number(event.detail.value));}}></cb-slider>
            <output part="time" aria-live="off">${timeText}</output></div>
        <div part="controls"><div part="transport">
            ${action('backward',()=> 'backward',()=>owner.backwardLabel,()=>owner.backward(),noSeek)}
            ${action('play',()=>playback[0]().paused?'play':'pause',()=>playback[0]().paused?owner.playLabel:owner.pauseLabel,()=>{if(playback[0]().paused)void owner.play();else owner.pause();},()=>!source(),'primary')}
            ${action('stop',()=> 'stop',()=>owner.stopLabel,()=>owner.stop(),()=>!source())}
            ${action('forward',()=> 'forward',()=>owner.forwardLabel,()=>owner.forward(),noSeek)}
        </div><div part="settings">
            ${action('mute',()=>playback[0]().muted?'muted':'volume',()=>playback[0]().muted?owner.unmuteLabel:owner.muteLabel,()=>owner.setMuted(!playback[0]().muted))}
            <cb-slider part="volume" exportparts="control:volume-control" min="0" max="1" step="0.05" value=${()=>playback[0]().volume} accessible-label=${()=>owner.volumeLabel}
                onchange=${(event:CustomEvent<{value:number}>)=>{event.stopPropagation();owner.setVolume(Number(event.detail.value));}}></cb-slider>
            <cb-select part="rate" exportparts="control:rate-control" accessible-label=${()=>owner.rateLabel} value=${()=>String(playback[0]().rate)}
                options=${()=>[.5,.75,1,1.25,1.5,2].map(value=>({value:String(value),label:`${value}×`}))}
                onchange=${(event:CustomEvent<{value:string}>)=>{event.stopPropagation();owner.setRate(Number(event.detail.value));}}></cb-select>
            ${kind==='video'?html`<cb-select part="captions" exportparts="control:captions-control" accessible-label=${()=>owner.captionsLabel}
                hidden=${()=>!owner.tracks.length} value=${()=>{playback[0]();return String(Array.from(media()?.textTracks??[]).findIndex(track=>track.mode==='showing'));}}
                options=${()=>[{value:'-1',label:owner.captionsOffLabel},...owner.tracks.map((track,index)=>({value:String(index),label:track.label||track.language||''}))]}
                onchange=${(event:CustomEvent<{value:string}>)=>{event.stopPropagation();Array.from(media()?.textTracks??[]).forEach((track,index)=>track.mode=index===Number(event.detail.value)?'showing':'disabled');}}></cb-select>
                <cb-button part="fullscreen" exportparts="control:fullscreen-control,label:fullscreen-label,button-label:fullscreen-label,icon:fullscreen-icon,description:fullscreen-description" icon-only icon="fullscreen" variant="ghost" size="sm" hidden=${()=>!document.fullscreenEnabled||!owner.requestFullscreen}
                    accessible-label=${()=>fullscreen[0]()?owner.exitFullscreenLabel:owner.fullscreenLabel} label=${()=>fullscreen[0]()?owner.exitFullscreenLabel:owner.fullscreenLabel}
                    onaction=${(event:Event)=>{event.stopPropagation();void owner.fullscreen();}}></cb-button>`:''}
        </div></div><p part="status" role="status" hidden=${()=>!status()}>${status}</p><slot name="transcript" part="transcript"></slot>
    </section>`;
    const media=():HTMLMediaElement|undefined=>{const node=root.refs.media?.[0];return node instanceof HTMLMediaElement?node:undefined;};
    return {root,get media(){return media();},update(value:PlaybackState):void{playback[1](value);fullscreen[1](document.fullscreenElement===owner);}};
}
