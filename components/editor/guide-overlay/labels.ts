export interface LabelBounds { left: number; top: number; right: number; bottom: number }

/** Keep numeric distances compact without rewriting descriptive/custom guide text. */
export function compactGuideLabel(label: string): string {
    const value = label.trim()
    const number = '[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)'
    const distance = `${number}(?:\\s*px)?`
    return new RegExp(`^(?:(?:width|height)\\s*:?\\s*)?${distance}(?:\\s*[·×x]\\s*${distance})*$`, 'i').test(value)
        ? value.replace(/^(?:width|height)\s*:?\s*/i, '').replace(/\s*px\b/gi, '') : label
}

/** Read composed clipping ancestors, including slots, without inspecting component internals. */
export function visibleLabelBounds(host: HTMLElement): LabelBounds {
    const view = host.ownerDocument.defaultView
    const rect = host.getBoundingClientRect(), visual = view?.visualViewport
    const bounds: LabelBounds = {
        left: Math.max(rect.left, visual?.offsetLeft ?? 0),
        top: Math.max(rect.top, visual?.offsetTop ?? 0),
        right: Math.min(rect.right, (visual?.offsetLeft ?? 0) + (visual?.width ?? view?.innerWidth ?? 0)),
        bottom: Math.min(rect.bottom, (visual?.offsetTop ?? 0) + (visual?.height ?? view?.innerHeight ?? 0)),
    }
    let node: Node | null = host.assignedSlot || host.parentNode
    while (node && view) {
        if (node instanceof HTMLElement) {
            const style = view.getComputedStyle(node)
            const clipsX = /^(auto|scroll|hidden|clip)$/.test(style.overflowX)
            const clipsY = /^(auto|scroll|hidden|clip)$/.test(style.overflowY)
            if (clipsX || clipsY) {
                const clip = node.getBoundingClientRect()
                const scaleX = node.offsetWidth ? clip.width / node.offsetWidth : 1
                const scaleY = node.offsetHeight ? clip.height / node.offsetHeight : 1
                const left = clip.left + node.clientLeft * scaleX, top = clip.top + node.clientTop * scaleY
                if (clipsX) { bounds.left = Math.max(bounds.left, left); bounds.right = Math.min(bounds.right, left + node.clientWidth * scaleX) }
                if (clipsY) { bounds.top = Math.max(bounds.top, top); bounds.bottom = Math.min(bounds.bottom, top + node.clientHeight * scaleY) }
            }
        }
        node = node instanceof ShadowRoot ? node.host : node instanceof HTMLElement && node.assignedSlot ? node.assignedSlot : node.parentNode
    }
    return bounds
}
