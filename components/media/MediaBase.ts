import { Component, type CommonProps } from '../core/Component.js'
import { bool, finite, mediaURL, text } from '../core/value.js'
import { MediaController, type PlaybackState } from './controller.js'
export interface CaptionTrack { src?: string; language?: string; label?: string; default?: boolean }
export interface MediaProps extends CommonProps {
    src?: string; mediaTitle?: string; muted?: boolean; autoplay?: boolean; loop?: boolean
    preload?: 'none' | 'metadata' | 'auto'; seekStep?: number; playbackRate?: number
    poster?: string; tracks?: CaptionTrack[]; crossOrigin?: '' | 'anonymous' | 'use-credentials'
}
export abstract class MediaBase extends Component<MediaProps> {
    static observedAttributes = [...Component.observedAttributes, 'src', 'media-title', 'muted', 'autoplay', 'loop', 'preload', 'seek-step', 'playback-rate', 'poster', 'tracks', 'cross-origin']
    src = ''; mediaTitle = ''; muted = false; autoplay = false; loop = false
    preload: 'none' | 'metadata' | 'auto' = 'metadata'; seekStep = 10; playbackRate = 1
    poster = ''; tracks: CaptionTrack[] = []; crossOrigin: '' | 'anonymous' | 'use-credentials' = ''
    private controller?: MediaController
    protected playbackError: unknown = null
    protected abstract mediaElement(): HTMLMediaElement | undefined
    protected abstract playbackChanged(state: PlaybackState): void
    get mediaLabels() { return this.copy }
    protected mount(): void {
        const media = this.mediaElement(); if (!media) return
        this.controller = new MediaController(media, state => {
            this.playbackChanged(state); this.emit('cb-media-change', state)
        }, error => { this.playbackError = error; this.onError(error); this.controller?.notify() })
        this.listen(document, 'fullscreenchange', () => this.controller?.notify())
        this.sync('src'); this.sync('tracks')
    }
    protected update(name: string): void { this.sync(name) }
    protected unmount(): void { this.controller?.dispose(); this.controller = undefined }
    play(): Promise<boolean> { this.playbackError = null; return this.controller?.play() ?? Promise.resolve(false) }
    pause(): void { this.controller?.pause() }
    stop(): void { this.controller?.stop() }
    seek(position: number): boolean { return this.controller?.seek(position) ?? false }
    backward(): void { this.controller?.seekBy(-Math.max(0, finite(this.seekStep, 10))) }
    forward(): void { this.controller?.seekBy(Math.max(0, finite(this.seekStep, 10))) }
    setVolume(value: number): void { this.controller?.setVolume(value) }
    setMuted(value: boolean): void { this.muted = value; this.controller?.setMuted(value) }
    setRate(value: number): void { this.playbackRate = value; this.controller?.setRate(value) }
    get hasPlaybackError(): boolean { return !!this.playbackError }
    async fullscreen(): Promise<void> {
        try {
            if (document.fullscreenElement === this) await document.exitFullscreen()
            else if (this.requestFullscreen) await this.requestFullscreen()
        } catch (error) { this.onError(error) }
    }
    private sync(name: string): void {
        const media = this.mediaElement(); if (!media) return
        try {
            if (name === 'src') {
                this.controller?.cancelPending(); this.playbackError = null
                const src = mediaURL(this.src, this.baseURI)
                if (src !== (media.getAttribute('src') ?? '')) {
                    media.pause()
                    if (src) media.setAttribute('src', src); else media.removeAttribute('src')
                    media.load()
                }
            }
            media.autoplay = bool(this.autoplay); media.loop = bool(this.loop); media.muted = bool(this.muted)
            media.preload = ['none', 'metadata', 'auto'].includes(text(this.preload)) ? this.preload : 'metadata'
            if (this.crossOrigin === 'anonymous' || this.crossOrigin === 'use-credentials') media.crossOrigin = this.crossOrigin
            else media.removeAttribute('crossorigin')
            if (media.playbackRate !== finite(this.playbackRate, 1)) this.controller?.setRate(finite(this.playbackRate, 1))
            if (media instanceof HTMLVideoElement) {
                media.playsInline = true
                if (text(this.poster)) media.poster = mediaURL(this.poster, this.baseURI); else media.removeAttribute('poster')
            }
            if (name === 'tracks') {
                media.querySelectorAll('track').forEach(track => track.remove())
                for (const track of Array.isArray(this.tracks) ? this.tracks : []) {
                    if (!track || !text(track.src)) continue
                    const node = document.createElement('track'); node.setAttribute('part', 'track')
                    node.kind = 'captions'; node.src = mediaURL(track.src, this.baseURI)
                    node.srclang = text(track.language); node.label = text(track.label, node.srclang); node.default = bool(track.default)
                    media.append(node)
                }
            }
        } catch (error) {
            if (name === 'src') { media.pause(); media.removeAttribute('src'); media.load() }
            this.playbackError = error; this.onError(error)
        }
        this.controller?.notify()
    }
}
