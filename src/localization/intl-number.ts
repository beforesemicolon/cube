import { Cube, ShadowRootModeEnum } from '../types'
import { config } from '../config'
import { conditionalField } from './utils/conditional-field'
import { Props } from '@beforesemicolon/web-component'

export interface IntlNumberProps {
    value: number
    locale: string | undefined
    type: 'decimal' | 'currency' | 'percent' | 'unit'
    // display
    groupingStyle: 'always' | 'auto' | false | 'min2' | true | undefined
    signDisplay: 'auto' | 'always' | 'exceptZero' | 'never' | undefined
    notation: 'scientific' | 'standard' | 'engineering' | 'compact' | undefined
    system: string | undefined
    // currency
    currency: string | undefined
    currencyDisplay: 'symbol' | 'narrowSymbol' | 'code' | 'name' | undefined
    currencySign: 'accounting' | 'standard' | undefined
    // unit | https://unicode.org/reports/tr35/tr35-general.html#Example_Units
    unit: string | undefined
    unitStyle: 'long' | 'short' | 'narrow' | undefined
    // rounding
    rounding:
        | 'ceil'
        | 'floor'
        | 'expand'
        | 'trunc'
        | 'halfCeil'
        | 'halfFloor'
        | 'halfTrunc'
        | 'halfEven'
        | undefined
    roundingInc:
        | 1
        | 2
        | 5
        | 10
        | 20
        | 25
        | 50
        | 100
        | 200
        | 250
        | 500
        | 1000
        | 2000
        | 2500
        | 5000
        | undefined
    minDigits: number | undefined
    significantDigits: string | undefined // how many total digits will be displayed
    decimalDigits: string | undefined // how many decimal digits will be displayed
}

export default ({ register, host, template, TC }: Cube) => {
    const defaultProps: IntlNumberProps = {
        value: 0,
        type: 'decimal',
        currency: undefined,
        currencyDisplay: 'narrowSymbol',
        currencySign: undefined,
        signDisplay: undefined,
        notation: undefined,
        system: undefined,
        unit: undefined,
        unitStyle: 'narrow',
        groupingStyle: 'auto',
        rounding: undefined,
        roundingInc: undefined,
        locale: undefined,
        minDigits: undefined,
        significantDigits: undefined,
        decimalDigits: undefined,
    }
    const splitNumberString = (str: string): Array<number | undefined> => {
        const [a, b]: Array<number | undefined> = String(str)
            .split(',', 2)
            .map((n) => {
                n = n.trim()

                if (n && !isNaN(Number(n))) {
                    return Number(n)
                }

                return undefined
            })

        if (b === undefined) {
            return [b, a]
        }

        return [a, b]
    }

    const intlNumber = (
        locale: string,
        value: number,
        opt?: Omit<IntlNumberProps, 'value' | 'locale'>
    ) => {
        if (!TC.number(value)) {
            console.error('intl-number: invalid value', value)
            return ''
        }

        opt = { ...defaultProps, ...opt }

        const [minFracDig, maxFracDig] = splitNumberString(
            opt.decimalDigits || ''
        )
        const [minDig, maxDig] = splitNumberString(opt.significantDigits || '')

        const options: Intl.NumberFormatOptions = {
            style: opt.type,
            ...(opt.type === 'currency'
                ? {
                      ...conditionalField('currency', opt.currency),
                      ...conditionalField(
                          'currencyDisplay',
                          opt.currencyDisplay
                      ),
                      ...conditionalField('currencySign', opt.currencySign),
                  }
                : {}),
            ...(opt.type === 'unit'
                ? {
                      ...conditionalField('unit', opt.unit),
                      ...conditionalField('unitDisplay', opt.unitStyle),
                  }
                : {}),
            ...conditionalField('signDisplay', opt.signDisplay),
            ...conditionalField('useGrouping', opt.groupingStyle),
            ...conditionalField('roundingMode', opt.rounding),
            ...conditionalField('roundingIncrement', opt.roundingInc),
            ...conditionalField('numberingSystem', opt.system),
            ...conditionalField('notation', opt.notation),
            ...conditionalField('minimumIntegerDigits', opt.minDigits),
            ...conditionalField('minimumFractionDigits', minFracDig),
            ...conditionalField('maximumFractionDigits', maxFracDig),
            ...conditionalField('minimumSignificantDigits', minDig),
            ...conditionalField('maximumSignificantDigits', maxDig),
        }

        return new Intl.NumberFormat(locale, options).format(value)
    }

    const IntlNumber = (props: Props<IntlNumberProps>) => {
        const comp = host()
        const locale = new Intl.Locale(
            document.documentElement.lang || config.lang
        )
        const content = comp.textContent

        comp.innerHTML = ''

        const numb = () => {
            return intlNumber(
                props.locale() || locale.language,
                Number(props.value() || content),
                Object.keys(props).reduce((acc, key) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    acc[key] = props[key]()
                    return acc
                }, {} as IntlNumberProps)
            )
        }

        template`${numb}`
    }

    register<IntlNumberProps>(IntlNumber, defaultProps, {
        mode: ShadowRootModeEnum.NONE,
    })

    return intlNumber
}
