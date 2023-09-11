const isObject = (value: unknown) => value !== null && typeof value === 'object';

export function mergeObjects(a: unknown, b: unknown) {
	if(!isObject(a) || !isObject(b)) return b ?? {};
	
	// @ts-ignore
	const obj = Array.isArray(a) ? [...a] : {...a};
	
	// @ts-ignore
	for(const key in b) {
		// @ts-ignore
		if(b.hasOwnProperty(key)) {
			// @ts-ignore
			obj[key] = mergeObjects(obj[key], b[key]);
		}
	}
	
	return obj;
}
