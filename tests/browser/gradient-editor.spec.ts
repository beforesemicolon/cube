import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

interface GradientStop {
    readonly id: string
    readonly color: string
    readonly position: number
}

interface GradientEditorElement extends HTMLElement {
    value: string
    type: 'linear' | 'radial'
    stops: readonly GradientStop[]
}

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-gradient-editor')))
    await page.evaluate(() => {
        const editor = document.createElement('cb-gradient-editor') as GradientEditorElement & Record<string, string | number | boolean | readonly string[] | readonly GradientStop[]>
        Object.assign(editor, {
            label: 'Gradient', accessibleLabel: 'Edit gradient', type: 'linear', angle: 120, shape: 'circle', extent: 'farthest-corner', position: 'center',
            stops: [{ id: 'blue', color: '#2563eb', position: 0 }, { id: 'violet', color: '#8b5cf6', position: 52 }, { id: 'pink', color: '#ec4899cc', position: 100 }],
            allowAlpha: true, swatches: ['#2563eb', '#8b5cf6', '#ec4899'],
            typeLabel: 'Gradient type', linearLabel: 'Linear', radialLabel: 'Radial', angleLabel: 'Angle', shapeLabel: 'Shape', circleLabel: 'Circle', ellipseLabel: 'Ellipse',
            extentLabel: 'Size', closestSideLabel: 'Closest side', closestCornerLabel: 'Closest corner', farthestSideLabel: 'Farthest side', farthestCornerLabel: 'Farthest corner',
            positionLabel: 'Origin', topLeftLabel: 'Top left', topLabel: 'Top', topRightLabel: 'Top right', leftLabel: 'Left', centerLabel: 'Center', rightLabel: 'Right',
            bottomLeftLabel: 'Bottom left', bottomLabel: 'Bottom', bottomRightLabel: 'Bottom right', stopsLabel: 'Color stops',
            stopLabel: 'Color stop {index} at {position}', addStopLabel: 'Add color stop', removeStopLabel: 'Remove selected color stop',
            helpText: 'Click the color rail to add a stop. Drag or use arrow keys to move it. Double-click a stop, or press Enter, to edit its color.', hueLabel: 'Hue', saturationLabel: 'Saturation',
            brightnessLabel: 'Brightness', alphaLabel: 'Alpha', redLabel: 'Red', greenLabel: 'Green', blueLabel: 'Blue', hexLabel: 'HEX',
            planeLabel: 'Saturation and brightness', samplerLabel: 'Sample color from screen', closeLabel: 'Close color picker',
            swatchesLabel: 'Saved and recent colors', addSwatchLabel: 'Add current color',
            removeSwatchLabel: 'Remove {color} with Delete or Backspace', transparentLabel: 'Transparent',
        })
        document.querySelector('#fixture')?.append(editor)
    })
})

test('combines linear and radial geometry with interactive color stops', async ({ page }) => {
    const editor = page.locator('cb-gradient-editor')
    await expect(editor.locator('cb-unit-input[part~=angle]')).toHaveAttribute('unit', 'deg')
    await editor.getByRole('spinbutton', { name: 'Angle', exact: true }).fill('45')
    await expect.poll(() => editor.evaluate(element => (element as GradientEditorElement).value)).toContain('45deg')
    await expect(editor.locator('[part~="preview-shell"]')).toHaveCount(0)
    await expect(editor.getByRole('slider')).toHaveCount(3)
    await expect(editor.locator('output[part~="value"]')).toHaveCount(0)
    await expect(editor.locator('[part~="stop-position"]')).toHaveCount(0)

    await editor.getByRole('button', { name: 'Add color stop' }).click()
    await expect(editor.getByRole('slider')).toHaveCount(4)
    await expect.poll(() => editor.evaluate(element => (element as GradientEditorElement).stops.length)).toBe(4)

    const selected = editor.getByRole('slider').nth(1)
    await selected.focus()
    const before = await selected.getAttribute('aria-valuenow')
    await selected.press('ArrowRight')
    await expect(selected).not.toHaveAttribute('aria-valuenow', before ?? '')
    await selected.press('Delete')
    await expect(editor.getByRole('slider')).toHaveCount(3)

    await editor.getByRole('radio', { name: 'Radial' }).click()
    await expect(editor.getByRole('button', { name: /^Shape:/ })).toBeVisible()
    await expect(editor.getByRole('button', { name: /^Size:/ })).toBeVisible()
    await expect(editor.getByRole('button', { name: /^Origin:/ })).toBeVisible()
    await expect.poll(() => editor.evaluate(element => (element as GradientEditorElement).value)).toContain('radial-gradient(')
})

test('edits the selected stop with Cube color picker and has no axe violations', async ({ page }) => {
    const editor = page.locator('cb-gradient-editor')
    const first = editor.getByRole('slider').first()
    await first.dblclick()
    await editor.getByLabel('HEX', { exact: true }).fill('#ff000080')
    await expect.poll(() => editor.evaluate(element => (element as GradientEditorElement).stops[0]?.color)).toBe('#ff000080')
    await page.keyboard.press('Escape')
    await expect(first).toBeFocused()

    await first.press('Enter')
    await expect(editor.getByLabel('HEX', { exact: true })).toBeFocused()
    const results = await new AxeBuilder({ page }).include('cb-gradient-editor').analyze()
    expect(results.violations).toEqual([])
})
