export const extractExecutableValueFromRawValue = (rawValue: string, values: unknown[]) => {
	rawValue = rawValue.trim();
	let match: RegExpExecArray | null = null;
	const parts = [];
	
	while ((match = /{{val([0-9]+)}}/.exec(rawValue.trim())) !== null) {
		const [full] = match;
		const pre = rawValue.slice(0, match.index);
		
		if (pre.length) {
			parts.push(pre);
		}
		
		const numb = full.match(/\d+/g);
		
		if (numb) {
			const val = values[Number(numb[0])];
			parts.push(val)
		}
		
		rawValue = rawValue.slice(match.index + full.length)
	}
	
	return parts.length ? parts : [rawValue];
}
