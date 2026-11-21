import assert from 'node:assert/strict'
import { test } from 'node:test'
import { classicSkillBody, expandExportPattern } from '../scripts/ai-example-utils.js'

test('keeps the trusted markup literal and waits for deferred scripts before running generated behavior', () => {
    const trustedMarkup = '<cb-button label="Open"></cb-button>\n<!-- scripts in the app are configured separately -->'
    assert.equal(classicSkillBody({ trustedMarkup, generatedBehavior: '' }), trustedMarkup)
    assert.equal(
        classicSkillBody({ trustedMarkup, generatedBehavior: '\nopenExample()\n' }),
        trustedMarkup + '\n<script>document.addEventListener("DOMContentLoaded", () => {\nopenExample()\n})</script>'
    )
})

test('expands all target wildcards as literal names and preserves exact paths', () => {
    assert.equal(expandExportPattern('./dist/*/*.d.ts', 'button'), './dist/button/button.d.ts')
    assert.equal(expandExportPattern('./dist/*/*.js', '$&'), './dist/$&/$&.js')
    assert.equal(expandExportPattern('./dist/index.js', ''), './dist/index.js')
})
