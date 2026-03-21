"use client";

import { useRef, useEffect } from "react";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { EditorState, Compartment } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  minHeight?: string;
}

function makeTheme(minHeight: string) {
  return EditorView.theme({
    "&": { minHeight, fontSize: "14px" },
    ".cm-scroller": { overflow: "auto" },
    ".cm-content": { minHeight },
  });
}

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
  minHeight = "150px",
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const themeCompartment = useRef(new Compartment());
  const isInternalChange = useRef(false);
  onChangeRef.current = onChange;

  // Create editor once (only re-create on readOnly change)
  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      basicSetup,
      python(),
      oneDark,
      themeCompartment.current.of(makeTheme(minHeight)),
    ];

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
      extensions.push(EditorView.editable.of(false));
    } else {
      extensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            isInternalChange.current = true;
            onChangeRef.current?.(update.state.doc.toString());
          }
        })
      );
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  // Update theme dynamically without re-creating the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.current.reconfigure(makeTheme(minHeight)),
    });
  }, [minHeight]);

  // Sync external value changes without re-creating the editor
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-lg border border-gray-700"
    />
  );
}
