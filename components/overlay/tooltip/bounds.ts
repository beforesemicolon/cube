import type { TooltipAnchor } from './TooltipBase.js'

/** Visible scrollports in the composed tree, in unscaled screen coordinates. */
export const tooltipScrollBoundary = (control: HTMLElement): TooltipAnchor => {
    const view = control.ownerDocument.defaultView
    const visual = view?.visualViewport
    let boundary: TooltipAnchor = {
        left: visual?.offsetLeft ?? 0, top: visual?.offsetTop ?? 0,
        right: (visual?.offsetLeft ?? 0) + (visual?.width ?? view?.innerWidth ?? 0),
        bottom: (visual?.offsetTop ?? 0) + (visual?.height ?? view?.innerHeight ?? 0),
    }
    let parent: Node | null = control.assignedSlot ?? control.parentNode
    while (parent) {
        if (parent instanceof HTMLElement && view) {
            const style = view.getComputedStyle(parent)
            const scrollX = /^(auto|scroll|overlay)$/u.test(style.overflowX)
            const scrollY = /^(auto|scroll|overlay)$/u.test(style.overflowY)
            if (scrollX || scrollY) {
                const rect = parent.getBoundingClientRect()
                const scaleX = parent.offsetWidth ? rect.width / parent.offsetWidth : 1
                const scaleY = parent.offsetHeight ? rect.height / parent.offsetHeight : 1
                const left = rect.left + parent.clientLeft * scaleX, top = rect.top + parent.clientTop * scaleY
                boundary = {
                    left: scrollX ? Math.max(boundary.left, left) : boundary.left,
                    right: scrollX ? Math.min(boundary.right, left + parent.clientWidth * scaleX) : boundary.right,
                    top: scrollY ? Math.max(boundary.top, top) : boundary.top,
                    bottom: scrollY ? Math.min(boundary.bottom, top + parent.clientHeight * scaleY) : boundary.bottom,
                }
            }
        }
        parent = parent instanceof ShadowRoot ? parent.host : parent instanceof HTMLElement && parent.assignedSlot ? parent.assignedSlot : parent.parentNode
    }
    return boundary
}
