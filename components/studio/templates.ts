import { html, repeat, type Template } from '../core/runtime.js'
import { bool, scalarText } from '../core/value.js'
import { iconPaths } from '../icons/paths.js'
import type { StudioItem } from './types.js'
import type { StudioViewSource } from './view.js'
import type { UnitInputBase } from '../form/unit-input/UnitInputBase.js'
import { normalizeRange } from '../form/model.js'

/** Shared templates for the small form and display families, powered by Markup signals. */
export function studioTemplates(source: StudioViewSource, styles: string): Template {
    const kind = source.componentKind
    const name = source.componentName
    const label = () => scalarText(source.label)
    const accessibleName = () => scalarText(source.accessibleLabel) || label()
    const description = () => scalarText(source.description)
    const value = () => Array.isArray(source.value) ? source.value.join(', ') : scalarText(source.value)
    const items = () => Array.isArray(source.items) ? source.items : []
    const disabled = () => source.controlUnavailable?.() ?? bool(source.disabled)
    const readOnly = () => bool(source.readOnly)
    const required = () => bool(source.required)
    const invalid = () => bool(source.invalid) || source.hasAttribute('data-field-invalid')
    const selected = (item: StudioItem) => Array.isArray(source.value)
        ? source.value.includes(String(item.value ?? item.id))
        : String(source.value) === String(item.value ?? item.id)
    const setValue = (next: NonNullable<StudioViewSource['value']>, event: Event) => {
        event.stopPropagation()
        source.setControlValue?.(next, event)
    }
    const activate = (event: Event, item?: StudioItem) => {
        event.stopPropagation()
        if (disabled() || item?.disabled) return
        const detail = { item: item ?? null, value: item?.value ?? item?.id ?? source.value, originalEvent: event }
        if (!source.dispatchEvent(new CustomEvent('beforeaction', { detail, bubbles: true, composed: true, cancelable: true }))) return
        if (item) source.value = item.value ?? item.id
        source.emit('action', detail)
    }
    const glyph = (name: string, part = 'icon'): Template => html`<svg part="${part}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${iconPaths[name] ?? ''}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
    const number = (key: 'min' | 'max' | 'step' | 'progress') => {
        const fallback = key === 'max' ? 100 : key === 'step' ? 1 : 0
        const result = Number(source[key] ?? fallback)
        return Number.isFinite(result) ? result : fallback
    }
    const text = (key: 'unitLabel' | 'decrementLabel' | 'incrementLabel' | 'fileLabel' | 'fileRequirements') => scalarText((source as StudioViewSource & Partial<Record<typeof key, string>>)[key])
    const range = () => normalizeRange({ min: number('min'), max: number('max'), step: number('step'), value: Number(source.value) })
    const field = (item: StudioItem): Template => html`<div part="editor-field"><span part="editor-field-label">${item.label}</span><span part="editor-field-value">${item.description ?? String(item.value ?? '')}</span></div>`

    const input = (): Template => kind === 'textarea'
        ? html`<textarea ref="control" part="control textarea" value="${value}" placeholder="${() => scalarText(source.placeholder)}"
            disabled="${disabled}" readonly="${readOnly}" required="${required}" aria-label="${accessibleName}"
            oninput="${(event: Event) => { const target = event.currentTarget; if (target instanceof HTMLTextAreaElement) setValue(target.value, event) }}"></textarea>`
        : html`<input ref="control" part="control input" type="${kind === 'number' ? 'number' : kind === 'range' ? 'range' : 'text'}"
            value="${() => kind === 'range' ? range().value : value()}" placeholder="${() => scalarText(source.placeholder)}"
            min="${() => kind === 'number' || kind === 'range' ? number('min') : null}"
            max="${() => kind === 'number' || kind === 'range' ? number('max') : null}"
            step="${() => kind === 'number' || kind === 'range' ? number('step') : null}"
            style="${() => kind === 'range' ? `--cb-range-fill:${range().percent}%` : null}"
            disabled="${disabled}" readonly="${readOnly}" required="${required}" aria-label="${accessibleName}"
            oninput="${(event: Event) => { const target = event.currentTarget; if (target instanceof HTMLInputElement) setValue(kind === 'number' || kind === 'range' ? target.valueAsNumber : target.value, event) }}">`

    const primitive = (): Template => {
        if (name === 'stepper') return html`<div part="field-shell stepper">
            <cb-button part="stepper-button decrement-button" exportparts="control:decrement-button-control" icon="minus" icon-only="true" variant="secondary"
                accessible-label="${() => text('decrementLabel')}" disabled="${() => disabled() || readOnly() || Number(source.value) <= number('min')}"
                onaction="${(event: Event) => setValue(Math.max(number('min'), Number(source.value) - number('step')), event)}"></cb-button>
            ${input()}
            <cb-button part="stepper-button increment-button" exportparts="control:increment-button-control" icon="plus" icon-only="true" variant="secondary"
                accessible-label="${() => text('incrementLabel')}" disabled="${() => disabled() || readOnly() || Number(source.value) >= number('max')}"
                onaction="${(event: Event) => setValue(Math.min(number('max'), Number(source.value) + number('step')), event)}"></cb-button>
        </div>`
        if (name === 'unit-input') {
            const unit = source as UnitInputBase
            const units = () => [...unit.normalizedUnits]
            const unitText = () => units().find(option => option.value === unit.selectedUnit)?.label ?? unit.selectedUnit
            return html`<div part="field-shell">${input()}
                <span part="field-affix unit unit-static" aria-hidden="true" hidden="${() => units().length > 1 || !unitText()}">${unitText}</span>
                <cb-select part="unit unit-select" hidden="${() => units().length <= 1}" options="${units}" value="${() => unit.selectedUnit}"
                    accessible-label="${() => text('unitLabel')}" disabled="${disabled}" read-only="${readOnly}"
                    popup-max-width="${() => unit.popupMaxWidth}" popup-max-height="${() => unit.popupMaxHeight}"
                    onchange="${(event: CustomEvent<{ value: string | string[]; originalEvent?: Event }>) => {
                        event.stopPropagation()
                        unit.chooseUnit(Array.isArray(event.detail.value) ? event.detail.value[0] ?? '' : event.detail.value, event.detail.originalEvent ?? event)
                    }}"></cb-select>
            </div>`
        }
        return input()
    }

    const choice = (): Template => html`<label part="choice">
        <input ref="control" part="control choice-control" type="checkbox" class="${name === 'switch' ? 'visual-control' : ''}"
            role="${name === 'switch' ? 'switch' : null}" checked="${() => bool(source.checked) || source.value === true}"
            disabled="${disabled}" required="${required}" aria-label="${accessibleName}"
            onchange="${(event: Event) => { const target = event.currentTarget; if (target instanceof HTMLInputElement) setValue(target.checked, event) }}">
        ${name === 'switch' ? html`<span part="switch-track"><span part="switch-thumb"></span></span>` : ''}
        <span part="choice-label">${label}</span>
    </label>`

    const tokens = (): Template => html`<div part="token-list">${repeat(items, item => html`
        <cb-button part="token item" exportparts="control:token-control" variant="ghost" label="${item.label}" accessible-label="${item.label}"
            pressed="${() => selected(item)}" disabled="${() => disabled() || readOnly() || item.disabled === true}"
            onchange="${(event: Event) => {
                const entry = String(item.value ?? item.id)
                const current = Array.isArray(source.value) ? source.value : scalarText(source.value) ? [scalarText(source.value)] : []
                setValue(current.includes(entry) ? current.filter(value => value !== entry) : [...current, entry], event)
            }}"></cb-button>`, { key: item => item.id, empty: () => html`<span part="empty">${() => scalarText(source.emptyLabel)}</span>` })}</div>`

    const collection = (): Template => {
        const tree = name.includes('tree') || name.includes('layer')
        return html`<div ref="control" part="${kind === 'collaboration' ? 'collaboration list' : 'list collection'}" data-layout="${tree ? 'tree' : 'default'}"
            role="${tree ? 'tree' : 'listbox'}" aria-label="${accessibleName}"
            onkeydown="${(event: KeyboardEvent) => {
                if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
                const container = event.currentTarget
                if (!(container instanceof HTMLElement)) return
                const controls = [...container.querySelectorAll<HTMLElement>('cb-button:not([disabled])')]
                const index = controls.findIndex(control => event.composedPath().includes(control))
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + controls.length) % controls.length
                event.preventDefault(); controls[next]?.focus()
            }}">${repeat(items, item => html`<cb-button part="item row" exportparts="control:item-control" data-bare data-semantic-host
                data-item-id="${item.id}" role="${tree ? 'treeitem' : 'option'}" aria-selected="${() => String(selected(item))}"
                accessible-label="${[item.label, item.description].filter(Boolean).join(' ')}" disabled="${() => disabled() || item.disabled === true}"
                onaction="${(event: Event) => activate(event, item)}">
                <span part="item-main">${tree ? glyph('file', 'item-icon icon') : ''}<span part="item-copy"><span part="item-label">${item.label}</span></span></span>
                ${item.description ? html` <span part="item-description description">${item.description}</span>` : ''}
            </cb-button>`, { key: item => item.id, empty: () => html`<span part="empty" role="status">${() => scalarText(source.emptyLabel)}</span>` })}</div>`
    }

    const display = (): Template => html`<div ref="control" part="display" data-component="${name}" role="group" aria-label="${accessibleName}">
        <div part="display-content">${name === 'badge'
            ? html`<span part="token badge" role="status">${() => value() || label()}</span>`
            : html`<div part="editor-field"><span part="editor-field-label">${label}</span><span part="editor-field-value">${value}</span></div>`}</div>
    </div>`

    const status = (): Template => html`<div part="display status-display" data-component="${name}"><div part="status-card">
        ${name === 'spinner' ? html`<span part="spinner-ring"></span>` : html`<span part="${name === 'empty-state' ? 'empty-illustration' : 'status-icon'}">${glyph(name === 'empty-state' ? 'folder' : name === 'alert' ? 'warning' : name === 'toast' || name === 'banner' ? 'info' : 'bolt')}</span>`}
        <div part="status-content"><output part="value status-title">${() => value() || label()}</output>
            <div part="status-copy" hidden="${() => !scalarText(source.status)}">${() => scalarText(source.status)}</div></div>
        </div>${kind === 'progress' && name !== 'spinner' ? html`<progress part="meter" max="${() => number('max')}" value="${() => number('progress')}"></progress>` : ''}
    </div>`

    const panel = (): Template => html`<section ref="control" part="${kind} panel" data-component="${name}" aria-label="${accessibleName}">
        <header part="panel-header"><span part="panel-title">${label}</span>
            <cb-button part="action" variant="ghost" label="${() => scalarText(source.actionLabel)}" hidden="${() => !scalarText(source.actionLabel)}" disabled="${disabled}" onaction="${(event: Event) => activate(event)}"></cb-button></header>
        <div part="content composed-content"><div part="generated-content"><div part="panel-content">
            ${name === 'card' ? html`<div part="preview-block card-media">${value}</div>` : ''}
            ${repeat(items, field, { key: item => item.id, empty: () => name === 'card' ? '' : html`<div part="preview-block">${() => value() || description()}</div>` })}
        </div></div><slot part="content"></slot></div>
    </section>`

    const file = (): Template => html`<label part="dropzone control">${glyph('upload', 'dropzone-icon icon')}
        <strong part="dropzone-title">${() => text('fileLabel')}</strong><span part="description">${() => text('fileRequirements')}</span>
        <input ref="control" part="control file" type="file" hidden disabled="${() => disabled() || readOnly()}" required="${required}" multiple="${() => bool(source.multiple)}" aria-label="${accessibleName}"
            onchange="${(event: Event) => { const target = event.currentTarget; event.stopPropagation(); if (target instanceof HTMLInputElement) source.setFiles?.([...(target.files ?? [])], event) }}">
    </label>`

    const canvas = (): Template => html`<div ref="control" part="canvas control" data-component="${name}" role="region" tabindex="${() => disabled() ? -1 : 0}" aria-label="${accessibleName}"
        onclick="${(event: Event) => activate(event)}" onkeydown="${(event: KeyboardEvent) => { if (event.key.startsWith('Arrow')) { event.preventDefault(); source.emit('nudge', { direction: event.key, originalEvent: event }) } }}">
        <div part="canvas-stage">${name === 'remote-cursor' ? html`${glyph('cursor', 'cursor-icon icon')}<span part="cursor-label">${() => value() || label()}</span>` : html`<span part="cursor-label">1 ${glyph('comment')}</span>`}</div>
    </div>`

    const body = kind === 'text' || kind === 'textarea' || kind === 'number' || kind === 'range' ? primitive()
        : kind === 'choice' ? choice() : kind === 'tokens' ? tokens() : kind === 'file' ? file()
        : kind === 'collection' || kind === 'collaboration' ? collection() : kind === 'display' ? display()
        : kind === 'status' || kind === 'progress' ? status() : kind === 'canvas' ? canvas() : panel()
    const fieldControl = ['text', 'textarea', 'number', 'range', 'tokens', 'file'].includes(kind)
    return html`<style>${styles}</style><div part="root" data-component="${name}">
        ${fieldControl ? '' : html`<div part="label-row row"><label part="label" hidden="${() => ['choice', 'display', 'panel', 'editor', 'shell'].includes(kind) || !label()}">${label}</label><span part="status" role="status" hidden="${() => !scalarText(source.status)}">${() => scalarText(source.status)}</span></div>`}
        <div part="body">${body}</div>
        ${fieldControl ? '' : html`<p part="description" hidden="${() => !description()}">${description}</p><p part="error" role="alert" hidden="${() => !scalarText(source.error)}">${() => scalarText(source.error)}</p>`}
    </div>`
}
