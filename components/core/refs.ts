/** Live Markup refs in document order, including nodes from keyed child templates. */
export function elementRefs(nodes: readonly Element[] | undefined): HTMLElement[] {
    return (nodes ?? []).filter((node): node is HTMLElement => node instanceof HTMLElement)
        .sort((left, right) => left === right ? 0 : left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
}
