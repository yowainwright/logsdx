"use client";

import React, { isValidElement, createContext, useReducer, useContext, useEffect } from "react";
import type { ReactElement, ReactNode, Dispatch } from "react";
import { LogEnhancer } from "@/src/logenhancer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Logger } from "@/src/utils/logger";
import "@/src/clients/react/globals.css";

const LOCALSTORAGE_KEY = 'logdx_search_query';
const DEFAULT_TTL_SECONDS = 60;

export type LogDxState = {
  searchQuery: string;
}

export type LogDxAction = 
  | { type: 'SET_SEARCH_QUERY'; payload: string };

export const initialState: LogDxState = {
  searchQuery: '',
};

export const logViewerReducer = (state: LogDxState, action: LogDxAction): LogDxState => {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      if (state.searchQuery === action.payload) {
        return state;
      }
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
};

export type LogDxContextProps ={
  state: LogDxState;
  dispatch: Dispatch<LogDxAction>;
}

export const LogViewerContext = createContext<LogDxContextProps | undefined>(undefined);

export type LogDxProviderProps = {
  children: ReactNode;
  ttl: number;
  logSearchKey: string;
}

export const LogDxProvider: React.FC<LogDxProviderProps> = ({ children, ttl, logSearchKey }) => {
  const [state, dispatch] = useReducer(logViewerReducer, initialState);
  const logger = new Logger({ level: 'error', prefix: 'LogDxProvider' });

  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

  useEffect(() => {
    if (!isLocalStorageAvailable) return;

    try {
      const storedItem = localStorage.getItem(LOCALSTORAGE_KEY);
      if (storedItem) {
        const { query, timestamp } = JSON.parse(storedItem);
        const now = Date.now();
        if (typeof query === 'string' && typeof timestamp === 'number' && now - timestamp < ttl) {
          if (query !== initialState.searchQuery) {
             dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
          }
        } else {
          localStorage.removeItem(logSearchKey);
        }
      }
    } catch (error) {
      logger.error("Failed to load search query from localStorage:", error as Error);
      localStorage.removeItem(logSearchKey);
    }
  }, [ttl, isLocalStorageAvailable]);

  useEffect(() => {
    if (!isLocalStorageAvailable) return;

    try {
      const itemToStore = JSON.stringify({
        query: state.searchQuery,
        timestamp: Date.now()
      });
      localStorage.setItem(logSearchKey, itemToStore);
    } catch (error) {
      logger.error("Failed to save search query to localStorage:", error as Error);
    }
  }, [state.searchQuery, isLocalStorageAvailable]);

  return (
    <LogViewerContext.Provider value={{ state, dispatch }}>
      {children}
    </LogViewerContext.Provider>
  );
};

export const useLogDx = (): LogDxContextProps => {
  const context = useContext(LogViewerContext);
  if (context === undefined) {
    throw new Error('useLogDx must be used within a LogDxProvider');
  }
  return context;
};

export type LogDxProps = {
  log: string;
  enhancer: LogEnhancer;
  ttl?: number;
}

export const LogDxContent: React.FC<Omit<LogDxProps, 'ttl'>> = ({ log, enhancer }) => {
  const { state, dispatch } = useLogDx();
  const { searchQuery } = state;

  const lines = log.split("\n");

  const filteredLines = lines.filter((line) =>
    line.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full flex flex-col">
      <Input
        type="text"
        placeholder="Search logs..."
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
          dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })
        }
        className="mb-2"
      />
      <ScrollArea className="h-full w-full rounded-md font-mono text-sm flex-grow">
        {filteredLines.map((line, i) => {
          const enhanced = enhancer.process(line);
          if (isValidElement(enhanced)) {
            return React.cloneElement(enhanced as ReactElement, { key: i });
          }
          return (
            <div key={`line-${i}`} className="whitespace-pre-wrap p-4">
              {enhanced}
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
};

export const LogDx: React.FC<LogDxProps> = ({ 
  log,
  enhancer,
  ttl = DEFAULT_TTL_SECONDS
}) => {
  const ttlMilliseconds = ttl * 1000;

  return (
    <LogDxProvider logSearchKey={LOCALSTORAGE_KEY} ttl={ttlMilliseconds}>
      <LogDxContent log={log} enhancer={enhancer} />
    </LogDxProvider>
  );
};
