import {
	ONE_DAY,
	ONE_HOUR,
	ONE_MINUTE,
	ONE_MONTH,
	ONE_SECOND,
	ONE_WEEK,
	ONE_YEAR,
	ONE_NANOSECOND
} from "./time-in-miliseconds";

/**
 * gradually break-down time based on the fields needed
 * @param mils
 * @param keys
 */
export const millisecondsToTimeParts = (mils: number, keys: Set<string>) => {
	let remainder = mils;
	const obj = {year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 0, millisecond: 0, nanosecond: 0};
	
	if (keys.has('year')) {
		obj.year = Math.floor(mils / ONE_YEAR);
		remainder = mils % ONE_YEAR;
	}
	
	if (keys.has('month')) {
		obj.month = Math.floor(remainder / ONE_MONTH);
		remainder = remainder % ONE_MONTH;
	}
	
	if (keys.has('week')) {
		obj.week = Math.floor(remainder / ONE_WEEK);
		remainder = remainder % ONE_WEEK;
	}
	
	if (keys.has('day')) {
		obj.day = Math.floor(remainder / ONE_DAY);
		remainder = remainder % ONE_DAY;
	}
	
	if (keys.has('hour')) {
		obj.hour = Math.floor(remainder / ONE_HOUR);
		remainder = remainder % ONE_HOUR;
	}
	
	if (keys.has('minute')) {
		obj.minute = Math.floor(remainder / ONE_MINUTE);
		remainder = remainder % ONE_MINUTE;
	}
	
	if (keys.has('second')) {
		obj.second = Math.floor(remainder / ONE_SECOND);
		remainder = remainder % ONE_SECOND;
	}
	
	if (keys.has('millisecond')) {
		obj.millisecond = remainder;
	}
	
	if (keys.has('nanosecond')) {
		obj.nanosecond = obj.millisecond * ONE_NANOSECOND;
	}
	
	return obj;
}
