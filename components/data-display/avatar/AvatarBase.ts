import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { bool, scalarText } from '../../core/value.js'

export type AvatarStatus = 'none' | 'online' | 'idle' | 'busy' | 'offline'

export interface AvatarProps extends UIProps {
    name?: string
    src?: string
    initials?: string
    color?: string
    status?: AvatarStatus
    statusLabel?: string
    decorative?: boolean
}

const avatarStatuses: ReadonlySet<string> = new Set(['none', 'online', 'idle', 'busy', 'offline'])

function firstCharacter(value: string, language?: string): string {
    return Array.from(value.trim())[0]?.toLocaleUpperCase(language) ?? ''
}

function safeImageSource(value: string, base: string): string {
    const source = value.trim()
    if (!source) return ''
    try {
        const url = new URL(source, base)
        if (['http:', 'https:', 'blob:'].includes(url.protocol)) return source
        if (url.protocol === 'data:' && /^data:image\//i.test(source)) return source
    } catch {
        return ''
    }
    return ''
}

/** Headless identity, fallback and presence-state behavior shared by Avatar renderers. */
export abstract class AvatarBase extends UIComponent<AvatarProps> {
    static observedAttributes = [
        ...UIComponent.observedAttributes,
        'name', 'src', 'initials', 'color', 'status', 'status-label', 'decorative',
    ]

    name = ''
    src = ''
    initials = ''
    color = ''
    status: AvatarStatus = 'none'
    statusLabel = ''
    decorative = false

    get avatarInitials(): string {
        const supplied = scalarText(this.initials).trim()
        if (supplied) return Array.from(supplied).slice(0, 3).join('').toLocaleUpperCase(this.documentLanguage())
        const words = scalarText(this.name).trim().split(/\s+/).filter(Boolean)
        if (!words.length) return ''
        const first = firstCharacter(words[0] ?? '', this.documentLanguage())
        const last = words.length > 1 ? firstCharacter(words.at(-1) ?? '', this.documentLanguage()) : ''
        return `${first}${last}`
    }

    get avatarSource(): string { return safeImageSource(scalarText(this.src), this.ownerDocument.baseURI) }
    get avatarLabel(): string {
        const identity = this.accessibleName() || scalarText(this.name) || this.avatarInitials
        const status = this.avatarStatus === 'none' ? '' : this.avatarStatusLabel
        return [identity, status].filter(Boolean).join(', ')
    }
    get avatarStatus(): AvatarStatus { return avatarStatuses.has(this.status) ? this.status : 'none' }
    get avatarStatusLabel(): string { return scalarText(this.statusLabel) }
    get avatarColor(): string { return scalarText(this.color).trim() }
    get avatarDecorative(): boolean { return bool(this.decorative) }
}
