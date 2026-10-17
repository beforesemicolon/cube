import { clamp, finite } from '../core/value.js'
export interface MediaPort extends EventTarget {
    currentTime: number; duration: number; paused: boolean; ended: boolean; readyState: number
    volume: number; muted: boolean; playbackRate: number; error: unknown
    seekable: { length: number; start(index: number): number; end(index: number): number }
    play(): Promise<void>; pause(): void
}
export interface PlaybackState { position: number; duration: number; paused: boolean; ended: boolean; volume: number; muted: boolean; rate: number; buffering: boolean; error: unknown; seekStart: number; seekEnd: number }
export function seekBounds(media: MediaPort): Array<[number, number]> {
    const ranges: Array<[number, number]> = []
    for (let i = 0; i < media.seekable.length; i++) {
        const start = media.seekable.start(i), end = media.seekable.end(i)
        if (Number.isFinite(start) && Number.isFinite(end) && end >= start) ranges.push([Math.max(0, start), end])
    }
    if (!ranges.length && media.readyState > 0 && Number.isFinite(media.duration) && media.duration >= 0) ranges.push([0, media.duration])
    return ranges
}
export function seekTarget(media: MediaPort, position: unknown): number | null {
    if (typeof position !== 'number' || !Number.isFinite(position)) return null
    const ranges = seekBounds(media)
    if (!ranges.length) return null
    for (const [start, end] of ranges) if (position >= start && position <= end) return position
    return ranges.flat().reduce((closest, candidate) => Math.abs(candidate - position) < Math.abs(closest - position) ? candidate : closest)
}
export class MediaController {
    private disposed = false
    private revision = 0
    private waiting = false
    private readonly handlers = new Map<string, EventListener>()
    constructor(readonly media: MediaPort, private changed: (state: PlaybackState) => void, private failed: (error: unknown) => void) {
        for (const name of ['play', 'playing', 'pause', 'ended', 'timeupdate', 'durationchange', 'loadedmetadata', 'progress', 'waiting', 'stalled', 'canplay', 'emptied', 'loadstart', 'error', 'volumechange', 'ratechange']) {
            const listener = () => {
                if (['waiting', 'stalled', 'loadstart'].includes(name)) this.waiting = true
                if (['playing', 'pause', 'ended', 'canplay', 'loadedmetadata', 'emptied', 'error'].includes(name)) this.waiting = false
                if (name === 'error' && media.error) this.failed(media.error)
                this.notify()
            }
            this.handlers.set(name, listener); media.addEventListener(name, listener)
        }
    }
    snapshot(): PlaybackState {
        const ranges = seekBounds(this.media)
        return { position: finite(this.media.currentTime), duration: this.media.duration, paused: this.media.paused,
            ended: this.media.ended, volume: this.media.volume, muted: this.media.muted, rate: this.media.playbackRate,
            buffering: this.waiting, error: this.media.error, seekStart: ranges[0]?.[0] ?? 0, seekEnd: ranges.at(-1)?.[1] ?? 0 }
    }
    notify(): void { if (!this.disposed) this.changed(this.snapshot()) }
    cancelPending(): void { this.revision++ }
    async play(): Promise<boolean> {
        if (this.disposed) return false
        const revision = ++this.revision
        try { await this.media.play(); return !this.disposed && revision === this.revision }
        catch (error) { if (!this.disposed && revision === this.revision) this.failed(error); return false }
        finally { this.notify() }
    }
    pause(): void { if (this.disposed) return; this.cancelPending(); this.media.pause(); this.notify() }
    stop(): void { if (this.disposed) return; this.pause(); this.seek(seekBounds(this.media)[0]?.[0] ?? 0) }
    seek(position: unknown): boolean {
        const target = seekTarget(this.media, position)
        if (this.disposed || target === null) return false
        try { this.media.currentTime = target; this.notify(); return true } catch (error) { this.failed(error); return false }
    }
    seekBy(seconds: number): boolean { return this.seek(finite(this.media.currentTime) + finite(seconds)) }
    setVolume(value: number): void { if (!this.disposed && Number.isFinite(value)) { this.media.volume = clamp(value, 0, 1); this.notify() } }
    setMuted(value: boolean): void { if (this.disposed) return; this.media.muted = value; this.notify() }
    setRate(value: number): void { if (!this.disposed && Number.isFinite(value) && value > 0) { this.media.playbackRate = clamp(value, .25, 4); this.notify() } }
    dispose(): void {
        if (this.disposed) return
        this.disposed = true; this.cancelPending()
        for (const [event, listener] of this.handlers) this.media.removeEventListener(event, listener)
        this.handlers.clear()
        this.media.pause()
    }
}
export function clock(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
    const value = Math.floor(seconds), h = Math.floor(value / 3600), m = Math.floor(value % 3600 / 60), s = String(value % 60).padStart(2, '0')
    return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}
