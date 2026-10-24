import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

async function filesIn(root: string): Promise<string[]> {
    const entries = await readdir(root, { withFileTypes: true, recursive: true })
    return entries.filter(entry => entry.isFile()).map(entry => relative(root, join(entry.parentPath, entry.name)))
}

/** Publish a completed build without removing modules a running consumer uses. */
export async function publishBuild(staging: string, destination: string): Promise<readonly string[]> {
    await mkdir(destination, { recursive: true })
    const previous = new Set(await filesIn(destination))
    const files = await filesIn(staging)
    // Styles first, then new dependencies, then changed entrypoints. In
    // particular, Vite must never see a new CSS import before its module exists.
    const priority = (file: string): number => file.endsWith('.css.js') ? 0 : !previous.has(file) ? 1 : file.endsWith('index.js') ? 3 : 2
    files.sort((left, right) => priority(left) - priority(right) || left.localeCompare(right))
    const published: string[] = []
    for (const file of files) {
        const target = join(destination, file)
        const content = await readFile(join(staging, file))
        if (previous.has(file) && content.equals(await readFile(target))) continue
        await mkdir(dirname(target), { recursive: true })
        const temporary = join(dirname(target), `.cube-publish-${randomUUID()}`)
        try {
            await writeFile(temporary, content)
            await rename(temporary, target)
        } finally { await rm(temporary, { force: true }) }
        published.push(file)
    }
    // Prune only after all replacement modules exist. A failed build never
    // reaches publication, so it leaves the last working package untouched.
    const current = new Set(files)
    for (const file of previous) if (!current.has(file)) await rm(join(destination, file))
    return published
}
