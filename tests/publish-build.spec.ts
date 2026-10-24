import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'
import { publishBuild } from '../scripts/publish-build.js'

test('completed builds publish styles and new dependencies before changed component entrypoints', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'cube-publish-test-'))
    const output = resolve(directory, 'dist'), staging = resolve(directory, 'staging')
    try {
        await mkdir(output); await mkdir(staging)
        await writeFile(resolve(output, 'index.js'), 'export const previous = true')
        await writeFile(resolve(output, 'obsolete.js'), 'obsolete')
        await writeFile(resolve(output, 'unchanged.js'), 'unchanged')
        const unchanged = await stat(resolve(output, 'unchanged.js'))
        await writeFile(resolve(staging, 'index.js'), 'import stylesheet from "./styles.css.js"; export {stylesheet}')
        await writeFile(resolve(staging, 'styles.css.js'), 'export default ":host{display:block}"')
        await writeFile(resolve(staging, 'dependency.js'), 'export const dependency = true')
        await writeFile(resolve(staging, 'unchanged.js'), 'unchanged')
        const published = await publishBuild(staging, output)
        assert.deepEqual(published, ['styles.css.js', 'dependency.js', 'index.js'])
        assert.equal((await stat(resolve(output, 'unchanged.js'))).mtimeMs, unchanged.mtimeMs)
        assert.equal(await readFile(resolve(output, 'index.js'), 'utf8'), await readFile(resolve(staging, 'index.js'), 'utf8'))
        assert.deepEqual((await readdir(output)).sort(), ['dependency.js', 'index.js', 'styles.css.js', 'unchanged.js'])
        assert.deepEqual(await publishBuild(staging, output), [])
    } finally { await rm(directory, { recursive: true, force: true }) }
})

test('missing or failed staging does not delete the last working distribution', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'cube-publish-failure-'))
    try {
        const output = resolve(directory, 'dist')
        await mkdir(output)
        await writeFile(resolve(output, 'index.js'), 'working')
        await assert.rejects(publishBuild(resolve(directory, 'missing'), output), { code: 'ENOENT' })
        assert.equal(await readFile(resolve(output, 'index.js'), 'utf8'), 'working')
    } finally { await rm(directory, { recursive: true, force: true }) }
})
