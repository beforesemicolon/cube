import { Cube, ShadowRootModeEnum } from '../types'
import { config } from '../config'
import { Props, ObjectLiteral } from '@beforesemicolon/web-component'

interface IntlLocaleProps {
    src: string
    srcDir: string
}

export default ({ register, template, onMount, createContext }: Cube) => {
    let messages: ObjectLiteral = {
        'cube-intl': {
            year: {
                single: 'year',
                plural: 'years',
                narrow: 'yr',
                short: 'year',
            },
            month: {
                single: 'month',
                plural: 'months',
                narrow: 'm',
                short: 'month',
            },
            week: {
                single: 'week',
                plural: 'weeks',
                narrow: 'week',
                short: 'week',
            },
            day: { single: 'day', plural: 'days', narrow: 'day', short: 'day' },
            hour: { single: 'hour', plural: 'hours', narrow: 'h', short: 'hr' },
            minute: {
                single: 'minute',
                plural: 'minutes',
                narrow: 'min',
                short: 'min',
            },
            second: {
                single: 'second',
                plural: 'seconds',
                narrow: 's',
                short: 'sec',
            },
            millisecond: {
                single: 'millisecond',
                plural: 'milliseconds',
                narrow: 'ms',
                short: 'mils',
            },
            nanosecond: {
                single: 'nanosecond',
                plural: 'nanoseconds',
                narrow: 'ns',
                short: 'nano',
            },
            plural: {
                other: 'th',
                zero: 'th',
                one: 'st',
                two: 'nd',
                few: 'rd',
                many: 'th',
            },
        },
    }

    const IntlLocale = (props: Props<IntlLocaleProps>) => {
        const msgs = createContext<ObjectLiteral | null>('intl-msg', null)

        onMount(() => {
            if (props.src()) {
                fetch(new URL(props.src(), location.origin).href)
                    .then((res) => {
                        if (res.status === 200) {
                            return res.json()
                        }

                        throw new Error(
                            `[intl-locale] Loading "${props.src()}" locale messages failed with status code ${
                                res.status
                            }`
                        )
                    })
                    .then((data) => {
                        messages = { ...messages, ...data }
                        msgs.update(messages)
                    })
                    .catch(console.error)
            } else if (props.srcDir()) {
                const lang = document.documentElement.lang || config.lang
                const src = `${props.srcDir().replace(/\/$/, '')}/${lang}.json`

                fetch(new URL(src, location.origin).href)
                    .then((res) => {
                        if (res.status === 200) {
                            return res.json()
                        }

                        throw new Error(
                            `[intl-locale] Loading "${src}" locale messages failed with status code ${res.status}`
                        )
                    })
                    .then((data) => {
                        messages = { ...messages, ...data }
                        msgs.update(messages)
                    })
                    .catch(console.error)
            }
        })

        template`<slot></slot>`
    }

    register<IntlLocaleProps>(
        IntlLocale,
        {
            src: '',
            srcDir: './',
        },
        { mode: ShadowRootModeEnum.NONE }
    )

    return {
        get messages() {
            return messages
        },
        get lang() {
            return document.documentElement.lang || config.lang
        },
    }
}
