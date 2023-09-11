import {replaceCssHost} from "./replace-css-host";

describe('replaceCssHost', () => {
	it('should handle :host', () => {
		expect(replaceCssHost(':host', 'test')).toBe('test')
		expect(replaceCssHost(':host {display: block}', 'test')).toBe('test {display: block}')
		expect(replaceCssHost(':host, comp {display: block}', 'test')).toBe('test, comp {display: block}')
	});
	
	it('should handle :host()', () => {
		expect(replaceCssHost(':host([active])', 'test')).toBe('test[active]')
		expect(replaceCssHost(':host(.loading) {display: block}', 'test')).toBe('test.loading {display: block}')
		expect(replaceCssHost(':host(:not(.visible)), comp {display: block}', 'test')).toBe('test:not(.visible), comp {display: block}')
	});
	
	it('should handle :host-context()', () => {
		expect(replaceCssHost(':host-context([active])', 'test')).toBe('[active] test')
		expect(replaceCssHost(':host-context(.loading) {display: block}', 'test')).toBe('.loading test {display: block}')
		expect(replaceCssHost(':host-context(:not(.visible)), comp {display: block}', 'test')).toBe(':not(.visible) test, comp {display: block}')
		expect(replaceCssHost(':host-context(:not(.visible)), :host(.active) {display: block}', 'test')).toBe(':not(.visible) test, test.active {display: block}')
	});
})
