import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, clamp, finite, scalarText } from '../../core/value.js'

export interface TimelineKeyframe { readonly id: string; readonly time: number; readonly label?: string; readonly disabled?: boolean }
export interface TimelineTrack { readonly id: string; readonly label: string; readonly keyframes: readonly TimelineKeyframe[]; readonly disabled?: boolean }
export interface TimelineProps extends ComponentProps {
    tracks?: readonly TimelineTrack[]
    duration?: number
    currentTime?: number
    playing?: boolean
    loop?: boolean
    snap?: number
    selectedKeyframeId?: string
    playLabel?: string
    pauseLabel?: string
    rewindLabel?: string
    addKeyframeLabel?: string
    playheadLabel?: string
    keyframeLabel?: string
    timeLabel?: string
}

export interface TimelineTimeDetail { readonly currentTime: number; readonly duration: number; readonly originalEvent?: Event }
export interface TimelineKeyframeDetail { readonly trackId: string; readonly keyframe: TimelineKeyframe; readonly originalEvent?: Event }

/** Headless timeline playback, scrubbing, selection, and keyframe editing behavior. */
export abstract class TimelineBase extends Component<TimelineProps> {
    static observedAttributes = [
        ...Component.observedAttributes, 'tracks', 'duration', 'current-time', 'playing', 'loop', 'snap', 'selected-keyframe-id',
        'play-label', 'pause-label', 'rewind-label', 'add-keyframe-label', 'playhead-label', 'keyframe-label', 'time-label',
    ]

    tracks: readonly TimelineTrack[] = []
    duration = 4
    currentTime = 0
    playing = false
    loop = false
    snap = .1
    selectedKeyframeId = ''
    playLabel = ''
    pauseLabel = ''
    rewindLabel = ''
    addKeyframeLabel = ''
    playheadLabel = ''
    keyframeLabel = ''
    timeLabel = ''

    protected timelineDuration(): number { return Math.max(.01, finite(this.duration, 4)) }
    protected timelineTime(value = this.currentTime): number { return clamp(finite(value), 0, this.timelineDuration()) }
    protected timelineTracks(): readonly TimelineTrack[] {
        if (!Array.isArray(this.tracks)) return []
        const normalized: TimelineTrack[] = []
        for (const track of this.tracks) {
            if (!track || typeof track.id !== 'string' || !track.id) continue
            const keyframes: TimelineKeyframe[] = []
            if (Array.isArray(track.keyframes)) for (const keyframe of track.keyframes) {
                if (!keyframe || typeof keyframe.id !== 'string' || !keyframe.id) continue
                keyframes.push({ id:keyframe.id, time:this.timelineTime(keyframe.time), ...(typeof keyframe.label === 'string' ? {label:keyframe.label} : {}), ...(keyframe.disabled ? {disabled:true} : {}) })
            }
            normalized.push({ id:track.id, label:typeof track.label === 'string' ? track.label : track.id, keyframes, ...(track.disabled ? {disabled:true} : {}) })
        }
        return normalized
    }
    protected text(name: 'playLabel'|'pauseLabel'|'rewindLabel'|'addKeyframeLabel'|'playheadLabel'|'keyframeLabel'|'timeLabel'): string { return scalarText(this[name]) }

    seek(time: number, originalEvent?: Event, commit = true): boolean {
        if (this.unavailable) return false
        const detail: TimelineTimeDetail = { currentTime: this.timelineTime(time), duration: this.timelineDuration(), originalEvent }
        if (!this.request(commit ? 'cb-before-change' : 'cb-before-input', detail)) return false
        this.currentTime = detail.currentTime
        this.syncView()
        this.emit(commit ? 'cb-change' : 'cb-input', detail)
        return true
    }

    setPlaying(playing: boolean, originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const next = bool(playing)
        if (!this.request('cb-before-playback-change', { playing: next, originalEvent })) return false
        this.playing = next
        this.syncView()
        this.emit(next ? 'cb-play' : 'cb-pause', { currentTime: this.timelineTime(), originalEvent })
        return true
    }

    selectKeyframe(trackId: string, keyframeId: string, originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const track = this.timelineTracks().find(candidate => candidate.id === trackId)
        const keyframe = track?.keyframes.find(candidate => candidate.id === keyframeId)
        if (!track || !keyframe || track.disabled || keyframe.disabled) return false
        const detail: TimelineKeyframeDetail = { trackId, keyframe, originalEvent }
        if (!this.request('cb-before-select', detail)) return false
        this.selectedKeyframeId = keyframe.id
        this.currentTime = this.timelineTime(keyframe.time)
        this.syncView()
        this.emit('cb-select', detail)
        return true
    }

    moveKeyframe(trackId: string, keyframeId: string, time: number, originalEvent?: Event, commit = true): boolean {
        if (this.unavailable) return false
        const increment = Math.max(.001, finite(this.snap, .1))
        const nextTime = this.timelineTime(Math.round(time / increment) * increment)
        const track = this.timelineTracks().find(candidate => candidate.id === trackId)
        const keyframe = track?.keyframes.find(candidate => candidate.id === keyframeId)
        if (!track || !keyframe || track.disabled || keyframe.disabled) return false
        const moved: TimelineKeyframe = { ...keyframe, time: nextTime }
        const detail: TimelineKeyframeDetail = { trackId, keyframe: moved, originalEvent }
        if (!this.request(commit ? 'cb-before-keyframe-change' : 'cb-before-keyframe-input', detail)) return false
        this.tracks = this.timelineTracks().map(candidate => candidate.id === trackId
            ? { ...candidate, keyframes: candidate.keyframes.map(frame => frame.id === keyframeId ? moved : frame) }
            : candidate)
        this.selectedKeyframeId = keyframeId
        this.currentTime = nextTime
        this.syncView()
        this.emit(commit ? 'cb-keyframe-change' : 'cb-keyframe-input', detail)
        return true
    }

    addKeyframe(trackId = this.timelineTracks()[0]?.id ?? '', originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const track = this.timelineTracks().find(candidate => candidate.id === trackId)
        if (!track || track.disabled) return false
        const time = this.timelineTime()
        const id = `${track.id}-${Math.round(time * 1000)}`
        const keyframe: TimelineKeyframe = { id, time }
        const detail: TimelineKeyframeDetail = { trackId, keyframe, originalEvent }
        if (!this.request('cb-before-keyframe-add', detail)) return false
        this.tracks = this.timelineTracks().map(candidate => candidate.id === trackId ? { ...candidate, keyframes: [...candidate.keyframes, keyframe] } : candidate)
        this.selectedKeyframeId = id
        this.syncView()
        this.emit('cb-keyframe-add', detail)
        return true
    }
}
