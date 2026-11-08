import { when, isNot, pick, or, html, repeat, state, type Template } from '../core/runtime.js';

import { bool, text, mediaURL } from '../core/value.js';

import type { MediaBase } from './MediaBase.js';
import { clock, type PlaybackState } from './controller.js';

/** Native playback remains a side effect; all player presentation is reactive markup. */
export function mediaView(owner:MediaBase,kind:'audio'|'video') {
    const playback=state<PlaybackState>({position:0,duration:NaN,paused:true,ended:false,volume:1,muted:false,rate:1,buffering:false,error:null,seekStart:0,seekEnd:0});
    const fullscreen=state(false);
    const accessibleName=():string=>text(owner.accessibleLabel)||text(owner.mediaTitle);
    const source=():boolean=>Boolean(mediaURL(owner.src,owner.baseURI));
    const noSeek = or(isNot(source), () => playback[0]().seekEnd <= playback[0]().seekStart);
    const timeText=():string=>`${clock(playback[0]().position)} / ${Number.isFinite(playback[0]().duration)?clock(playback[0]().duration):playback[0]().duration===Infinity?owner.liveText:'0:00'}`;
    const status=():string=>owner.hasPlaybackError||playback[0]().error?owner.errorText:!source()?owner.emptyText:playback[0]().buffering?owner.bufferingText:'';
    const action=(part:string,icon:()=>string,label:()=>string,handler:()=>void,disabled=()=>false,variant='ghost'):Template=>html`
        <cb-button part=${part} icon-only icon=${icon} variant=${variant} size="sm" label=${label} accessible-label=${label} title=${label} disabled=${disabled}
            onaction=${(event:Event)=>{event.stopPropagation();handler();}}></cb-button>`;
    const tracks=():Template=>html`${repeat(()=>Array.isArray(owner.tracks)?owner.tracks.filter(track=>track&&text(track.src)):[],track=>html`
        <track part="track" kind="captions" src=${()=>mediaURL(track.src,owner.baseURI)} srclang=${()=>text(track.language)} label=${()=>text(track.label,text(track.language))} default=${()=>bool(track.default)}>`)}`;
    const mediaTemplate=kind==='video'?html`<video part="media" ref="media" playsinline aria-label=${accessibleName}
        autoplay=${()=>bool(owner.autoplay)} loop=${()=>bool(owner.loop)} muted=${()=>bool(owner.muted)}
        preload=${()=>owner.preload} crossorigin=${()=>owner.crossOrigin||null} poster=${()=>owner.poster?mediaURL(owner.poster,owner.baseURI):null}>${tracks()}</video>`
        :html`<audio part="media" ref="media" aria-label=${accessibleName} autoplay=${()=>bool(owner.autoplay)} loop=${()=>bool(owner.loop)}
            muted=${()=>bool(owner.muted)} preload=${()=>owner.preload} crossorigin=${()=>owner.crossOrigin||null}>${tracks()}</audio>`;
    const root=html`<section part="player" role="group" aria-label=${accessibleName}>
        <div part="title" hidden=${isNot(() => text(owner.mediaTitle))}>${()=>text(owner.mediaTitle)}</div>${mediaTemplate}
        <div part="timeline"><cb-slider part="seek" exportparts="control:seek-control" step="0.1" min=${pick(playback[0], "seekStart")}
            max=${()=>Math.max(playback[0]().seekStart,playback[0]().seekEnd)} value=${pick(playback[0], "position")}
            accessible-label=${()=>owner.seekLabel} value-text=${timeText} disabled=${noSeek}
            onchange=${(event:CustomEvent<{value:number}>)=>{event.stopPropagation();owner.seek(Number(event.detail.value));}}></cb-slider>
            <output part="time" aria-live="off">${timeText}</output></div>
        <div part="controls"><div part="transport">
            ${action('backward',()=> 'backward',()=>owner.backwardLabel,()=>owner.backward(),noSeek)}
            ${action('play',()=>playback[0]().paused?'play':'pause',()=>playback[0]().paused?owner.playLabel:owner.pauseLabel,()=>{if(playback[0]().paused)void owner.play();else owner.pause();},isNot(source),'primary')}
            ${action('stop',()=> 'stop',()=>owner.stopLabel,()=>owner.stop(),isNot(source))}
            ${action('forward',()=> 'forward',()=>owner.forwardLabel,()=>owner.forward(),noSeek)}
        </div><div part="settings">
            ${action('mute',()=>playback[0]().muted?'muted':'volume',()=>playback[0]().muted?owner.unmuteLabel:owner.muteLabel,()=>owner.setMuted(!playback[0]().muted))}
            <cb-slider part="volume" exportparts="control:volume-control" min="0" max="1" step="0.05" value=${pick(playback[0], "volume")} accessible-label=${()=>owner.volumeLabel}
                onchange=${(event:CustomEvent<{value:number}>)=>{event.stopPropagation();owner.setVolume(Number(event.detail.value));}}></cb-slider>
            <cb-select part="rate" exportparts="control:rate-control" accessible-label=${()=>owner.rateLabel} title=${()=>owner.rateLabel} value=${()=>String(playback[0]().rate)}
                options=${()=>[.5,.75,1,1.25,1.5,2].map(value=>({value:String(value),label:`${value}×`}))}
                onchange=${(event:CustomEvent<{value:string}>)=>{event.stopPropagation();owner.setRate(Number(event.detail.value));}}></cb-select>
            ${when(kind==='video', () => html`<cb-select part="captions" exportparts="control:captions-control" accessible-label=${()=>owner.captionsLabel} title=${()=>owner.captionsLabel}
                hidden=${isNot(() => owner.tracks.length)} value=${()=>{playback[0]();return String(Array.from(media()?.textTracks??[]).findIndex(track=>track.mode==='showing'));}}
                options=${()=>[{value:'-1',label:owner.captionsOffLabel},...owner.tracks.map((track,index)=>({value:String(index),label:track.label||track.language||''}))]}
                onchange=${(event:CustomEvent<{value:string}>)=>{event.stopPropagation();Array.from(media()?.textTracks??[]).forEach((track,index)=>track.mode=index===Number(event.detail.value)?'showing':'disabled');}}></cb-select>
                <cb-button part="fullscreen" exportparts="control:fullscreen-control,label:fullscreen-label,button-label:fullscreen-label,icon:fullscreen-icon,description:fullscreen-description" icon-only icon="fullscreen" variant="ghost" size="sm" hidden=${or(isNot(document.fullscreenEnabled), isNot(() => owner.requestFullscreen))}
                    accessible-label=${()=>fullscreen[0]()?owner.exitFullscreenLabel:owner.fullscreenLabel} label=${()=>fullscreen[0]()?owner.exitFullscreenLabel:owner.fullscreenLabel} title=${()=>fullscreen[0]()?owner.exitFullscreenLabel:owner.fullscreenLabel}
                    onaction=${(event:Event)=>{event.stopPropagation();void owner.fullscreen();}}></cb-button>`, () => '')}
        </div></div><p part="status" role="status" hidden=${isNot(status)}>${status}</p><slot name="transcript" part="transcript"></slot>
    </section>`;
    const media=():HTMLMediaElement|undefined=>{const node=root.refs.media?.[0];return node instanceof HTMLMediaElement?node:undefined;};
    return {root,get media(){return media();},update(value:PlaybackState):void{playback[1](value);fullscreen[1](document.fullscreenElement===owner);}};
}
