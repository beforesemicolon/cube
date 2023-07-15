export function jsonParse(value: string): any {
	if (typeof value === 'string') {
		try {
			value = JSON.parse(value.replace(/['`]/g, '"'));
		} catch (e) {
		}
	}

	return value;
}
