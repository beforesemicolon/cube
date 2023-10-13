import { Cube } from './types'
import * as cube from './cube'
import initRouter from './router'
import initIntl from './localization'

initRouter(cube as unknown as Cube)
export const intl = initIntl(cube as unknown as Cube)
export * from './types'
export * from './cube'
export * from './store'
export * from './config'
export { TC } from './utils'
export {
    replacePage,
    goToPage,
    previousPage,
    nextPage,
    onPageChange,
} from './router'
export {
    when,
    repeat,
    html,
    HtmlTemplate,
    element,
    state,
    effect,
} from '@beforesemicolon/html'
