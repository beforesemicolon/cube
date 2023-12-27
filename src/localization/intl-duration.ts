import { Cube, ShadowRootModeEnum } from '../types'
import { millisecondsToTimeParts } from './utils/milliseconds-to-time-parts'
import { Props, ObjectLiteral } from '@beforesemicolon/web-component'

const allFields = new Set(['second', 'minute', 'hour', 'day', 'month', 'year'])

export interface IntlDurationProps {
    value: number | undefined
    style: 'narrow' | 'short' | 'long'
    fields: '*' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year'
}

export default ({ register, host, template, useContext, TC }: Cube) => {
    const name = new Intl.DisplayNames('en', {
        style: 'long',
        type: 'dateTimeField',
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const list = new Intl.ListFormat('en', {
        style: 'long',
        type: 'conjunction',
    })

    const getText = (
        msg: ObjectLiteral,
        value: number,
        key: string,
        style: IntlDurationProps['style']
    ) => {
        const cubeIntl = msg ? msg['cube-intl'] : null

        if (cubeIntl && cubeIntl[key]) {
            if (style === 'narrow') {
                return cubeIntl[key].narrow
            }

            if (style === 'short') {
                return cubeIntl[key].short
            }

            return value === 1 ? cubeIntl[key].single : cubeIntl[key].plural
        }

        return name.of(key)
    }

    const intlDuration = (
        msgs: ObjectLiteral,
        value: number,
        fields: IntlDurationProps['fields'] = '*',
        style: IntlDurationProps['style'] = 'long'
    ) => {
        if (!TC.number(value) || !TC.string(fields)) {
            console.error(
                "intl.duration: Invalid 'value' or 'fields'. Received: value=",
                value,
                ', fields=',
                fields,
                ''
            )
            return ''
        }

        const parts =
            fields.trim() === '*'
                ? allFields
                : new Set((fields || '').split(/\s+/g).map((s) => s.trim()))
        const tp = millisecondsToTimeParts(value, parts)
        const gap = style === 'narrow' ? '' : ' '

        return list.format([
            ...(parts.has('year') && tp.year
                ? [`${[tp.year]}${gap}${getText(msgs, tp.year, 'year', style)}`]
                : []),
            ...(parts.has('month') && tp.month
                ? [
                      `${[tp.month]}${gap}${getText(
                          msgs,
                          tp.month,
                          'month',
                          style
                      )}`,
                  ]
                : []),
            ...(parts.has('day') && tp.day
                ? [`${[tp.day]}${gap}${getText(msgs, tp.day, 'day', style)}`]
                : []),
            ...(parts.has('hour') && tp.hour
                ? [`${[tp.hour]}${gap}${getText(msgs, tp.hour, 'hour', style)}`]
                : []),
            ...(parts.has('minute') && tp.minute
                ? [
                      `${[tp.minute]}${gap}${getText(
                          msgs,
                          tp.minute,
                          'minute',
                          style
                      )}`,
                  ]
                : []),
            ...(parts.has('second') && tp.second
                ? [
                      `${[tp.second]}${gap}${getText(
                          msgs,
                          tp.second,
                          'second',
                          style
                      )}`,
                  ]
                : []),
        ])
    }

    const IntlDuration = (props: Props<IntlDurationProps>) => {
        const comp = host()
        const msgsctx = useContext<ObjectLiteral>('intl-msg', true)
        const content = comp.textContent

        comp.innerHTML = ''

        const duration = () => {
            return intlDuration(
                msgsctx.value() ?? {},
                Number(props.value() || content),
                props.fields(),
                props.style()
            )
        }

        template`${duration}`
    }

    register<IntlDurationProps>(
        IntlDuration,
        {
            value: undefined,
            style: 'long',
            fields: '*',
        },
        { mode: ShadowRootModeEnum.NONE }
    )

    return intlDuration
}
