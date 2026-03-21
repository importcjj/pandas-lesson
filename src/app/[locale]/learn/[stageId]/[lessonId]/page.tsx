import { locales } from "@/lib/i18n/config";
import curriculum from "@/data/curriculum.json";
import LessonContent from "./LessonContent";

export function generateStaticParams() {
  const params: { locale: string; stageId: string; lessonId: string }[] = [];
  for (const locale of locales) {
    for (const stage of curriculum.stages) {
      for (const lesson of stage.lessons) {
        params.push({ locale, stageId: stage.id, lessonId: lesson.id });
      }
    }
  }
  return params;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; stageId: string; lessonId: string }>;
}) {
  const { stageId, lessonId } = await params;
  return <LessonContent stageId={stageId} lessonId={lessonId} />;
}
