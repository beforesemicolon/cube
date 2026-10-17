import { button, commonCSS, el, label, sheet } from '../core/dom.js'
import { text } from '../core/value.js'
import { token as v } from '../theme/tokens.js'
import type { MediaBase } from './MediaBase.js'
import { clock, type PlaybackState } from './controller.js'
import { mediaIconPaths as paths } from './icons.js'
// Original SVG paths. Accessible names belong to the buttons, not decorative glyphs.

export function mediaIcon(name: keyof typeof paths): SVGSVGElement {
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), path = document.createElementNS(ns, 'path')
    svg.setAttribute('part', 'icon'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', '20'); svg.setAttribute('height', '20')
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false')
    path.setAttribute('part', 'icon-path'); path.setAttribute('d', paths[name]); path.setAttribute('stroke', 'currentColor')
    path.setAttribute('stroke-width', name === 'pause' ? '4' : '1.5'); path.setAttribute('fill', name === 'play' ? 'currentColor' : 'none')
    path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round'); svg.append(path); return svg
}
export function mediaView(owner: MediaBase, kind: 'audio' | 'video') {
    const root = document.createDocumentFragment(), group = el('section', 'player'), media = el(kind, 'media')
    const title = el('div', 'title'), controls = el('div', 'actions controls'), status = el('p', 'status')
    group.setAttribute('role', 'group'); status.setAttribute('role', 'status')
    const play = button('play', () => { if (media.paused) void owner.play(); else owner.pause() })
    const stop = button('stop', () => owner.stop()), backward = button('backward', () => owner.backward()), forward = button('forward', () => owner.forward())
    const mute = button('mute', () => owner.setMuted(!media.muted)), fullscreen = button('fullscreen', () => void owner.fullscreen())
    const seek = el('input', 'seek'); seek.type = 'range'; seek.step = '0.1'; seek.min = '0'; seek.max = '0'; seek.value = '0'
    const volume = el('input', 'volume'); volume.type = 'range'; volume.min = '0'; volume.max = '1'; volume.step = '.05'; volume.value = '1'
    const rate = el('select', 'rate'), captions = el('select', 'captions'), time = el('output', 'time')
    for (const n of [.5, .75, 1, 1.25, 1.5, 2]) { const o = el('option', 'rate-option', `${n}×`); o.value = String(n); rate.append(o) }
    rate.value = '1'
    seek.addEventListener('input', () => owner.seek(Number(seek.value)))
    volume.addEventListener('input', () => owner.setVolume(Number(volume.value)))
    rate.addEventListener('change', () => owner.setRate(Number(rate.value)))
    captions.addEventListener('change', () => {
        Array.from(media.textTracks).forEach((track, i) => { track.mode = i === Number(captions.value) ? 'showing' : 'disabled' })
    })
    stop.append(mediaIcon('stop')); backward.append(mediaIcon('backward')); forward.append(mediaIcon('forward')); fullscreen.append(mediaIcon('fullscreen'))
    controls.append(backward, play, stop, forward, time, seek, mute, volume, rate)
    if (kind === 'video') controls.append(captions, fullscreen)
    const transcript = el('slot', 'transcript'); transcript.name = 'transcript'
    group.append(title, media, controls, status, transcript)
    root.append(sheet(commonCSS + `
[part=player]{background:${v('--color-surface')};border:1px solid ${v('--color-separator')};border-radius:${v('--radius-md')};padding:${v('--spacing-md')}}
[part=title]{font-weight:600;margin-bottom:${v('--spacing-sm')}}
video{display:block;width:100%;aspect-ratio:${v('--component-media-aspect-ratio')};background:${v('--color-background')};object-fit:contain}
audio{display:none}
[part~=controls]{margin-top:${v('--spacing-sm')}}
[part=seek]{flex:1 1 140px}[part=volume]{width:80px}[part=time]{font-family:${v('--typography-mono-font-family')};font-size:.85em}
[part=status]{margin-top:${v('--spacing-sm')}}
:host(:fullscreen){background:${v('--color-background')};display:grid;place-items:center}
@container(max-width:480px){[part=seek]{flex-basis:100%;order:10}[part~=controls]{gap:${v('--spacing-xs')}}}
`), group)
    let captionKey = ''
    return { root, media, update(state: PlaybackState) {
        const m = owner.mediaLabels, source = !!media.getAttribute('src')
        label(group, text(owner.mediaTitle) || m[kind]); label(media, text(owner.mediaTitle) || m[kind])
        title.textContent = text(owner.mediaTitle); title.hidden = !title.textContent
        label(play, state.paused ? m.play : m.pause); play.replaceChildren(mediaIcon(state.paused ? 'play' : 'pause'))
        label(stop, m.stop); label(backward, m.backward); label(forward, m.forward)
        label(mute, state.muted ? m.unmute : m.mute); mute.replaceChildren(mediaIcon(state.muted ? 'muted' : 'volume'))
        mute.setAttribute('aria-pressed', String(state.muted)); label(volume, m.volume); label(rate, m.rate); label(seek, m.seek)
        label(captions, m.captions); label(fullscreen, document.fullscreenElement === owner ? m.exitFullscreen : m.fullscreen)
        fullscreen.hidden = kind !== 'video' || !document.fullscreenEnabled || !owner.requestFullscreen
        play.disabled = stop.disabled = !source
        backward.disabled = forward.disabled = seek.disabled = state.seekEnd <= state.seekStart || !source
        seek.min = String(state.seekStart); seek.max = String(Math.max(state.seekStart, state.seekEnd))
        if (!seek.matches(':active')) seek.value = String(state.position)
        seek.setAttribute('aria-valuetext', `${clock(state.position)} / ${Number.isFinite(state.duration) ? clock(state.duration) : m.live}`)
        if (!volume.matches(':active')) volume.value = String(state.volume)
        rate.value = String(state.rate)
        time.textContent = `${clock(state.position)} / ${Number.isFinite(state.duration) ? clock(state.duration) : state.duration === Infinity ? m.live : '0:00'}`
        status.textContent = owner.hasPlaybackError || state.error ? m.mediaError : !source ? m.mediaEmpty : state.buffering ? m.buffering : ''
        status.hidden = !status.textContent
        const tracks = Array.from(media.querySelectorAll('track')), key = JSON.stringify([m.captionsOff, tracks.map(t => [t.src, t.srclang, t.label])])
        if (key !== captionKey) {
            captionKey = key; captions.replaceChildren()
            const off = el('option', 'caption-option', m.captionsOff); off.value = '-1'; captions.append(off)
            tracks.forEach((track, i) => { const o = el('option', 'caption-option', track.label || track.srclang); o.value = String(i); captions.append(o) })
            captions.value = String(Array.from(media.textTracks).findIndex(t => t.mode === 'showing'))
        }
        if (captions !== owner.shadowRoot?.activeElement) captions.value = String(Array.from(media.textTracks).findIndex(t => t.mode === 'showing'))
        captions.hidden = !tracks.length
    } }
}
