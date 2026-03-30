import DailyContent from "./DailyContent";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export default function DailyPage() {
  return <DailyContent />;
}
