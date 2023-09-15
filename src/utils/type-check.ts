import {ObjectLiteral} from "../types";

interface Schema {
	[key: string]: ((x: any) => boolean) | Schema
}


export const TC = {
	null: (x: unknown): x is null => x === null,
	undefined: (x: unknown): x is undefined => x === undefined,
	error: (x: unknown): x is Error => x instanceof Error,
	nil: (x: unknown): x is null | undefined => TC.null(x) || TC.undefined(x),
	string: (x: unknown): x is string => !TC.nil(x) && (typeof x === 'string' || x instanceof String),
	empty: (x: unknown): x is string => x == 0
		|| (TC.string(x) && x.trim().length === 0)
		|| (TC.array(x) && x.length === 0)
		|| (TC.objectLiteral(x) && Object.keys(x).length === 0)
		|| (TC.set(x) && x.size === 0)
		|| (TC.map(x) && x.size === 0)
		|| false
	,
	number: (x: unknown): x is number => !TC.nil(x)
		&& (typeof x === 'number' || x instanceof Number)
		// NaN & Infinity have typeof "number" and this excludes that
		&& !isNaN(x as number) && isFinite(x as number),
	numeric: (x: unknown): x is number => TC.number(Number(x)),
	boolean: (x: unknown): x is boolean => !TC.nil(x) && (typeof x === 'boolean' || x instanceof Boolean),
	falsy: (x: unknown): x is boolean => !Boolean(x),
	truthy: (x: unknown): x is boolean => Boolean(x),
	array: (x: unknown): x is [] => !TC.nil(x) && Array.isArray(x),
	typedArray: (x: unknown): x is Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array => !TC.nil(x) && TC.object(x) && TC.type((x as any).buffer, ArrayBuffer),
	arrayOf: (x: unknown, type: (x: any) => boolean): x is [] => !TC.nil(x) && TC.array(x) && x.every(type),
	oneOf: (x: unknown, ...types: Array<(x: any) => x is any>): x is ReturnType<typeof types[number]> => types.some(t => TC.function(t) && t(x)),
	objectLiteral: (x: unknown): x is Record<string, any> => !TC.nil(x) && ({}).toString.call(x) === '[object Object]',
	object: (x: unknown): x is object => !TC.nil(x) && typeof x === 'object',
	type: (x: unknown, X: any): x is typeof X => !TC.nil(x) && !TC.nil(X) && x instanceof X,
	set: (x: unknown): x is Set<unknown> => TC.type(x, Set),
	weakSet: (x: unknown): x is WeakSet<object> => TC.type(x, WeakSet),
	map: (x: unknown): x is Map<unknown, unknown> => TC.type(x, Map),
	weakMap: (x: unknown): x is WeakMap<object, unknown> => TC.type(x, WeakMap),
	date: (x: unknown): x is Date => !TC.nil(x) && TC.type(x, Date),
	dateString: (x: unknown): x is string => !TC.nil(x) && TC.string(x) && TC.number(Date.parse(x)),
	validDate: (x: unknown): x is Date => TC.date(x) && TC.number(x.getTime()),
	function: (x: unknown): x is Function => TC.type(x, Function) || typeof x === 'function',
	generator: (x: unknown): x is Generator => Object.prototype.toString.call(x) === '[object GeneratorFunction]',
	symbol: (x: unknown): x is Symbol => TC.type(x, Symbol) || typeof x === 'symbol',
	bigint: (x: unknown): x is BigInt => TC.type(x, BigInt) || typeof x === 'bigint',
	promise: (x: unknown): x is Promise<unknown> => ({}).toString.call(x) === "[object Promise]" && TC.type(x, Promise),
	regexp: (x: unknown): x is RegExp => TC.type(x, RegExp),
	url: (x: unknown): x is URL => TC.type(x, URL),
	arrayBuffer: (x: unknown): x is ArrayBuffer => TC.type(x, ArrayBuffer),
	buffer: (x: unknown): x is Buffer => TC.type(x, Buffer),
	dataView: (x: unknown): x is DataView => TC.type(x, DataView),
	schema: (x: ObjectLiteral, schema: Schema): x is Schema => {
		if (TC.objectLiteral(x) && TC.objectLiteral(schema)) {
			for (let k of Object.keys(x)) {
				if (!schema.hasOwnProperty(k)) {
					return false;
				}
			}
			
			return Object.keys(schema).every(key => {
				if (TC.function(schema[key])) {
					return Boolean((schema[key] as Function)(x[key]));
				} else if (TC.objectLiteral(schema[key])) {
					return TC.schema(x[key] as ObjectLiteral, schema[key] as Schema);
				}
				
				return false;
			});
		}
		
		return false;
	}
};
