import { Cube, ShadowRootModeEnum } from '../types'
import { Props } from '@beforesemicolon/web-component'
import {
    ONE_HOUR_MS,
    ONE_MINUTE_MS,
    ONE_SECOND_MS,
    ONE_DAY_MS,
} from './utils/time-in-miliseconds'
import { config } from '../config'

type RelUnit =
    | 'year'
    | 'years'
    | 'quarter'
    | 'quarters'
    | 'month'
    | 'months'
    | 'week'
    | 'weeks'
    | 'day'
    | 'days'
    | 'hour'
    | 'hours'
    | 'minute'
    | 'minutes'
    | 'second'
    | 'seconds'

export interface IntlRelTimeProps {
    live: boolean
    showDecimals: false
    value: number | undefined
    style: 'long' | 'short' | 'narrow' | undefined
    numeric: boolean
    unit: 'auto' | RelUnit
    locale: string | undefined
}

const getUpdateIntervalByUnit = (unit: IntlRelTimeProps['unit']) => {
    switch (unit) {
        case 'hours':
        case 'hour':
            return ONE_HOUR_MS
        case 'minutes':
        case 'minute':
            return ONE_MINUTE_MS
        case 'seconds':
        case 'second':
            return ONE_SECOND_MS
        default:
            return null
    }
}

const getUnitAndValue = (
    milliseconds: number,
    precision = 0
): {
    val: number
    unit: RelUnit
    interval: number | null
} => {
    const inThePast = milliseconds < 0 ? -1 : 1
    milliseconds = Math.abs(milliseconds)
    const days = Number((milliseconds / ONE_DAY_MS).toFixed(precision))

    if (days < 1) {
        if (milliseconds < ONE_MINUTE_MS) {
            return {
                val:
                    Number((milliseconds / ONE_SECOND_MS).toFixed(precision)) *
                    inThePast,
                unit: 'seconds',
                interval: getUpdateIntervalByUnit('seconds'),
            }
        }

        const hours = milliseconds / (ONE_MINUTE_MS * 60)

        if (hours < 1) {
            return {
                val:
                    Number((milliseconds / ONE_MINUTE_MS).toFixed(precision)) *
                    inThePast,
                unit: 'minutes',
                interval: getUpdateIntervalByUnit('minutes'),
            }
        }

        return {
            val: Number(hours.toFixed(precision)) * inThePast,
            unit: 'hours',
            interval: getUpdateIntervalByUnit('hours'),
        }
    }

    if (days < 7) {
        return {
            val: days * inThePast,
            unit: days === 1 ? 'day' : 'days',
            interval: null,
        }
    }

    if (days < 30) {
        return {
            val: Number((days / 7).toFixed(precision)) * inThePast,
            unit: days === 7 ? 'week' : 'weeks',
            interval: null,
        }
    }

    if (days < 365) {
        return {
            val: Number((days / 30).toFixed(precision)) * inThePast, // average a month to 30 days
            unit: days === 30 ? 'month' : 'months',
            interval: null,
        }
    }

    return {
        val: Number((days / 365).toFixed(precision)) * inThePast,
        unit: days === 365 ? 'year' : 'years',
        interval: null,
    }
}

export default ({ register, host, template, state, onMount, TC }: Cube) => {
    const defaultProps: IntlRelTimeProps = {
        locale: undefined,
        showDecimals: false,
        live: false,
        value: undefined,
        numeric: false,
        style: 'long',
        unit: 'auto',
    }

    const intlRelTime = (
        locale: string,
        value: number,
        opt: Partial<
            Omit<IntlRelTimeProps, 'locale' | 'value' | 'live'>
        > = defaultProps
    ) => {
        if (!TC.number(value)) {
            console.error('intl-rel-time: invalid value', value)
            return ''
        }

        opt = { ...defaultProps, ...opt }

        const precision = opt.showDecimals ? 1 : 0
        const relative = new Intl.RelativeTimeFormat(locale, {
            style: opt.style,
            numeric: opt.numeric ? 'always' : 'auto',
        })

        if (opt.unit === 'auto') {
            const rel = getUnitAndValue(value - Date.now(), precision)

            return relative.format(rel.val, rel.unit)
        }

        return relative.format(
            Number(value.toFixed(precision)),
            opt.unit as RelUnit
        )
    }

    const IntlRelTime = (props: Props<IntlRelTimeProps>) => {
        const comp = host()
        const locale = new Intl.Locale(
            document.documentElement.lang || config.lang
        )
        const [time, setTime] = state('')
        let interval: ReturnType<typeof setTimeout>
        const content = comp.textContent

        comp.innerHTML = ''

        const getTime = (): {
            value: string | null
            interval: number | null
        } => {
            const value = Number(props.value() || content || 0)

            if (!value) {
                return { value: null, interval: null }
            }

            const precision = props.showDecimals() ? 1 : 0
            const relative = new Intl.RelativeTimeFormat(
                props.locale() || locale.language,
                {
                    style: props.style(),
                    numeric: props.numeric() ? 'always' : 'auto',
                }
            )

            if (props.unit() === 'auto') {
                const rel = getUnitAndValue(value - Date.now(), precision)

                return {
                    value: relative.format(rel.val, rel.unit),
                    interval: rel.interval,
                }
            }

            return {
                value: relative.format(
                    Number(value.toFixed(precision)),
                    props.unit() as RelUnit
                ),
                interval: getUpdateIntervalByUnit(props.unit()),
            }
        }

        const updateTime = () => {
            const time = getTime()
            time.value && setTime(time.value)

            if (time.interval) {
                interval = setTimeout(updateTime, time.interval)
            }
        }

        onMount(() => {
            if (props.live()) {
                interval = setTimeout(updateTime, 0)

                return () => {
                    clearInterval(interval)
                }
            } else {
                const time = getTime()
                time.value && setTime(time.value)
            }
        })

        template`${time}`
    }

    register<IntlRelTimeProps>(IntlRelTime, defaultProps, {
        mode: ShadowRootModeEnum.NONE,
    })

    return intlRelTime
}
