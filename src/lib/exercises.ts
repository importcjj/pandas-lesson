import { ExerciseModule, Exercise } from "@/types";

// Import all exercise modules statically for static export
// When adding new exercise files, add an import here

// Stage 1
import s1Intro from "@/data/exercises/stage1/intro.json";
import s1Series from "@/data/exercises/stage1/series-basics.json";
import s1DfCreate from "@/data/exercises/stage1/dataframe-creation.json";
import s1Inspect from "@/data/exercises/stage1/data-inspection.json";
import s1Selection from "@/data/exercises/stage1/selection.json";
import s1LocIloc from "@/data/exercises/stage1/loc-iloc.json";
import s1Dtypes from "@/data/exercises/stage1/dtypes.json";
import s1Sorting from "@/data/exercises/stage1/sorting.json";
import s1Numpy from "@/data/exercises/stage1/numpy-basics.json";
import s1Broadcast from "@/data/exercises/stage1/numpy-broadcasting.json";

// Stage 2
import s2FileIo from "@/data/exercises/stage2/file-io.json";
import s2Missing from "@/data/exercises/stage2/missing-data.json";
import s2BoolIdx from "@/data/exercises/stage2/boolean-indexing.json";
import s2ColOps from "@/data/exercises/stage2/columns-ops.json";
import s2String from "@/data/exercises/stage2/string-methods.json";
import s2TypeConv from "@/data/exercises/stage2/type-conversion.json";
import s2Rename from "@/data/exercises/stage2/rename-reindex.json";
import s2ApplyMap from "@/data/exercises/stage2/apply-map.json";
import s2NumpyPd from "@/data/exercises/stage2/numpy-pandas.json";

// Stage 3
import s3Groupby from "@/data/exercises/stage3/groupby.json";
import s3Pivot from "@/data/exercises/stage3/pivot.json";
import s3Merge from "@/data/exercises/stage3/merge-join.json";
import s3Window from "@/data/exercises/stage3/window.json";
import s3Datetime from "@/data/exercises/stage3/datetime.json";
import s3Categorical from "@/data/exercises/stage3/categorical.json";
import s3MultiIdx from "@/data/exercises/stage3/multiindex.json";
import s3Viz from "@/data/exercises/stage3/visualization.json";

// Stage 4
import s4Perf from "@/data/exercises/stage4/performance.json";
import s4LargeDs from "@/data/exercises/stage4/large-datasets.json";
import s4AdvGroupby from "@/data/exercises/stage4/advanced-groupby.json";
import s4Reshape from "@/data/exercises/stage4/reshaping.json";
import s4Text from "@/data/exercises/stage4/text-processing.json";
import s4Cleaning from "@/data/exercises/stage4/project-cleaning.json";
import s4Eda from "@/data/exercises/stage4/project-eda.json";
import s4Best from "@/data/exercises/stage4/best-practices.json";

// Stage 5
import s5DescStats from "@/data/exercises/stage5/desc-stats.json";
import s5HypTest from "@/data/exercises/stage5/hypothesis-test.json";
import s5CorrReg from "@/data/exercises/stage5/correlation-regression.json";
import s5FeatEng from "@/data/exercises/stage5/feature-eng.json";
import s5SklearnIntro from "@/data/exercises/stage5/sklearn-intro.json";
import s5Classification from "@/data/exercises/stage5/classification.json";
import s5RegressionModels from "@/data/exercises/stage5/regression-models.json";
import s5ModelEval from "@/data/exercises/stage5/model-eval.json";

// Stage 6
import s6FinTs from "@/data/exercises/stage6/fin-timeseries.json";
import s6TechInd from "@/data/exercises/stage6/tech-indicators.json";
import s6RiskMetrics from "@/data/exercises/stage6/risk-metrics.json";
import s6FactorAnalysis from "@/data/exercises/stage6/factor-analysis.json";
import s6Backtesting from "@/data/exercises/stage6/backtesting.json";
import s6Portfolio from "@/data/exercises/stage6/portfolio.json";
import s6TsForecast from "@/data/exercises/stage6/ts-forecast.json";
import s6QuantProject from "@/data/exercises/stage6/quant-project.json";

const asModule = (m: unknown) => m as unknown as ExerciseModule;

const allModules: ExerciseModule[] = [
  // Stage 1
  asModule(s1Intro), asModule(s1Series), asModule(s1DfCreate), asModule(s1Inspect),
  asModule(s1Selection), asModule(s1LocIloc), asModule(s1Dtypes), asModule(s1Sorting), asModule(s1Numpy), asModule(s1Broadcast),
  // Stage 2
  asModule(s2FileIo), asModule(s2Missing), asModule(s2BoolIdx), asModule(s2ColOps),
  asModule(s2String), asModule(s2TypeConv), asModule(s2Rename), asModule(s2ApplyMap), asModule(s2NumpyPd),
  // Stage 3
  asModule(s3Groupby), asModule(s3Pivot), asModule(s3Merge), asModule(s3Window),
  asModule(s3Datetime), asModule(s3Categorical), asModule(s3MultiIdx), asModule(s3Viz),
  // Stage 4
  asModule(s4Perf), asModule(s4LargeDs), asModule(s4AdvGroupby), asModule(s4Reshape),
  asModule(s4Text), asModule(s4Cleaning), asModule(s4Eda), asModule(s4Best),
  // Stage 5
  asModule(s5DescStats), asModule(s5HypTest), asModule(s5CorrReg), asModule(s5FeatEng),
  asModule(s5SklearnIntro), asModule(s5Classification), asModule(s5RegressionModels), asModule(s5ModelEval),
  // Stage 6
  asModule(s6FinTs), asModule(s6TechInd), asModule(s6RiskMetrics), asModule(s6FactorAnalysis),
  asModule(s6Backtesting), asModule(s6Portfolio), asModule(s6TsForecast), asModule(s6QuantProject),
];

export function getAllExerciseModules(): ExerciseModule[] {
  return allModules;
}

export function getExerciseModulesByStage(stageId: string): ExerciseModule[] {
  return allModules.filter((m) => m.stageId === stageId);
}

export function getExerciseModulesByLesson(
  stageId: string,
  lessonId: string
): ExerciseModule[] {
  return allModules.filter(
    (m) => m.stageId === stageId && m.lessonId === lessonId
  );
}

export function getExerciseById(exerciseId: string): Exercise | undefined {
  for (const mod of allModules) {
    const exercise = mod.exercises.find((e) => e.id === exerciseId);
    if (exercise) return exercise;
  }
  return undefined;
}

export function getExercisesByLesson(
  stageId: string,
  lessonId: string
): Exercise[] {
  return getExerciseModulesByLesson(stageId, lessonId).flatMap(
    (m) => m.exercises
  );
}

export function getAllExercises(): Exercise[] {
  return allModules.flatMap((m) => m.exercises);
}

export function getExercisesByTags(tags: string[]): Exercise[] {
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));
  return allModules
    .filter((m) => m.tags.some((t) => tagSet.has(t.toLowerCase())))
    .flatMap((m) => m.exercises);
}
