export const isValidDate = (date: Date) => {
	return !isNaN(date.getTime());
}
