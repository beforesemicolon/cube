import { Component, type CommonProps } from '../core/Component.js'
import { bool, finite, mediaURL, text } from '../core/value.js'
import { MediaController, type PlaybackState } from './controller.js'
export interface CaptionTrack { src?: string; language?: string; label?: string; default?: boolean }
export interface MediaProps extends CommonProps {
    src?: string; mediaTitle?: string; accessibleLabel?: string; muted?: boolean; autoplay?: boolean; loop?: boolean
    preload?: 'none' | 'metadata' | 'auto'; seekStep?: number; playbackRate?: number
    poster?: string; tracks?: CaptionTrack[]; crossOrigin?: '' | 'anonymous' | 'use-credentials'
    playLabel?: string; pauseLabel?: string; stopLabel?: string; backwardLabel?: string; forwardLabel?: string
    seekLabel?: string; volumeLabel?: string; muteLabel?: string; unmuteLabel?: string; rateLabel?: string
    captionsLabel?: string; captionsOffLabel?: string; fullscreenLabel?: string; exitFullscreenLabel?: string
    emptyText?: string; errorText?: string; bufferingText?: string; liveText?: string
}
export abstract class MediaBase extends Component<MediaProps> {
    static observedAttributes = [...Component.observedAttributes, 'src', 'media-title', 'accessible-label', 'muted', 'autoplay', 'loop', 'preload', 'seek-step', 'playback-rate', 'poster', 'tracks', 'cross-origin', 'play-label', 'pause-label', 'stop-label', 'backward-label', 'forward-label', 'seek-label', 'volume-label', 'mute-label', 'unmute-label', 'rate-label', 'captions-label', 'captions-off-label', 'fullscreen-label', 'exit-fullscreen-label', 'empty-text', 'error-text', 'buffering-text', 'live-text']
    src = ''; mediaTitle = ''; accessibleLabel = ''; muted = false; autoplay = false; loop = false
    preload: 'none' | 'metadata' | 'auto' = 'metadata'; seekStep = 10; playbackRate = 1
    poster = ''; tracks: CaptionTrack[] = []; crossOrigin: '' | 'anonymous' | 'use-credentials' = ''
    playLabel = ''; pauseLabel = ''; stopLabel = ''; backwardLabel = ''; forwardLabel = ''
    seekLabel = ''; volumeLabel = ''; muteLabel = ''; unmuteLabel = ''; rateLabel = ''
    captionsLabel = ''; captionsOffLabel = ''; fullscreenLabel = ''; exitFullscreenLabel = ''
    emptyText = ''; errorText = ''; bufferingText = ''; liveText = ''
    private controller?: MediaController
    protected playbackError: unknown = null
    protected abstract mediaElement(): HTMLMediaElement | undefined
    protected abstract playbackChanged(state: PlaybackState): void
    protected mount(): void {
        const media = this.mediaElement(); if (!media) return
        this.controller = new MediaController(media, state => {
            this.playbackChanged(state); this.emit('mediachange', state)
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
            if (media.playbackRate !== finite(this.playbackRate, 1)) this.controller?.setRate(finite(this.playbackRate, 1))

        } catch (error) {
            if (name === 'src') { media.pause(); media.removeAttribute('src'); media.load() }
            this.playbackError = error; this.onError(error)
        }
        this.controller?.notify()
    }
}
