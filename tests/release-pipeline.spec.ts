import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

interface PackageManifest { readonly scripts: Readonly<Record<string, string>> }
const manifest: PackageManifest = JSON.parse(readFileSync('package.json', 'utf8'))

test('the release gate builds generated artifacts before checking or consuming them', () => {
    const commands = manifest.scripts['verify:release'].split('&&').map(command => command.trim())
    const requires = (consumer: string, producer: string): void => {
        const producerIndex = commands.indexOf(`npm run ${producer}`)
        const consumerIndex = commands.indexOf(`npm run ${consumer}`)
        assert(producerIndex >= 0, `Missing release step: ${producer}`)
        assert(consumerIndex >= 0, `Missing release step: ${consumer}`)
        assert(producerIndex < consumerIndex, `${producer} must run before ${consumer}, including on a clean checkout`)
    }
    requires('test:exports', 'build:package')
    requires('test:catalog', 'build:storybook')
    requires('build:docs', 'build:package')
    requires('test:browser', 'build:storybook')
    requires('test:pack', 'build:package')
    requires('test:pack', 'test:browser')
})

test('CI and the prepublish hook invoke the same complete release gate', () => {
    assert.equal(manifest.scripts['prepublishOnly'], 'npm run verify:release')
    assert.match(readFileSync('.github/workflows/cube.yml', 'utf8'), /run:\s+npm run verify:release\s*(?:\n|$)/)
})
