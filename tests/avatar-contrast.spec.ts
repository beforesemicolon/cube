import { test } from 'node:test'
import assert from 'node:assert/strict'
import { avatarContrastForeground } from '../components/data-display/avatar/contrast.js'

test('avatar fallback selects readable foregrounds for caller colors', () => {
    assert.equal(avatarContrastForeground(17, 110, 208), '#ffffff')
    assert.equal(avatarContrastForeground(0, 129, 41), '#ffffff')
    assert.equal(avatarContrastForeground(255, 255, 255), '#000000')
    assert.equal(avatarContrastForeground(0, 0, 0), '#ffffff')
})

test('avatar fallback maintains at least 4.5:1 contrast across sRGB samples', () => {
    const linear = (channel: number) => (channel / 255 <= 0.04045 ? channel / 255 / 12.92 : ((channel / 255 + .055) / 1.055) ** 2.4)
    for (let red = 0; red < 256; red += 17) for (let green = 0; green < 256; green += 17) for (let blue = 0; blue < 256; blue += 17) {
        const luminance = .2126 * linear(red) + .7152 * linear(green) + .0722 * linear(blue)
        const foreground = avatarContrastForeground(red, green, blue)
        const ratio = foreground === '#ffffff' ? 1.05 / (luminance + .05) : (luminance + .05) / .05
        assert.ok(ratio >= 4.5, `${red},${green},${blue}: ${ratio}`)
    }
})
