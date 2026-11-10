import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { preview } from 'vite'

const site = resolve('website')
const routes = new Map<string, { target: string; status: number }>()
for (const line of readFileSync(resolve(site, '_redirects'), 'utf8').split('\n')) {
    const [from, to, status] = line.trim().split(/\s+/)
    if (from?.startsWith('/') && to?.startsWith('/') && ['200', '301'].includes(status)) {
        routes.set(from, { target: to, status: Number(status) })
    }
}
const localePrefix = routes.get('/*')?.target.replace(/:splat$/, '') ?? ''

const server = await preview({
    configFile: false,
    appType: 'mpa',
    build: { outDir: site },
    preview: { host: '127.0.0.1', port: 8080, strictPort: true },
    plugins: [{
        name: 'site-builder-routes',
        configurePreviewServer({ middlewares }) {
            middlewares.use((request, response, next) => {
                const { pathname, search } = new URL(request.url ?? '/', 'http://127.0.0.1')
                // Keep generated docs routes and give top-level assets precedence over locale assets.
                const route = routes.get(pathname) ?? routes.get(pathname + '/')
                const localized = localePrefix + pathname.slice(1)
                if (route?.status === 301) {
                    response.writeHead(301, { Location: route.target + search }).end()
                    return
                }
                if (route) request.url = route.target + search
                else if (localePrefix && !existsSync(resolve(site, '.' + pathname)) &&
                    existsSync(resolve(site, '.' + localized))) {
                    request.url = localized + search
                }
                next()
            })
        },
    }],
})
server.printUrls()
