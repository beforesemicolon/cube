import { TC } from './type-check'

const isObjectLiteralOrArray = (value: unknown) =>
    TC.objectLiteral(value) || TC.array(value)

/**
 * merge object literal or array in place unless newObj is true (false by default)
 * @param a
 * @param b
 * @param newObj
 */
export function mergeObjects(a: object, b: object, newObj = false) {
    if (!isObjectLiteralOrArray(a) || !isObjectLiteralOrArray(b)) return b ?? a

    if (newObj) {
        a = TC.array(a) ? [...a] : { ...a }
    }

    for (const key in b) {
        if (b.hasOwnProperty(key)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            a[key] = mergeObjects(a[key], b[key])
        }
    }

    return a
}
