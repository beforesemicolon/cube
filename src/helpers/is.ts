import { helper } from '@beforesemicolon/html'

export const is = helper(
    <T>(st: () => T, checker: unknown | ((val: T) => boolean)) => {
        return typeof checker === 'function' ? checker(st()) : st() === checker
    }
)

export const isNot = helper(
    <T>(st: () => T, checker: unknown | ((val: T) => boolean)) => {
        return typeof checker === 'function' ? !checker(st()) : st() !== checker
    }
)
