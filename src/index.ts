import { Cube } from './types'
import * as cube from './cube'
import initRouter from './router'
import initIntl from './localization'

initRouter(cube as unknown as Cube)
export const intl = initIntl(cube as unknown as Cube)
export { TC } from './utils'
export * from './types'
export * from './cube'
export * from './store'
export * from './config'
export * from './router'
export * from '@beforesemicolon/markup'
