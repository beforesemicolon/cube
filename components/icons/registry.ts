import { iconPaths } from './paths.js'
import { mediaIconPaths } from '../media/icons.js'
import { tablerIconPaths } from './tabler.js'
/** One canonical glyph registry for standalone icons and composed media controls. */
Object.assign(iconPaths, mediaIconPaths, tablerIconPaths)

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
    hourglass:
        'M6 3h12M6 21h12M7 3c0 4 2 6 5 9-3 3-5 5-5 9M17 3c0 4-2 6-5 9 3 3 5 5 5 9',
    images: iconPaths.image,
    'journal-plus': iconPaths.noteAdd,
    'journal-text': iconPaths.file,
    'link-45deg': iconPaths.link,
    'list-check': iconPaths.checkSquare,
    palette:
        'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1-2-2c0-2 2-3 4-3h6a9 9 0 0 0-9-9M7 10h.01M10 7h.01M14 7h.01M17 10h.01',
    pen: iconPaths.edit,
    'people-fill': iconPaths.users,
    'question-circle': iconPaths.help,
    'shield-lock': iconPaths.lock,
    speedometer2:
        'M3 15a9 9 0 1 1 18 0M12 6v2M6.34 8.34l1.42 1.42M17.66 8.34l-1.42 1.42M12 15l4-4M12 15h.01',
    stars: iconPaths.spark,
    translate:
        'M4 5h10M9 3v2M6 5c1 4 3 7 7 9M12 5c-1 4-3 7-7 9M14 21l4-10 4 10M16 17h4',
    'ui-checks-grid': iconPaths.checkSquare,
    'wifi-off': iconPaths.wifiOff,
    window: iconPaths.desktop,
    'window-stack': iconPaths.collection,
    'moon-stars-fill':
        'M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278 M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z',
    'circle-half': 'M8 15A7 7 0 1 0 8 1zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16',
    'sun-fill':
        'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708',
})

export const filledIconNames = new Set([
    'moon-stars-fill',
    'circle-half',
    'sun-fill',
])

export const iconViewBoxes: Readonly<Record<string, string>> = {
    'moon-stars-fill': '0 0 16 16',
    'circle-half': '0 0 16 16',
    'sun-fill': '0 0 16 16',
}
export { iconPaths }
