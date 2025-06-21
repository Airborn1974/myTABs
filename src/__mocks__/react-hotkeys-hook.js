// src/__mocks__/react-hotkeys-hook.js
export const useHotkeys = jest.fn();

// You can also mock other exports from the library if your code uses them
// For example, if it exports a `HotKeys` component or other utility functions:
// export const HotKeys = jest.fn(({ children }) => <>{children}</>);
// export const GlobalHotKeys = jest.fn(({ children }) => <>{children}</>);
// ...etc.

// By default, useHotkeys is a jest.fn(), so you can use it in your tests like:
// import { useHotkeys } from 'react-hotkeys-hook';
// ...
// expect(useHotkeys).toHaveBeenCalledWith(...);

// If you need to simulate the callback being triggered for some advanced tests,
// you might need a more sophisticated mock, but for most cases,
// just checking if it's called with the right parameters is sufficient.
// For example, to get the callback:
// const hotkeyCallback = useHotkeys.mock.calls[0][1]; // (keys, callback, options, deps)
// hotkeyCallback(new KeyboardEvent('keydown')); // Simulate event
// This is generally more complex than needed.

// Reset the mock before each test if needed (often handled by Jest config clearMocks: true)
// afterEach(() => {
//   useHotkeys.mockClear();
// });
