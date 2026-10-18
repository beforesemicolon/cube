import assert from 'node:assert/strict'
import { readdirSync, readFileSync, type Dirent } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
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
    const callPattern = /(?:\.(?:emit|request)|new CustomEvent)\(([^;\n]*)/g
    const namePattern = /['"](cb-[a-z0-9-]+)['"]/g
    for (const call of source.matchAll(callPattern)) {
        const argumentsSource = call[1] ?? ''
        for (const match of argumentsSource.matchAll(namePattern)) if (match[1]) names.push(match[1])
    }
    return names
}

test('Storybook observes every declared Cube component event', () => {
    const emitted = new Set<string>()
    for (const file of sourceFiles('components')) {
        for (const name of emittedEventNames(readFileSync(file, 'utf8'))) emitted.add(name)
    }
    assert.deepEqual([...cubeEventNames].sort(), [...emitted].sort())
})
