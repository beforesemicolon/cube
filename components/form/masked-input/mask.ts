interface MaskSlot { readonly literal?: string; readonly pattern?: RegExp }

export function maskSlotsFor(mask: string): readonly MaskSlot[] {
    const slots: MaskSlot[] = []
    let escaped = false
    for (const character of mask) {
        if (escaped) { slots.push({ literal: character }); escaped = false; continue }
        if (character === '\\') { escaped = true; continue }
        if (character === '9') slots.push({ pattern: /[0-9]/ })
        else if (character === 'A') slots.push({ pattern: /[A-Za-z]/ })
        else if (character === '*') slots.push({ pattern: /[A-Za-z0-9]/ })
        else slots.push({ literal: character })
    }
    if (escaped) slots.push({ literal: '\\' })
    return slots
}

export function formatMaskedValue(value: string, mask: string): string {
    const slots = maskSlotsFor(mask)
    if (!slots.length) return value
    const input = [...value]
    let inputIndex = 0
    let output = ''
    for (const slot of slots) {
        if (slot.literal !== undefined) {
            if (inputIndex < input.length) output += slot.literal
            if (input[inputIndex] === slot.literal) inputIndex += 1
            continue
        }
        while (inputIndex < input.length) {
            const character = input[inputIndex++] ?? ''
            if (slot.pattern?.test(character)) { output += character; break }
        }
    }
    return output
}

export function unmaskValue(value: string, mask: string): string {
    const formatted = formatMaskedValue(value, mask)
    const slots = maskSlotsFor(mask)
    let result = ''
    let index = 0
    for (const slot of slots) {
        const character = formatted[index]
        if (character === undefined) break
        if (slot.literal !== undefined) { if (character === slot.literal) index += 1; continue }
        if (slot.pattern?.test(character)) result += character
        index += 1
    }
    return result
}
