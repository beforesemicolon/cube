import { Cube } from '../types'
import { config } from '../config'
import { Props, ObjectLiteral } from '@beforesemicolon/web-component'

export interface PluralRules {
    other: string
    zero: string
    one: string
    two: string
    few: string
    many: string
}

export interface IntlPluralProps extends PluralRules {
    value: number | undefined
    type: 'cardinal' | 'ordinal' | undefined
    locale: string | undefined
}

export default ({ register, host, template, html, useContext, TC }: Cube) => {
    const defaultPlurals: PluralRules = {
        other: '',
        zero: '',
        one: '',
        two: '',
        few: '',
        many: '',
    }
    const intlPlural = (
        msgs: ObjectLiteral,
        locale: string,
        value: number,
        rules: Partial<PluralRules> = defaultPlurals,
        type: IntlPluralProps['type'] = 'cardinal'
    ) => {
        if (!TC.number(value)) {
            console.error('intl-plural: invalid value', value)
            return ''
        }

        rules = { ...defaultPlurals, ...msgs['cube-intl'].plural, ...rules }
        const pr = new Intl.PluralRules(locale, { type })
        const sel = pr.select(value)

        if (type === 'ordinal') {
            return `${value}${rules[sel]}`
        }

        return rules[sel]
    }

    const IntlPlural = (props: Props<IntlPluralProps>) => {
        const comp = host()
        const locale = new Intl.Locale(
            document.documentElement.lang || config.lang
        )
        const msgsctx = useContext<ObjectLiteral>('intl-msg', true)
        const content = comp.textContent

        const plural = () => {
            const value = Number(props.value() ?? content)

            if (!TC.number(value)) {
                return ''
            }

            const pr = new Intl.PluralRules(props.locale() || locale.language, {
                type: props.type(),
            })
            const msg = msgsctx.value()
            const cubeIntl = msg ? (msg['cube-intl'] as ObjectLiteral) : null
            const sel = pr.select(value)
            const val = props[sel]() || cubeIntl?.plural[sel] || ''

            if (props.type() === 'ordinal') {
                return html`${value}<slot name="${sel}">${val}</slot>`
            }

            return val || value
        }

        template`${plural}`
    }

    register<IntlPluralProps>(IntlPlural, {
        locale: undefined,
        value: undefined,
        other: '',
        zero: '',
        one: '',
        two: '',
        few: '',
        many: '',
        type: 'cardinal',
    })

    return intlPlural
}
