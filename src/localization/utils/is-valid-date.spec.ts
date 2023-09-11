import {isValidDate} from "./is-valid-date";

describe('isValidDate', () => {
	it('should validate date', () => {
		expect(isValidDate(new Date('fdfdfd'))).toBeFalsy()
		expect(isValidDate(new Date('5/4/1991'))).toBeTruthy()
		expect(isValidDate(new Date('23/4/1991'))).toBeFalsy()
		expect(isValidDate(new Date(1693355092459))).toBeTruthy()
	});
})
