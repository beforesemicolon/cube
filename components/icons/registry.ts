import { iconPaths } from './paths.js'
import { mediaIconPaths } from '../media/icons.js'
import { tablerIconPaths } from './tabler.js'
/** One canonical glyph registry for standalone icons and composed media controls. */
Object.assign(iconPaths,mediaIconPaths,tablerIconPaths)

Object.assign(iconPaths, {
    'arrow-clockwise': iconPaths.reset,
    'bar-chart': 'M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M2 20h20',
    boxes: iconPaths.collection,
    bug: iconPaths.warning,
    calendar2: iconPaths.calendar,
    calendar3: iconPaths.calendar,
    'card-list': iconPaths.collection,
    'chat-left-text': iconPaths.comment,
    'clock-history': iconPaths.clock,
    'diagram-3': iconPaths.workflow,
    'envelope-open': iconPaths.mail,
    'envelope-plus': iconPaths.mailCheck,
    'exclamation-triangle': iconPaths.warning,
    'file-earmark-text': iconPaths.file,
    'folder2-open': iconPaths.folder,
    fonts: iconPaths.text,
    globe2: iconPaths.globe,
    hourglass: 'M6 3h12M6 21h12M7 3c0 4 2 6 5 9-3 3-5 5-5 9M17 3c0 4-2 6-5 9 3 3 5 5 5 9',
    images: iconPaths.image,
    'journal-plus': iconPaths.noteAdd,
    'journal-text': iconPaths.file,
    'link-45deg': iconPaths.link,
    'list-check': iconPaths.checkSquare,
    palette: 'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1-2-2c0-2 2-3 4-3h6a9 9 0 0 0-9-9M7 10h.01M10 7h.01M14 7h.01M17 10h.01',
    pen: iconPaths.edit,
    'people-fill': iconPaths.users,
    'question-circle': iconPaths.help,
    'shield-lock': iconPaths.lock,
    stars: iconPaths.spark,
    translate: 'M4 5h10M9 3v2M6 5c1 4 3 7 7 9M12 5c-1 4-3 7-7 9M14 21l4-10 4 10M16 17h4',
    'ui-checks-grid': iconPaths.checkSquare,
    'wifi-off': iconPaths.wifiOff,
    window: iconPaths.desktop,
    'window-stack': iconPaths.collection,
})
export { iconPaths }
