"use client";

import { UserProgress, ExerciseAttempt, ReviewCard } from "@/types";

const DB_NAME = "pandas-lesson";
const DB_VERSION = 1;

const STORES = {
  progress: "progress",
  attempts: "attempts",
  reviews: "reviews",
  settings: "settings",
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORES.progress)) {
        const store = db.createObjectStore(STORES.progress, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("lessonId", "lessonId", { unique: false });
        store.createIndex("stageId", "stageId", { unique: false });
        store.createIndex("lessonStage", ["stageId", "lessonId"], {
          unique: true,
        });
      }

      if (!db.objectStoreNames.contains(STORES.attempts)) {
        const store = db.createObjectStore(STORES.attempts, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("exerciseId", "exerciseId", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.reviews)) {
        const store = db.createObjectStore(STORES.reviews, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("exerciseId", "exerciseId", { unique: true });
        store.createIndex("nextReviewDate", "nextReviewDate", {
          unique: false,
        });
      }

      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  return withStore(storeName, "readonly", (store) => store.getAll());
}

// Progress operations
export async function getProgress(
  stageId: string,
  lessonId: string
): Promise<UserProgress | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.progress, "readonly");
    const store = tx.objectStore(STORES.progress);
    const index = store.index("lessonStage");
    const request = index.get([stageId, lessonId]);
    request.onsuccess = () => resolve(request.result ?? undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllProgress(): Promise<UserProgress[]> {
  return getAllFromStore(STORES.progress);
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  const existing = await getProgress(progress.stageId, progress.lessonId);
  if (existing) {
    progress.id = existing.id;
  }
  await withStore(STORES.progress, "readwrite", (store) =>
    store.put(progress)
  );
}

// Attempt operations
export async function saveAttempt(attempt: ExerciseAttempt): Promise<void> {
  await withStore(STORES.attempts, "readwrite", (store) =>
    store.add(attempt)
  );
}

export async function getAttemptsByExercise(
  exerciseId: string
): Promise<ExerciseAttempt[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.attempts, "readonly");
    const store = tx.objectStore(STORES.attempts);
    const index = store.index("exerciseId");
    const request = index.getAll(exerciseId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Review operations
export async function getReviewCard(
  exerciseId: string
): Promise<ReviewCard | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.reviews, "readonly");
    const store = tx.objectStore(STORES.reviews);
    const index = store.index("exerciseId");
    const request = index.get(exerciseId);
    request.onsuccess = () => resolve(request.result ?? undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllReviewCards(): Promise<ReviewCard[]> {
  return getAllFromStore(STORES.reviews);
}

export async function getDueReviewCards(): Promise<ReviewCard[]> {
  const all = await getAllReviewCards();
  const now = Date.now();
  return all.filter((card) => card.nextReviewDate <= now);
}

export async function saveReviewCard(card: ReviewCard): Promise<void> {
  const existing = await getReviewCard(card.exerciseId);
  if (existing) {
    card.id = existing.id;
  }
  await withStore(STORES.reviews, "readwrite", (store) => store.put(card));
}

// Settings operations
export async function getSetting(key: string): Promise<unknown> {
  return withStore(STORES.settings, "readonly", (store) => store.get(key)).then(
    (result) => (result as { key: string; value: unknown } | undefined)?.value
  );
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await withStore(STORES.settings, "readwrite", (store) =>
    store.put({ key, value })
  );
}

// Export/Import
export async function exportAllData(): Promise<string> {
  const [progress, attempts, reviews] = await Promise.all([
    getAllProgress(),
    getAllFromStore<ExerciseAttempt>(STORES.attempts),
    getAllReviewCards(),
  ]);
  return JSON.stringify({ progress, attempts, reviews }, null, 2);
}

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  const storeNames = [STORES.progress, STORES.attempts, STORES.reviews];
  for (const name of storeNames) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(name, "readwrite");
      const store = tx.objectStore(name);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
