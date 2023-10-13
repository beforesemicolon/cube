import { turnCamelToKebabCasing } from '@beforesemicolon/html/dist/utils'
import { replaceCssHost } from './replace-css-host'
import { ObjectLiteral, StylesheetObject } from '../types'
import { TC } from './type-check'

type callback = (str: string | null, declaration?: string) => void

export function JSONToCSS(
    obj: ObjectLiteral,
    tagName: string,
    hasShadowRoot: boolean = true
) {
    const css = Object.keys(obj)
        .map((prop) => createPropertyBody(prop, obj[prop] as ObjectLiteral))
        .join('')
        .trim()

    if (!hasShadowRoot) {
        return replaceCssHost(css, tagName)
    }

    return css
}

function getPropertyCSS(
    prop: string,
    value: StylesheetObject | number | string | ObjectLiteral | unknown,
    parentProp: string,
    cb: callback
) {
    prop = prop.trim()

    value = TC.number(value) ? value + 'px' : value

    if (prop.startsWith('&')) {
        cb(
            null,
            createPropertyBody(
                prop.replace(/&/g, parentProp),
                value as ObjectLiteral
            )
        )
    } else if (prop.startsWith('@')) {
        cb(null, createPropertyBody(prop, value as ObjectLiteral))
    } else if (TC.objectLiteral(value)) {
        if (parentProp.startsWith('@')) {
            cb(createPropertyBody(prop, value as ObjectLiteral))
        } else if (/^[^+~>]/i.test(prop)) {
            const propParts = prop.split(',').map((p) => p.trim())
            const selector = parentProp
                .split(',')
                .map((pp) =>
                    propParts.map((p) => `${pp.trim()} ${p}`).join(', ')
                )
                .join(', ')
                .trim()
            cb(null, createPropertyBody(selector, value as ObjectLiteral))
        }
    } else if (prop.startsWith('--')) {
        // CSS variables
        cb(`${prop}: ${value};`)
    } else {
        cb(`${turnCamelToKebabCasing(prop)}: ${value};`)
    }
}

function createPropertyBody(prop: string, value: ObjectLiteral): string {
    const declarations = []
    let declaration = `${prop} {`

    Object.keys(value).forEach((childProp) =>
        getPropertyCSS(
            childProp,
            value[childProp],
            prop,
            (pair, newDeclaration = '') => {
                if (pair) {
                    declaration += pair
                } else {
                    declarations.push(newDeclaration)
                }
            }
        )
    )

    declaration += '} '

    declarations.unshift(declaration)

    return declarations.join('')
}
