beforeEach(() => {
	// @ts-ignore
	jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
});

afterEach(() => {
	(window.requestAnimationFrame as jest.Mock).mockRestore();
});
