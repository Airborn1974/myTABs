global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        if (typeof keys === 'function') { // Allow calling with only a callback
          callback = keys;
          keys = null;
        }
        // Simulate returning an empty object or specific mock data if needed
        callback({});
        return Promise.resolve({}); // For promise-based usage if any
      }),
      set: jest.fn((items, callback) => {
        if (callback) {
          callback();
        }
        return Promise.resolve(); // For promise-based usage if any
      }),
      remove: jest.fn((keys, callback) => {
        if (callback) {
          callback();
        }
        return Promise.resolve();
      }),
      clear: jest.fn((callback) => {
        if (callback) {
          callback();
        }
        return Promise.resolve();
      }),
    },
    sync: { // Also mock sync storage if it's ever used
      get: jest.fn((keys, callback) => {
        if (typeof keys === 'function') { callback = keys; keys = null; }
        callback({});
        return Promise.resolve({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(() => false),
    },
  },
  runtime: {
    sendMessage: jest.fn((message, callback) => {
      // console.log("chrome.runtime.sendMessage mock called with:", message);
      if (callback) {
        // Simulate a generic response or error
        // callback({ status: "mocked_response" });
      }
      // To simulate errors:
      // global.chrome.runtime.lastError = { message: "Mock error" };
      // delete global.chrome.runtime.lastError; // Clear error after use
      return Promise.resolve(); // if the call expects a promise
    }),
    onMessage: {
      addListener: jest.fn((listener) => {
        // console.log("chrome.runtime.onMessage.addListener mock called");
        // Store listener if you need to manually invoke it in tests
        // global.chrome.runtime.onMessage.triggerListener = listener;
      }),
      removeListener: jest.fn(),
      hasListener: jest.fn(() => false),
    },
    onInstalled: {
      addListener: jest.fn(),
    },
    onStartup: {
      addListener: jest.fn(),
    },
    getURL: jest.fn(path => `chrome-extension://mocked-id/${path}`),
    id: 'mocked-extension-id',
    lastError: undefined, // or null
  },
  contextMenus: {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(callback => {
      if (callback) callback();
      return Promise.resolve();
    }),
    onClicked: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(() => false),
    },
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      // Simulate returning an empty array or mock tabs
      if (callback) callback([]);
      return Promise.resolve([]);
    }),
    create: jest.fn((createProperties, callback) => {
      if (callback) callback({ id: 123, url: createProperties.url }); // Mock tab object
      return Promise.resolve({ id: 123, url: createProperties.url });
    }),
    update: jest.fn((tabId, updateProperties, callback) => {
      if (callback) callback({ id: tabId, ...updateProperties });
      return Promise.resolve({ id: tabId, ...updateProperties });
    }),
    remove: jest.fn((tabIds, callback) => {
      if (callback) callback();
      return Promise.resolve();
    }),
    // Mock other tabs API functions if your code uses them
    // e.g., getCurrent, executeScript, etc.
    getCurrent: jest.fn(callback => {
      // Simulate a mock current tab
      const mockCurrentTab = { id: 1, url: 'chrome-extension://mocked-id/index.html', title: 'MyTabs' };
      if (callback) callback(mockCurrentTab);
      return Promise.resolve(mockCurrentTab);
    }),
  },
  windows: {
    getCurrent: jest.fn(getInfo, callback => {
      if (typeof getInfo === 'function') { // Optional getInfo object
        callback = getInfo;
      }
      const mockWindow = { id: 1, focused: true, state: "normal", type: "normal" };
      if (callback) callback(mockWindow);
      return Promise.resolve(mockWindow);
    }),
  },
  bookmarks: { // Mock bookmarks API if used
    getTree: jest.fn(callback => {
      if (callback) callback([]);
      return Promise.resolve([]);
    }),
    search: jest.fn((query, callback) => {
      if (callback) callback([]);
      return Promise.resolve([]);
    }),
    create: jest.fn((bookmark, callback) => {
      if (callback) callback({id: 'mockbookmarkid', ...bookmark});
      return Promise.resolve({id: 'mockbookmarkid', ...bookmark});
    })
  },
  // Add other chrome APIs if your extension uses them
};

// You might need to expose this to the global scope if Jest runs tests in a different context
// For most CRA/Vite setups, placing it in __mocks__ is enough.
// if (typeof window !== 'undefined') {
//   window.chrome = global.chrome;
// }
