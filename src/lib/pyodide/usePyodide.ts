"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface RunCodeOptions {
  setupCode?: string;
  validationType?: string;
  expectedOutput?: string;
  checkCode?: string;
}

interface RunCodeResult {
  output: string;
  correct: boolean;
  error: string | null;
}

// Singleton worker instance shared across all components
let workerInstance: Worker | null = null;
let workerReady = false;
let workerInitializing = false;
const pendingCallbacks = new Map<
  string,
  { resolve: (result: RunCodeResult) => void; reject: (err: Error) => void }
>();
const readyListeners: Array<() => void> = [];

function getWorker(): Worker {
  if (workerInstance) return workerInstance;

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  workerInstance = new Worker(`${basePath}/pyodide.worker.js`);
  workerInstance.onmessage = (event) => {
    const { type, id, output, correct, error } = event.data;

    if (type === "ready") {
      workerReady = true;
      workerInitializing = false;
      readyListeners.forEach((cb) => cb());
      readyListeners.length = 0;
    } else if (type === "result") {
      const callback = pendingCallbacks.get(id);
      if (callback) {
        pendingCallbacks.delete(id);
        callback.resolve({ output: output ?? "", correct: Boolean(correct), error: error ?? null });
      }
    } else if (type === "error") {
      workerInitializing = false;
      readyListeners.forEach((cb) => cb());
      readyListeners.length = 0;
    }
  };

  return workerInstance;
}

function waitForReady(): Promise<void> {
  if (workerReady) return Promise.resolve();
  return new Promise((resolve) => {
    readyListeners.push(resolve);
  });
}

function initWorker(): void {
  if (workerReady || workerInitializing) return;
  workerInitializing = true;
  const worker = getWorker();
  worker.postMessage({ type: "init" });
}

let idCounter = 0;

export function usePyodide() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(workerReady);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    // If worker is already ready, sync state
    if (workerReady && !isReady) {
      setIsReady(true);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [isReady]);

  const runCode = useCallback(
    async (code: string, options: RunCodeOptions = {}): Promise<RunCodeResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // Lazy init
        if (!workerReady) {
          initWorker();
          await waitForReady();
          if (mountedRef.current) setIsReady(true);
        }

        const id = `exec_${++idCounter}`;
        const worker = getWorker();

        const result = await new Promise<RunCodeResult>((resolve, reject) => {
          // 30s timeout on the hook side
          const timeout = setTimeout(() => {
            pendingCallbacks.delete(id);
            reject(new Error("Code execution timed out (30 seconds)"));
          }, 30000);

          pendingCallbacks.set(id, {
            resolve: (res) => {
              clearTimeout(timeout);
              resolve(res);
            },
            reject: (err) => {
              clearTimeout(timeout);
              reject(err);
            },
          });

          worker.postMessage({
            type: "execute",
            id,
            code,
            setupCode: options.setupCode ?? "",
            validationType: options.validationType ?? "exact-output",
            expectedOutput: options.expectedOutput ?? "",
            checkCode: options.checkCode ?? "",
          });
        });

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        if (mountedRef.current) setError(message);
        return { output: "", correct: false, error: message };
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    []
  );

  return { isLoading, isReady, error, runCode };
}
