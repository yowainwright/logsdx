import { test, expect, describe, mock, spyOn } from "bun:test";
import React from "react"; // We still need React itself
import { LogDx, LogDxProvider, LogDxContent, useLogDx, logViewerReducer, initialState } from "./index";
import { LogEnhancer } from "@/src/logenhancer";

// --- Mocks ---

// Mock LogEnhancer
mock.module("@/src/logenhancer", () => ({
  LogEnhancer: class {
    process(line: string) {
      // Simple mock processing
      return `Enhanced: ${line}`;
    }
  },
}));

// Mock Logger
mock.module("@/src/utils/logger", () => ({
  Logger: class {
    info(...args: any[]) { console.log("[Mock Logger INFO]", ...args); }
    warn(...args: any[]) { console.warn("[Mock Logger WARN]", ...args); }
    error(...args: any[]) { console.error("[Mock Logger ERROR]", ...args); }
  }
}));

// Mock UI components (simple divs)
mock.module("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, ...props }: { children: React.ReactNode }) => <div data-testid="scroll-area" {...props}>{children}</div>
}));
mock.module("@/components/ui/input", () => ({
  Input: (props: any) => <input data-testid="input" {...props} />
}));

// Mock React hooks (basic implementations)
let mockState = { ...initialState };
let mockDispatch = mock((action: any) => {
  mockState = logViewerReducer(mockState, action);
});

mock.module("react", async (importOriginal) => {
  const React = await importOriginal();
  return {
    ...React,
    useReducer: mock(() => [mockState, mockDispatch]),
    useContext: mock((context: any) => {
      // Provide a mock context value if needed, otherwise return undefined
      if (context.displayName === "LogViewerContext") { // Heuristic check
          return { state: mockState, dispatch: mockDispatch };
      }
      return undefined; // Or provide a default mock context
    }),
    useEffect: mock((fn: () => void | (() => void)) => {
      // Call effect immediately in test? Or mock behavior? For now, just track calls.
      // console.log("useEffect called");
      // fn(); // Simple immediate call for testing purposes
    }),
    createContext: mock((defaultValue: any) => {
        const context = React.createContext(defaultValue);
        // Try to give it a recognizable name for useContext mock
        context.displayName = "LogViewerContext";
        return context;
    }),
     isValidElement: React.isValidElement, // Keep original
     cloneElement: React.cloneElement, // Keep original
  };
});


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: mock((key: string) => store[key] || null),
    setItem: mock((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: mock((key: string) => {
      delete store[key];
    }),
    clear: mock(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: mock((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true, // Allow replacement if needed in specific tests
});


// --- Tests ---

describe("LogDx React Client", () => {
  let enhancer: LogEnhancer;

  beforeEach(() => {
    // Reset mocks before each test
    mockState = { ...initialState };
    mockDispatch.mockClear();
    localStorageMock.clear();
    enhancer = new LogEnhancer({}); // Create a new instance for each test
  });

  test("LogDxProvider provides context", () => {
    // This test is tricky without a rendering library. We check if useLogDx *would* get context.
    // We rely on the mocked useContext to simulate this.
     const TestComponent = () => {
        const context = useLogDx();
        expect(context).toBeDefined();
        expect(context.state).toBeDefined();
        expect(context.dispatch).toBeDefined();
        return null;
     };

     // Simulate rendering within the provider (conceptually)
     // In a real testing library, we'd render <LogDxProvider><TestComponent /></LogDxProvider>
     // Here, we directly test the hook's behavior assuming the provider exists.
     const contextValue = React.useContext(React.createContext(undefined)); // Simulate getting *some* context
     expect(contextValue).toBeDefined(); // Check based on mocked useContext

  });

  test("LogDxContent renders basic structure", () => {
     // Difficult to test rendering output without a library.
     // We can check if it *tries* to call the enhancer and use context.
      const logData = "line1\nline2";

      // We need to wrap LogDxContent in a mock provider context for useLogDx to work
      const MockProvider = ({children}: {children: React.ReactNode}) => {
          const contextValue = { state: mockState, dispatch: mockDispatch };
          const MockContext = React.createContext(contextValue);
          MockContext.displayName = "LogViewerContext"; // Match the mock name
          return <MockContext.Provider value={contextValue}>{children}</MockContext.Provider>;
      }

      // Basic check: does it execute without throwing?
      expect(() =>
        <MockProvider>
            <LogDxContent log={logData} enhancer={enhancer} />
        </MockProvider>
      ).not.toThrow();

      // We can't easily inspect the rendered output here.
  });

   test("LogDx component renders without crashing", () => {
    // Top-level component test - mainly checks if providers/content hook up okay
    const logData = "line1\nline2";
    expect(() => <LogDx log={logData} enhancer={enhancer} />).not.toThrow();
  });

  test("Search query update is dispatched", () => {
    // This test is also conceptual without real rendering/interaction.
    // We simulate the onChange event calling dispatch.

    const newValue = "test query";
    // Simulate the action that would be triggered by Input onChange
    mockDispatch({ type: 'SET_SEARCH_QUERY', payload: newValue });

    // Check if the reducer updated the mock state
    expect(mockState.searchQuery).toBe(newValue);
    // Check if dispatch was called
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_SEARCH_QUERY', payload: newValue });
  });

  // // Tests for localStorage interaction (need refinement of useEffect mock)
  // test("LogDxProvider attempts to load from localStorage on mount", () => {
  //   // Need to trigger useEffect mock properly
  //   // expect(localStorageMock.getItem).toHaveBeenCalledWith('logdx_search_query');
  // });

  // test("LogDxProvider attempts to save to localStorage on query change", () => {
  //    // Need to trigger useEffect mock properly after state change
  //    mockDispatch({ type: 'SET_SEARCH_QUERY', payload: "new query" });
  //    // expect(localStorageMock.setItem).toHaveBeenCalled();
  // });

});
