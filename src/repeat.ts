export const repeat = <T>(countOrDataList: number | T[], template: string | ((indexOrData: number | T) => string)) => {
	const data = typeof countOrDataList === "number"
		? Array.from({length: countOrDataList}, (_, i) => i)
		: Array.isArray(countOrDataList) ? countOrDataList : [];
	const fn = typeof template === "string"
		? () => template
		: typeof template === "function" ? template : () => {};
	
	return data.map((item, idx) => fn(item)).join("")
}
