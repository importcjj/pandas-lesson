import ReferenceContent from "./ReferenceContent";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export default function ReferencePage() {
  return <ReferenceContent />;
}
