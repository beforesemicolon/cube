import { html, when, isNot, state, type Template } from '../core/runtime.js'
import { scalarText, finite, bool } from '../core/value.js'

import type { MessageBase, FeedbackTone } from './MessageBase.js'
import type { ProgressIndicatorBase } from './ProgressIndicatorBase.js'
import type { SpinnerBase } from './spinner/SpinnerBase.js'

type MessageKind = 'status' | 'toast' | 'alert' | 'banner'
const tones: readonly FeedbackTone[] = ['neutral','info','success','warning','danger']
const toneFor = (tone: FeedbackTone): FeedbackTone => tones.includes(tone) ? tone : 'info'

// Family-owned feedback styles, independent of the Studio demo/control layouts.

export function messageView(source: MessageBase, kind: MessageKind): Template {
    const title = () => kind === 'status' ? scalarText(source.value) || scalarText(source.label) : scalarText(source.label) || scalarText(source.value)
    const copy = () => [...new Set([kind !== 'status' && scalarText(source.value) !== title() ? scalarText(source.value) : '',scalarText(source.status) !== title() ? scalarText(source.status) : ''].filter(Boolean))].join(' · ')
    const tone = () => toneFor(source.tone)
    const actions = state(false)
    const content = state(false)
    const syncActions = (): void => {
        const slot = root.refs.actions?.[0]
        actions[1](slot instanceof HTMLSlotElement && slot.assignedNodes().some(node => node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim())))
    }
    const syncContent = (): void => {
        const slot = root.refs.content?.[0]
        content[1](slot instanceof HTMLSlotElement && slot.assignedNodes().some(node => node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim())))
    }
    const root = html`<div part="display status-display" data-component=${kind} data-tone=${tone}
        role=${() => kind === 'alert' && ['warning', 'danger'].includes(tone()) ? 'alert' : 'status'}
        aria-live=${() => kind === 'alert' && ['warning', 'danger'].includes(tone()) ? 'assertive' : 'polite'}>
        <div part="status-card">
            <div part="status-content">${when(title, html`<span part="value status-title"><span part="indicator status-icon" aria-hidden="true"></span>${title}</span>`)}
                ${when(copy, html`<div part="status-copy">${copy}</div>`)}
                ${when(() => scalarText(source.description), html`<p part="description">${() => scalarText(source.description)}</p>`)}
                <div part="content" hidden=${isNot(content[0])} onslotchange=${syncContent}><slot ref="content"></slot></div>
                <div part="actions" hidden=${isNot(actions[0])} onslotchange=${syncActions}><slot ref="actions"></slot></div>
            </div>
        </div>
    </div>`
    return root.onMount(() => { syncContent(); syncActions() })
}

export function progressView(source: ProgressIndicatorBase): Template {
    const maximum = () => Math.max(1,finite(source.max,100))
    const value = () => Math.max(0,Math.min(maximum(),finite(source.progress)))
    return html`<div part="display progress" data-component="progress" data-tone=${() => toneFor(source.tone)}>
        <div part="progress-heading"><span part="status-title">${() => source.label}${when(() => source.status,html`<span part="status-copy">${when(() => source.label,' · ','')}${() => source.status}</span>`)}</span></div>
        <progress part="meter" max=${maximum} value=${when(() => bool(source.indeterminate),null,value)} aria-label=${() => source.accessibleLabel || source.label || null}></progress>
        ${when(() => source.description,html`<p part="description">${() => source.description}</p>`)}
    </div>`
}

export function spinnerView(source: SpinnerBase): Template {
    return html`<div part="display status-display" data-component="spinner" role="status" aria-label=${() => source.accessibleLabel || null}>
        <span part="spinner-ring" aria-hidden="true"></span><span part="value status-title">${() => source.status || source.label}</span>
    </div>`
}
