"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { Locale } from "@/types";
import { getMessages } from "./messages";

type Messages = ReturnType<typeof getMessages>;

interface I18nContextValue {
  locale: Locale;
  messages: Messages;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const messages = getMessages(locale);

  function t(path: string): string {
    const keys = path.split(".");
    let value: unknown = messages;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }
    return typeof value === "string" ? value : path;
  }

  return (
    <I18nContext.Provider value={{ locale, messages, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}
