let nextId = 0
export function uid(prefix = 'cb'): string { return `${prefix}-${++nextId}` }
