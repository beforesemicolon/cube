import {
    ONE_DAY_MS,
    ONE_HOUR_MS,
    ONE_MINUTE_MS,
    ONE_MONTH_MS,
    ONE_SECOND_MS,
    ONE_WEEK_MS,
    ONE_YEAR_MS,
    ONE_NANOSECOND_MS,
} from './time-in-miliseconds'

/**
 * gradually break-down time based on the fields needed
 * @param mils
 * @param keys
 */
export const millisecondsToTimeParts = (mils: number, keys: Set<string>) => {
    let remainder = mils
    const obj = {
        year: 0,
        month: 0,
        week: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        nanosecond: 0,
    }

    if (keys.has('year')) {
        obj.year = Math.floor(mils / ONE_YEAR_MS)
        remainder = mils % ONE_YEAR_MS
    }

    if (keys.has('month')) {
        obj.month = Math.floor(remainder / ONE_MONTH_MS)
        remainder = remainder % ONE_MONTH_MS
    }

    if (keys.has('week')) {
        obj.week = Math.floor(remainder / ONE_WEEK_MS)
        remainder = remainder % ONE_WEEK_MS
    }

    if (keys.has('day')) {
        obj.day = Math.floor(remainder / ONE_DAY_MS)
        remainder = remainder % ONE_DAY_MS
    }

    if (keys.has('hour')) {
        obj.hour = Math.floor(remainder / ONE_HOUR_MS)
        remainder = remainder % ONE_HOUR_MS
    }

    if (keys.has('minute')) {
        obj.minute = Math.floor(remainder / ONE_MINUTE_MS)
        remainder = remainder % ONE_MINUTE_MS
    }

    if (keys.has('second')) {
        obj.second = Math.floor(remainder / ONE_SECOND_MS)
        remainder = remainder % ONE_SECOND_MS
    }

    if (keys.has('millisecond')) {
        obj.millisecond = remainder
    }

    if (keys.has('nanosecond')) {
        obj.nanosecond = remainder * ONE_NANOSECOND_MS
    }

    return obj
}
