/* global importScripts, loadPyodide, self */

let pyodide = null;
let isReady = false;

async function initPyodide() {
  if (pyodide) return;

  self.postMessage({ type: "status", message: "Loading Python environment..." });

  importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js");

  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
  });

  self.postMessage({ type: "status", message: "Loading pandas..." });
  await pyodide.loadPackage(["pandas", "scipy", "matplotlib"]);

  isReady = true;
  self.postMessage({ type: "ready" });
}

async function executeCode(data) {
  const { id, code, setupCode, validationType, expectedOutput, checkCode } = data;

  if (!isReady) {
    await initPyodide();
  }

  // Set up stdout capture
  pyodide.runPython(`
import sys, io
__stdout_capture = io.StringIO()
sys.stdout = __stdout_capture
  `);

  try {
    // Run setup code if provided
    if (setupCode) {
      pyodide.runPython(setupCode);
    }

    // Run user code
    pyodide.runPython(code);

    // Capture output
    const output = pyodide.runPython("__stdout_capture.getvalue()");

    // Validate
    let correct = false;

    if (validationType === "exact-output") {
      const expected = (expectedOutput || "").trim();
      const actual = (output || "").trim();
      correct = actual === expected;
    } else if (validationType === "dataframe-equals" || validationType === "custom-check") {
      try {
        pyodide.globals.set("_output", output || "");
        pyodide.runPython(checkCode || "result = False");
        correct = pyodide.globals.get("result");
      } catch {
        correct = false;
      }
    }

    self.postMessage({
      type: "result",
      id,
      output: output || "",
      correct: Boolean(correct),
      error: null,
    });
  } catch (err) {
    // Capture any output before the error
    let output = "";
    try {
      output = pyodide.runPython("__stdout_capture.getvalue()");
    } catch {
      // ignore
    }

    self.postMessage({
      type: "result",
      id,
      output,
      correct: false,
      error: err.message || String(err),
    });
  } finally {
    // Restore stdout
    try {
      pyodide.runPython("sys.stdout = sys.__stdout__");
    } catch {
      // ignore
    }
  }
}

self.onmessage = async function (event) {
  const { type, ...data } = event.data;

  if (type === "init") {
    try {
      await initPyodide();
    } catch (err) {
      self.postMessage({
        type: "error",
        error: err.message || "Failed to load Python environment",
      });
    }
  } else if (type === "execute") {
    // Set up timeout
    const timeoutId = setTimeout(() => {
      self.postMessage({
        type: "result",
        id: data.id,
        output: "",
        correct: false,
        error: "Code execution timed out (30 seconds)",
      });
    }, 30000);

    try {
      await executeCode(data);
    } finally {
      clearTimeout(timeoutId);
    }
  }
};
