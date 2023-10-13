import { Cube, ObjectLiteral } from '../types'
import initLocale from './intl-locale'
import initMsg from './intl-msg'
import initDate, { IntlDatetimeProps } from './intl-datetime'
import initDuration, { IntlDurationProps } from './intl-duration'
import initList, { IntlListProps } from './intl-list'
import initName, { IntlNameProps } from './intl-name'
import initNumber, { IntlNumberProps } from './intl-number'
import initPlural, { IntlPluralProps, PluralRules } from './intl-plural'
import initRelTime, { IntlRelTimeProps } from './intl-rel-time'

export default (cube: Cube) => {
    const locale = initLocale(cube)
    const intlMsg = initMsg(cube)
    const intlNumber = initNumber(cube)
    const intlName = initName(cube)
    const intlList = initList(cube)
    const intlDatetime = initDate(cube)
    const intlDuration = initDuration(cube)
    const intlPlural = initPlural(cube)
    const intlRelTime = initRelTime(cube)

    return {
        get lang() {
            return locale.lang
        },
        msg: (id: string, values: ObjectLiteral = {}) => {
            if (
                cube.TC.string(id) &&
                !cube.TC.empty(id) &&
                cube.TC.objectLiteral(values)
            ) {
                return intlMsg(locale.messages, id, values)
            }
            console.error(
                `invalid arguments for intl.msg. Found id of "${id}" (must be a non-empty string) and values of "${values}" (must be a object literal)`
            )
            return ''
        },
        datetime: (
            value: string | number,
            options?: Omit<IntlDatetimeProps, 'value' | 'locale'>
        ) => intlDatetime(locale.lang, value, options),
        duration: (
            value: number,
            fields?: IntlDurationProps['fields'],
            style?: IntlDurationProps['style']
        ) => intlDuration(locale.messages, value, fields, style),
        list: (
            items: IntlListProps['items'],
            type?: IntlListProps['type'],
            style?: IntlListProps['style']
        ) => intlList(locale.lang, items, type, style),
        number: (
            value: number,
            options?: Omit<IntlNumberProps, 'value' | 'locale'>
        ) => intlNumber(locale.lang, value, options),
        name: (
            value: IntlNameProps['value'],
            type?: IntlNameProps['type'],
            style?: IntlNameProps['style']
        ) => intlName(locale.lang, value, type, style),
        plural: (
            value: number,
            rules?: PluralRules,
            type?: IntlPluralProps['type']
        ) => intlPlural(locale.messages, locale.lang, value, rules, type),
        relTime: (
            value: number,
            options: Omit<IntlRelTimeProps, 'locale' | 'value' | 'live'>
        ) => intlRelTime(locale.lang, value, options),
    }
}
