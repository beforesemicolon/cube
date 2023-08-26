export const searchParamsToJson = (searchPart: string) => {
	return searchPart.split('&').reduce((acc, pair) => {
		const [key, value] = pair.split("=")
		
		if (key) {
			return {...acc, [key]: value};
		}
		
		return acc;
	}, {})
}
