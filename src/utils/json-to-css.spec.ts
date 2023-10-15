import {JSONToCSS} from './json-to-css';

describe('JSONToCSS', () => {
	it('should handle key-value pairs', () => {
		expect(JSONToCSS({
			':host': {
				display: 'inline-block',
				opacity: "0.5",
				backgroundColor: '[bg]',
				button: {
					opacity: "[disabled ? 0 : 1]"
				}
			},
			'*, *::before, *::after': {
				boxSizing: 'border-box',
			}
		}, 'comp-test', true)).toBe(':host {display: inline-block;opacity: 0.5;background-color: [bg];} ' +
			':host button {opacity: [disabled ? 0 : 1];} ' +
			'*, *::before, *::after {box-sizing: border-box;}')
	});
	
	it('should allow merging', () => {
		const style = {
			':host': {
				display: 'inline-block',
				opacity: "0.5",
				backgroundColor: '[bg]',
				button: {
					opacity: "[disabled ? 0 : 1]"
				}
			}
		}
		expect(JSONToCSS({
			...style,
			':host': {
				...style[':host'],
				display: 'block',
			},
			'*, *::before, *::after': {
				boxSizing: 'border-box',
			}
		}, 'comp-test', false)).toBe('comp-test {display: block;opacity: 0.5;background-color: [bg];} ' +
			'comp-test button {opacity: [disabled ? 0 : 1];} ' +
			'*, *::before, *::after {box-sizing: border-box;}')
	});
	
	it('should handle @ declarations', () => {
		expect(JSONToCSS({
			'@media screen and (max-width: 760px)': {
				button: {
					opacity: "[disabled ? 0 : 1]",
					'&:hover': {
						backgroundColor: '#000',
						'&:active': {
							backgroundColor: '#666',
						}
					},
					'&.loading': {
						padding: '12px'
					},
				}
			}
		}, 'comp-test', true)).toBe('@media screen and (max-width: 760px) {' +
			'button {opacity: [disabled ? 0 : 1];} ' +
			'button:hover {background-color: #000;} ' +
			'button:hover:active {background-color: #666;} ' +
			'button.loading {padding: 12px;} ' +
			'}')
		
		expect(JSONToCSS({
			':host': {
				'@media screen and (max-width: 760px)': {
					button: {
						opacity: "[disabled ? 0 : 1]",
						'&:hover': {
							backgroundColor: '#000',
							'&:active': {
								backgroundColor: '#666',
							}
						},
						'&.loading': {
							padding: '12px'
						},
					}
				}
			}
		}, 'comp-test', true)).toBe(':host {} ' +
			'@media screen and (max-width: 760px) {' +
			'button {opacity: [disabled ? 0 : 1];} ' +
			'button:hover {background-color: #000;} ' +
			'button:hover:active {background-color: #666;} ' +
			'button.loading {padding: 12px;} ' +
			'}')
	});
	
	it('should handle nested declarations with &', () => {
		expect(JSONToCSS({
			button: {
				opacity: "[disabled ? 0 : 1]",
				backgroundColor: '#222',
				'&:hover': {
					backgroundColor: '#000',
					'&:active': {
						backgroundColor: '#666',
					}
				},
				'&.loading': {
					padding: '12px'
				},
				cursor: "[disabled ? 'not-allowed' : 'pointer']",
			}
		}, 'comp-test', true)).toBe("button {opacity: [disabled ? 0 : 1];background-color: #222;cursor: [disabled ? 'not-allowed' : 'pointer'];} " +
			"button:hover {background-color: #000;} " +
			"button:hover:active {background-color: #666;} " +
			"button.loading {padding: 12px;}")
	});
	
	it('should handle nested declarations without & ', () => {
		expect(JSONToCSS({
			':host': {
				display: 'inline-block',
				opacity: "0.5",
				backgroundColor: '[bg]',
				button: {
					opacity: "[disabled ? 0 : 1]",
					'&:hover': {
						backgroundColor: '#000',
						'&:active': {
							backgroundColor: '#666',
						}
					},
					'& + p': {
						padding: 12
					},
					'span, b': {
						display: 'inline-block',
						'i, em': {
							display: 'inline'
						},
					}
				}
			},
			'*, *::before, *::after': {
				boxSizing: 'border-box',
			}
		}, 'comp-test', true))
			.toBe(
			':host {display: inline-block;opacity: 0.5;background-color: [bg];} ' +
			':host button {opacity: [disabled ? 0 : 1];} ' +
			':host button:hover {background-color: #000;} ' +
			':host button:hover:active {background-color: #666;} ' +
			':host button + p {padding: 12px;} ' +
			':host button span, :host button b {display: inline-block;} ' +
			':host button span i, :host button span em, :host button b i, :host button b em {display: inline;} ' +
			'*, *::before, *::after {box-sizing: border-box;}')
	});
	
	it('should handle nested selector names', () => {
		expect(JSONToCSS({
			'.box': {
				display: 'inline-block',
				'&__small': {
					width: '50px',
				},
				'&__large': {
					width: '150px',
				}
			}
		}, 'comp-test', true)).toBe('.box {display: inline-block;} .box__small {width: 50px;} .box__large {width: 150px;}')
	});
	
	it('should handle deeply nested grouped selectors', () => {
		expect(JSONToCSS({
			'.box': {
				display: 'inline-block',
				'&.outline, &.text': {
					background: 'none',
					color: 'var(--color-dark-100, #000)',
					'&:hover': {
						background: 'var(--color-light-300, #eaeaea)',
					},
					'&:active, &:focus': {
						background: 'var(--color-light-900, #eaeaea)',
					},
				},
			}
		}, 'comp-test', true)).toBe('.box {display: inline-block;} ' +
			'.box.outline, .box.text {background: none;color: var(--color-dark-100, #000);} ' +
			'.box.outline:hover, .box.text:hover {background: var(--color-light-300, #eaeaea);} ' +
			'.box.outline:active, .box.outline:focus, .box.text:active,  .box.text:focus {background: var(--color-light-900, #eaeaea);}')
	});
	
	it('should keep variable', () => {
		expect(JSONToCSS({
			":host": {
				'--color-grey-100': "#222"
			}
		}, 'comp-test', true)).toBe(':host {--color-grey-100: #222;}')
	});
	
	it('should keep vadddriable', () => {
		expect(JSONToCSS({
			":host": {
				"*": {
					boxSizing: "border-box",
				},
				".todo-item": {
					display: "flex",
					background: "#fff",
					padding: 15,
					borderRadius: 5,
					h3: {
						margin: 0,
					},
					p: {
						margin: "5px 0 0"
					}
				},
				".todo-actions": {
					borderTop: "1px solid #eee",
					marginTop: 10,
					padding: "10px 0 0",
					display: "flex",
					gap: 5
				}
			}
		}, 'comp-test', true)).toBe(':host {} :host * {box-sizing: border-box;} :host .todo-item {display: flex;background: #fff;padding: 15px;border-radius: 5px;} :host .todo-item h3 {margin: 0px;} :host .todo-item p {margin: 5px 0 0;} :host .todo-actions {border-top: 1px solid #eee;margin-top: 10px;padding: 10px 0 0;display: flex;gap: 5px;}')
	});
})
