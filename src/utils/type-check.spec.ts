import {TC} from "./type-check";

describe('TC', () => {
	it('should check error', () => {
		expect(TC.error(new Error())).toBeTruthy();
		expect(TC.error(new TypeError())).toBeTruthy();
		expect(TC.error(new RangeError())).toBeTruthy();
		expect(TC.error(new ReferenceError())).toBeTruthy();
		expect(TC.error(new SyntaxError())).toBeTruthy();
		expect(TC.error('failed to delete')).toBeFalsy();
	});
	it('should check number', () => {
		expect(TC.number(1)).toBeTruthy();
		expect(TC.number(-1)).toBeTruthy();
		expect(TC.number(Number())).toBeTruthy();
		expect(TC.number(12n)).toBeFalsy();
		expect(TC.number(NaN)).toBeFalsy();
		expect(TC.number(Infinity)).toBeFalsy();
		expect(TC.number('12')).toBeFalsy();
	});
	it('should check numeric', () => {
		expect(TC.numeric('12')).toBeTruthy();
		expect(TC.numeric(13)).toBeTruthy();
		expect(TC.numeric(NaN)).toBeFalsy();
		expect(TC.numeric(Infinity)).toBeFalsy();
		expect(TC.numeric(12n)).toBeTruthy();
	});
	it('should check string', () => {
		expect(TC.string('12')).toBeTruthy();
		expect(TC.string(`val`)).toBeTruthy();
		expect(TC.string('str')).toBeTruthy();
		expect(TC.string(String())).toBeTruthy();
		expect(TC.string(JSON.stringify({}))).toBeTruthy();
	});
	it('should check boolean', () => {
		expect(TC.boolean(true)).toBeTruthy();
		expect(TC.boolean(false)).toBeTruthy();
		expect(TC.boolean(Boolean())).toBeTruthy();
	});
	it('should check falsy', () => {
		expect(TC.falsy(0)).toBeTruthy();
		expect(TC.falsy(null)).toBeTruthy();
		expect(TC.falsy(undefined)).toBeTruthy();
		expect(TC.falsy('')).toBeTruthy();
		expect(TC.falsy(false)).toBeTruthy();
	});
	it('should check truthy', () => {
		expect(TC.truthy(1)).toBeTruthy();
		expect(TC.truthy(' ')).toBeTruthy();
		expect(TC.truthy(true)).toBeTruthy();
	});
	it('should check empty', () => {
		expect(TC.empty(0)).toBeTruthy();
		expect(TC.empty(1)).toBeFalsy();
		expect(TC.empty('')).toBeTruthy();
		expect(TC.empty('  ')).toBeTruthy();
		expect(TC.empty('str')).toBeFalsy();
		expect(TC.empty([])).toBeTruthy();
		expect(TC.empty([1])).toBeFalsy();
		expect(TC.empty({})).toBeTruthy();
		expect(TC.empty({x: 12})).toBeFalsy();
		expect(TC.empty(new Set())).toBeTruthy();
		expect(TC.empty(new Set([1]))).toBeFalsy();
		expect(TC.empty(new Map())).toBeTruthy();
		expect(TC.empty(new Map([['x', 12]]))).toBeFalsy();
		expect(TC.empty(() => {})).toBeFalsy();
	});
	it('should check null', () => {
		expect(TC.null(null)).toBeTruthy();
		expect(TC.null(undefined)).toBeFalsy();
	});
	it('should check undefined', () => {
		expect(TC.undefined(null)).toBeFalsy();
		expect(TC.undefined(undefined)).toBeTruthy();
	});
	it('should check nil', () => {
		expect(TC.nil(null)).toBeTruthy();
		expect(TC.nil(undefined)).toBeTruthy();
	});
	it('should check array', () => {
		expect(TC.array([])).toBeTruthy();
		expect(TC.array(new Array(0))).toBeTruthy();
		expect(TC.array(Array(0))).toBeTruthy();
	});
	it('should check arrayOf', () => {
		expect(TC.arrayOf([12], TC.string)).toBeFalsy();
		expect(TC.arrayOf([12], TC.number)).toBeTruthy();
		expect(TC.arrayOf([12], (x) => TC.oneOf(x, TC.string, TC.number))).toBeTruthy();
		expect(TC.arrayOf([{name: 'john doe'}], x => TC.schema(x, {name: TC.string}))).toBeTruthy();
		expect(TC.arrayOf([{name: 12}], x => TC.schema(x, {name: TC.string}))).toBeFalsy();
	});
	it('should check typed array', () => {
		expect(TC.typedArray([])).toBeFalsy();
		expect(TC.typedArray(new Array(0))).toBeFalsy();
		expect(TC.typedArray(new Int8Array(0))).toBeTruthy();
		expect(TC.typedArray(new Int16Array(0))).toBeTruthy();
		expect(TC.typedArray(new Int32Array(0))).toBeTruthy();
		expect(TC.typedArray(new Float32Array(0))).toBeTruthy();
		expect(TC.typedArray(new Float64Array(0))).toBeTruthy();
		expect(TC.typedArray(new Uint8Array(0))).toBeTruthy();
		expect(TC.typedArray(new Uint16Array(0))).toBeTruthy();
		expect(TC.typedArray(new Uint32Array(0))).toBeTruthy();
		expect(TC.typedArray(new Uint8ClampedArray(0))).toBeTruthy();
		expect(TC.typedArray(Array(0))).toBeFalsy();
	});
	it('should check object', () => {
		expect(TC.object(Array(0))).toBeTruthy();
		expect(TC.object([])).toBeTruthy();
		expect(TC.object({})).toBeTruthy();
		expect(TC.object(new Object())).toBeTruthy();
		expect(TC.object(Object.create(null))).toBeTruthy();
		expect(TC.object(() => {})).toBeFalsy();
	});
	it('should check object literal', () => {
		expect(TC.objectLiteral(Array(0))).toBeFalsy();
		expect(TC.objectLiteral([])).toBeFalsy();
		expect(TC.objectLiteral({})).toBeTruthy();
		expect(TC.objectLiteral(Object.create(null))).toBeTruthy();
		expect(TC.object(new Object())).toBeTruthy();
		expect(TC.objectLiteral(() => {})).toBeFalsy();
	});
	it('should check function', () => {
		expect(TC.function(() => {})).toBeTruthy();
		expect(TC.function(async () => {})).toBeTruthy();
		expect(TC.function(new Function())).toBeTruthy();
		expect(TC.function(function () {})).toBeTruthy();
		expect(TC.function(function sample() {})).toBeTruthy();
		expect(TC.function(({get a() {return 1;}}).a)).toBeFalsy();
		expect(TC.function(({a() {return 1;}}).a)).toBeTruthy();
	});
	it('should check generator', () => {
		expect(TC.generator(() => {})).toBeFalsy();
		expect(TC.generator(async () => {})).toBeFalsy();
		expect(TC.generator(new Function())).toBeFalsy();
		expect(TC.generator(function () {})).toBeFalsy();
		expect(TC.generator(function *() {})).toBeTruthy();
		expect(TC.generator(function sample() {})).toBeFalsy();
		expect(TC.generator(({get a() {return 1;}}).a)).toBeFalsy();
		expect(TC.generator(({a() {return 1;}}).a)).toBeFalsy();
	});
	it('should check type', () => {
		expect(TC.type(1, Number)).toBeFalsy();
		expect(TC.type('', String)).toBeFalsy();
		expect(TC.type(new Date(), Date)).toBeTruthy();
	});
	it('should check set', () => {
		expect(TC.set(new Set())).toBeTruthy();
		expect(TC.set(new Map())).toBeFalsy();
	});
	it('should check weak set', () => {
		expect(TC.weakSet(new Set())).toBeFalsy();
		expect(TC.weakSet(new WeakSet())).toBeTruthy();
		expect(TC.weakSet(new Map())).toBeFalsy();
	});
	it('should check map', () => {
		expect(TC.map(new Set())).toBeFalsy();
		expect(TC.map(new Map())).toBeTruthy();
	});
	it('should check weak map', () => {
		expect(TC.weakMap(new Set())).toBeFalsy();
		expect(TC.weakMap(new WeakMap())).toBeTruthy();
		expect(TC.weakMap(new Map())).toBeFalsy();
	});
	it('should check date', () => {
		expect(TC.date(new Date())).toBeTruthy();
		expect(TC.date(Date.now())).toBeFalsy();
		expect(TC.date(new Date('dsdsd'))).toBeTruthy();
	});
	it('should check dateString', () => {
		expect(TC.dateString(new Date())).toBeFalsy();
		expect(TC.dateString(Date.now())).toBeFalsy();
		expect(TC.dateString(new Date('dsdsd'))).toBeFalsy();
		expect(TC.dateString(new Date().toLocaleString())).toBeTruthy();
		expect(TC.dateString('05/02/220')).toBeTruthy();
	});
	it('should check valid date', () => {
		expect(TC.validDate(new Date())).toBeTruthy();
		expect(TC.validDate(new Date('dsdsd'))).toBeFalsy();
	});
	it('should check symbol', () => {
		expect(TC.symbol(Symbol())).toBeTruthy();
		expect(TC.symbol(Symbol(''))).toBeTruthy();
		expect(TC.symbol(Symbol(1))).toBeTruthy();
		expect(TC.symbol(Symbol(undefined))).toBeTruthy();
		expect(TC.symbol(Symbol(NaN))).toBeTruthy();
		expect(TC.symbol(Symbol(Infinity))).toBeTruthy();
		expect(TC.symbol(Symbol(''))).toBeTruthy();
	});
	it('should check bigint', () => {
		expect(TC.bigint(12n)).toBeTruthy();
		expect(TC.bigint(12)).toBeFalsy();
		expect(TC.bigint(NaN)).toBeFalsy();
		expect(TC.bigint(Infinity)).toBeFalsy();
	});
	it('should check promise', () => {
		expect(TC.promise(Promise.resolve())).toBeTruthy();
		expect(TC.promise(new Promise(() => {}))).toBeTruthy();
		expect(TC.promise(async () => {})).toBeFalsy();
	});
	it('should check regexp', () => {
		expect(TC.regexp(RegExp(''))).toBeTruthy();
		expect(TC.regexp(/\s/g)).toBeTruthy();
	});
	it('should check url', () => {
		expect(TC.url(new URL('http://localhost'))).toBeTruthy();
		expect(TC.url('http://localhost')).toBeFalsy();
	});
	it('should check arrayBuffer', () => {
		expect(TC.arrayBuffer(new ArrayBuffer(0))).toBeTruthy();
		expect(TC.arrayBuffer([])).toBeFalsy();
	});
	it('should check buffer', () => {
		expect(TC.buffer(Buffer.from([]))).toBeTruthy();
		expect(TC.buffer(new ArrayBuffer(0))).toBeFalsy();
		expect(TC.buffer([])).toBeFalsy();
	});
	it('should check dataView', () => {
		expect(TC.dataView(new DataView(new ArrayBuffer(0)))).toBeTruthy();
		expect(TC.dataView([])).toBeFalsy();
	});
	it('should check schema', () => {
		const todoSchema = {
			name: TC.string,
			completed: TC.boolean,
			id: TC.number,
			user: {
				id: TC.number,
				name: TC.string
			}
		}
		
		// @ts-ignore
		expect(TC.schema({})).toBeFalsy();
		expect(TC.schema({x: 12}, {
		// @ts-ignore
			x: null
		})).toBeFalsy();
		
		expect(TC.schema({}, {
			x: TC.string
		})).toBeFalsy();
		expect(TC.schema({
			x: '12'
		}, {
			x: TC.string
		})).toBeTruthy()

		expect(TC.schema({}, todoSchema)).toBeFalsy();
		expect(TC.schema({
			name: 'go to gym',
		}, todoSchema)).toBeFalsy();
		expect(TC.schema({
			name: 'go to gym',
			completed: true,
			id: 1,
			user: {
				id: 1,
				name: 'John'
			}
		}, todoSchema)).toBeTruthy();
		expect(TC.schema({
			name: 'go to gym',
			completed: true,
			id: 1,
			user: {
				id: 1,
				name: 'John'
			},
			status: 'completed' // bad
		}, todoSchema)).toBeFalsy();
		expect(TC.schema({
			name: 'go to gym',
			completed: '', // bad
			id: 1,
			user: {
				id: 1,
				name: 'John'
			}
		}, todoSchema)).toBeFalsy();
	});
	it('should check oneOf', () => {
		expect(TC.oneOf(1, TC.string, TC.number)).toBeTruthy();
		expect(TC.oneOf('1', TC.string, TC.number)).toBeTruthy();
		expect(TC.oneOf(true, TC.string, TC.number)).toBeFalsy();
	});
})
