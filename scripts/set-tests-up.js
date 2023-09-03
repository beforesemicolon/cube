require('core-js/stable/structured-clone');

beforeEach(() => {
  // @ts-ignore
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
});

afterEach(() => {
  window.requestAnimationFrame.mockRestore();
});
