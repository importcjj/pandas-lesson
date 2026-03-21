import { Locale } from "@/types";
import zhMessages from "../../../messages/zh.json";
import enMessages from "../../../messages/en.json";

const messages: Record<Locale, typeof zhMessages> = {
  zh: zhMessages,
  en: enMessages,
};

export function getMessages(locale: Locale) {
  return messages[locale] ?? messages.zh;
}
