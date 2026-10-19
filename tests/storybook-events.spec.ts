import assert from 'node:assert/strict'
import { readdirSync, readFileSync, type Dirent } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import * as ts from 'typescript'
import { cubeEventNames } from '../stories/event-names.js'

function sourceFiles(directory: string): string[] {
    const entries: Dirent[] = readdirSync(directory, { withFileTypes: true })
    return entries.flatMap(entry => {
        const path = join(directory, entry.name)
        if (entry.isDirectory()) return sourceFiles(path)
        return entry.isFile() && entry.name.endsWith('.ts') ? [path] : []
    })
}

function emittedEventNames(source: string): string[] {
    const names: string[] = []
    const sourceFile = ts.createSourceFile('component.ts', source, ts.ScriptTarget.Latest, true)
    const collectNames = (node: ts.Node): void => {
        if (ts.isStringLiteral(node) && /^[a-z][a-z0-9-]*$/.test(node.text)) names.push(node.text)
        else ts.forEachChild(node, collectNames)
    }
    const visit = (node: ts.Node): void => {
        const isSemanticCall = ts.isCallExpression(node)
            && ts.isPropertyAccessExpression(node.expression)
            && (node.expression.name.text === 'emit' || node.expression.name.text === 'request')
        const isCustomEvent = ts.isNewExpression(node)
            && ts.isIdentifier(node.expression)
            && node.expression.text === 'CustomEvent'
        if ((isSemanticCall || isCustomEvent) && node.arguments?.[0]) collectNames(node.arguments[0])
        ts.forEachChild(node, visit)
    }
    visit(sourceFile)
    return names
}

test('Storybook observes every declared Cube component event', () => {
    const emitted = new Set<string>()
    for (const file of sourceFiles('components')) {
        for (const name of emittedEventNames(readFileSync(file, 'utf8'))) emitted.add(name)
    }
    assert.deepEqual([...cubeEventNames].sort(), [...emitted].sort())
})
