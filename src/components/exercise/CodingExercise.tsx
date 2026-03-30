"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n/context";
import { usePyodide } from "@/lib/pyodide/usePyodide";
import { CodingExercise as CodingExerciseType } from "@/types";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-40 animate-pulse rounded-lg bg-gray-800" />
  ),
});

interface Props {
  exercise: CodingExerciseType;
  onResult: (correct: boolean, userAnswer?: unknown) => void;
  savedCode?: string;
}

export default function CodingExercise({ exercise, onResult, savedCode }: Props) {
  const { locale } = useTranslation();
  const { isLoading: pyodideLoading, isReady: pyodideReady, runCode } = usePyodide();
  const [code, setCode] = useState(savedCode ?? exercise.starterCode);
  const [output, setOutput] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  async function handleRun() {
    setIsRunning(true);
    setError(null);
    setOutput(null);
    setImages([]);

    const result = await runCode(code, {
      setupCode: exercise.setupCode,
      validationType: exercise.validationType,
      expectedOutput: exercise.expectedOutput,
      checkCode: exercise.checkCode,
    });

    setOutput(result.output);
    setImages(result.images || []);
    if (result.error) {
      setError(result.error);
    }
    onResult(result.correct, code);
    setIsRunning(false);
  }

  function handleReset() {
    setCode(exercise.starterCode);
    setOutput(null);
    setError(null);
  }

  const runButtonLabel = isRunning
    ? pyodideLoading && !pyodideReady
      ? locale === "zh"
        ? "加载 Python..."
        : "Loading Python..."
      : locale === "zh"
      ? "运行中..."
      : "Running..."
    : locale === "zh"
    ? "▶ 运行代码"
    : "▶ Run Code";

  return (
    <div>
      {/* Setup code display (read-only, shows imports and variables) */}
      {exercise.setupCode && (
        <div className="mb-2">
          <div className="mb-1 text-xs font-medium text-gray-500">
            {locale === "zh" ? "预设代码（已自动加载）" : "Setup Code (auto-loaded)"}
          </div>
          <pre className="overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-600 font-mono border border-gray-200">
            {exercise.setupCode}
          </pre>
        </div>
      )}

      {/* Code editor toolbar */}
      <div className="flex items-center justify-between rounded-t-lg bg-gray-800 px-4 py-2">
        <span className="text-xs text-gray-400">Python</span>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200"
          >
            {locale === "zh" ? "重置" : "Reset"}
          </button>
        </div>
      </div>

      {/* CodeMirror editor */}
      <CodeEditor
        value={code}
        onChange={setCode}
        minHeight={`${Math.max(6, code.split("\n").length + 1) * 22}px`}
      />

      {/* Action buttons */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {runButtonLabel}
        </button>
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          {showSolution
            ? locale === "zh"
              ? "隐藏答案"
              : "Hide Solution"
            : locale === "zh"
            ? "查看答案"
            : "Show Solution"}
        </button>
      </div>

      {/* Output */}
      {(output || error) && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-1 text-xs font-medium text-gray-500">
            {locale === "zh" ? "输出" : "Output"}
          </div>
          <pre
            className={`whitespace-pre-wrap font-mono text-sm ${
              error ? "text-red-600" : "text-gray-800"
            }`}
          >
            {error ?? output}
          </pre>
        </div>
      )}

      {/* Plot images */}
      {images.length > 0 && (
        <div className="mt-3 space-y-2">
          {images.map((base64, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <img
                src={`data:image/png;base64,${base64}`}
                alt={`Plot ${i + 1}`}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* Solution */}
      {showSolution && (
        <div className="mt-3">
          <div className="mb-1 text-xs font-medium text-blue-600">
            {locale === "zh" ? "参考答案" : "Reference Solution"}
          </div>
          <CodeEditor value={exercise.solutionCode} readOnly />
        </div>
      )}
    </div>
  );
}
