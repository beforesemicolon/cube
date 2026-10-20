export function aria(node: Element, name: string, value: string | number | boolean | null | undefined): void {
    if(value === null || value === undefined || value === '')node.removeAttribute(name); else node.setAttribute(name,String(value))
}

export function label(node: HTMLElement, value: string): void { node.setAttribute('aria-label', value); node.title = value }
