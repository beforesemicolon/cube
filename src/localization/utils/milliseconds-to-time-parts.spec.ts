import {millisecondsToTimeParts} from "./milliseconds-to-time-parts";

describe('millisecondsToTimeParts', () => {
	const blank = {
		"day": 0,
		"hour": 0,
		"millisecond": 0,
		"minute": 0,
		"month": 0,
		"nanosecond": 0,
		"second": 0,
		"week": 0,
		"year": 0
	}
	
	it('should return all parts', () => {
		expect(millisecondsToTimeParts(1693355092459, new Set(['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond', 'nanosecond']))).toEqual({
			...blank,
			"millisecond": 459,
			"minute": 24,
			"month": 8,
			"nanosecond": 459000000000,
			"second": 52,
			"week": 2,
			"year": 53
		})
	});
	
	it('should return year', () => {
		expect(millisecondsToTimeParts(3.156e+10, new Set(['year']))).toEqual({
			...blank,
			"year": 1
		})
	});
	
	it('should return month', () => {
		expect(millisecondsToTimeParts(2.628e+9, new Set(['month']))).toEqual({
			...blank,
			"month": 1
		})
	});
	
	it('should return day', () => {
		expect(millisecondsToTimeParts(8.64e+7, new Set(['day']))).toEqual({
			...blank,
			"day": 1
		});
	});
	
	it('should return week', () => {
		expect(millisecondsToTimeParts(6.048e+8, new Set(['week']))).toEqual({
			...blank,
			"week": 1
		});
	});
	
	it('should return hour', () => {
		expect(millisecondsToTimeParts(3.6e+6, new Set(['hour']))).toEqual({
			...blank,
			"hour": 1
		});
	});
	
	it('should return minute', () => {
		expect(millisecondsToTimeParts(60000, new Set(['minute']))).toEqual({
			...blank,
			"minute": 1
		});
	});
	
	it('should return second', () => {
		expect(millisecondsToTimeParts(1000, new Set(['second']))).toEqual({
			...blank,
			"second": 1
		});
	});
	
	it('should return nanosecond', () => {
		expect(millisecondsToTimeParts(1, new Set(['nanosecond']))).toEqual({
			...blank,
			"nanosecond": 1000000000
		});
	});
})
