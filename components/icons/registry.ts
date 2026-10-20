import { iconPaths } from './paths.js'
import { mediaIconPaths } from '../media/icons.js'
import { tablerIconPaths } from './tabler.js'
/** One canonical glyph registry for standalone icons and composed media controls. */
Object.assign(iconPaths,mediaIconPaths,tablerIconPaths)
export { iconPaths }
