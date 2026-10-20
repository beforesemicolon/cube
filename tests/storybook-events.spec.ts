import assert from 'node:assert/strict'
import { readdirSync, readFileSync, type Dirent } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { parse } from '@babel/parser'
import { isCallExpression, isIdentifier, isMemberExpression, isNewExpression, isStringLiteral, traverseFast, type Node } from '@babel/types'
import { cubeEventNames } from '../stories/event-names.js'

function sourceFiles(directory: string): string[] {
    const entries: Dirent[] = readdirSync(directory, { withFileTypes: true })
    return entries.flatMap(entry => {
        const path = join(directory, entry.name)
        if (entry.isDirectory()) return sourceFiles(path)
        return entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [path] : []
    })
}

function emittedEventNames(source: string): string[] {
    const names: string[] = []
    const sourceFile = parse(source, { sourceType: 'module', plugins: ['typescript'] })
    const collectNames = (root: Node): void => {
        traverseFast(root, node => {
            if (isStringLiteral(node) && /^[a-z][a-z0-9-]*$/.test(node.value)) names.push(node.value)
        })
    }
    traverseFast(sourceFile, node => {
        const isSemanticCall = isCallExpression(node)
            && isMemberExpression(node.callee)
            && isIdentifier(node.callee.property)
            && (node.callee.property.name === 'emit' || node.callee.property.name === 'request')
        const isCustomEvent = isNewExpression(node) && isIdentifier(node.callee, { name: 'CustomEvent' })
        if ((isSemanticCall || isCustomEvent) && node.arguments?.[0]) collectNames(node.arguments[0])
    })
    return names
}

test('Storybook observes every declared Cube component event', () => {
    // List uses the host's native scroll event instead of redispatching a
    // duplicate CustomEvent. Include that explicitly alongside semantic events.
    const emitted = new Set<string>(['scroll'])
    for (const file of sourceFiles('components')) {
        for (const name of emittedEventNames(readFileSync(file, 'utf8'))) emitted.add(name)
    }
    assert.deepEqual([...cubeEventNames].sort(), [...emitted].sort())
})
