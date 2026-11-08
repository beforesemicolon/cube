import type { TableBase, TableCellContent, TableCellRenderable } from './TableBase.js'

/** Mounts consumer-supplied nodes and renderables into the table's cell templates. */
export class TableCellMounts {
    private readonly mountedCellContent = new Map<
        HTMLElement,
        { content: TableCellContent; cleanup?: () => void }
    >()

    constructor(private readonly onError: TableBase['onError']) {}

    retain(containers: ReadonlySet<HTMLElement>): void {
        for (const container of this.mountedCellContent.keys())
            if (!containers.has(container)) this.clear(container)
    }

    dispose(): void {
        for (const container of this.mountedCellContent.keys()) this.clear(container)
    }

    mount(
        container: HTMLElement,
        content: TableCellContent
    ): void {
        const previous = this.mountedCellContent.get(container)
        if (previous?.content === content) return
        this.clear(container)
        if (content === null || content === undefined) {
            container.replaceChildren()
            return
        }
        if (content instanceof Node) {
            container.replaceChildren(content)
            this.mountedCellContent.set(container, { content })
            return
        }
        if (this.isCellRenderable(content)) {
            try {
                container.replaceChildren()
                content.render(container)
                this.mountedCellContent.set(container, {
                    content,
                    cleanup:
                        typeof content.unmount === 'function'
                            ? () => {
                                  content.unmount?.()
                              }
                            : undefined,
                })
            } catch (error) {
                this.onError(error)
                container.replaceChildren()
            }
            return
        }
        container.textContent = String(content)
        this.mountedCellContent.set(container, { content })
    }
    private clear(container: HTMLElement): void {
        const mounted = this.mountedCellContent.get(container)
        if (mounted?.cleanup)
            try {
                mounted.cleanup()
            } catch (error) {
                this.onError(error)
            }
        this.mountedCellContent.delete(container)
        container.replaceChildren()
    }
    private isCellRenderable(
        content: TableCellContent
    ): content is TableCellRenderable {
        return (
            typeof content === 'object' &&
            content !== null &&
            'render' in content &&
            typeof content.render === 'function'
        )
    }
}
