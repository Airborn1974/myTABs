// Import Jest-DOM matchers like expect(...).toBeInTheDocument()
import '@testing-library/jest-dom';

// Import the Chrome API mock
// This will make the global.chrome object available in all test files
import './src/__mocks__/chromeMock.js';

// You can add other global setups here if needed

// Example: Mocking localStorage (if not already handled by jsdom environment and you need specific control)
// const localStorageMock = (function() {
//   let store = {};
//   return {
//     getItem: function(key) {
//       return store[key] || null;
//     },
//     setItem: function(key, value) {
//       store[key] = value.toString();
//     },
//     removeItem: function(key) {
//       delete store[key];
//     },
//     clear: function() {
//       store = {};
//     }
//   };
// })();
// Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Suppress console.error and console.warn if they are too noisy during tests
// (Use with caution, as it might hide important warnings)
// beforeEach(() => {
//   jest.spyOn(console, 'error').mockImplementation(jest.fn());
//   jest.spyOn(console, 'warn').mockImplementation(jest.fn());
// });
