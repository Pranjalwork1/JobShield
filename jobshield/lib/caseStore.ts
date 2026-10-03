import { JobShieldCase, JobShieldFolder } from "@/types/jobshield";

const DB_NAME = "JobShieldDB";
const DB_VERSION = 1;

export const SYSTEM_ALL_JOBS_ID = "all";
export const DEFAULT_MY_JOBS_ID = "folder_my_jobs";

export const SYSTEM_ALL_JOBS_FOLDER: JobShieldFolder = {
  id: SYSTEM_ALL_JOBS_ID,
  name: "All Jobs",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  isSystem: true,
};

export const DEFAULT_MY_JOBS_FOLDER: JobShieldFolder = {
  id: DEFAULT_MY_JOBS_ID,
  name: "My Jobs",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  isSystem: false,
};

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only accessible in browser environment."));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("folders")) {
        db.createObjectStore("folders", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("cases")) {
        const caseStore = db.createObjectStore("cases", { keyPath: "id" });
        caseStore.createIndex("folderId", "folderId", { unique: false });
        caseStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains("evidence_blobs")) {
        const evidenceStore = db.createObjectStore("evidence_blobs", { keyPath: "id" });
        evidenceStore.createIndex("caseId", "caseId", { unique: false });
      }
    };

    request.onsuccess = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Seed initial folders if missing
      try {
        await seedDefaultFolders(db);
      } catch (seedErr) {
        console.warn("Seeding initial folders:", seedErr);
      }

      resolve(db);
    };

    request.onerror = () => {
      reject(request.error || new Error("Failed to open IndexedDB."));
    };
  });

  return dbPromise;
}

async function seedDefaultFolders(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["folders", "cases"], "readwrite");
    const folderStore = tx.objectStore("folders");
    const checkReq = folderStore.get(DEFAULT_MY_JOBS_ID);

    checkReq.onsuccess = () => {
      if (!checkReq.result) {
        folderStore.put(DEFAULT_MY_JOBS_FOLDER);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ----------------------------------------------------
// FOLDER OPERATIONS
// ----------------------------------------------------

export async function getFolders(): Promise<JobShieldFolder[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("folders", "readonly");
    const store = tx.objectStore("folders");
    const req = store.getAll();

    req.onsuccess = () => {
      const list = (req.result as JobShieldFolder[]) || [];
      // Always ensure My Jobs exists
      if (!list.some((f) => f.id === DEFAULT_MY_JOBS_ID)) {
        list.unshift(DEFAULT_MY_JOBS_FOLDER);
      }
      resolve(list);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function createFolder(name: string): Promise<JobShieldFolder> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Folder name cannot be empty.");
  }

  const existing = await getFolders();
  if (
    existing.some(
      (f) => f.name.toLowerCase() === trimmed.toLowerCase() || trimmed.toLowerCase() === "all jobs"
    )
  ) {
    throw new Error(`A folder named "${trimmed}" already exists.`);
  }

  const newFolder: JobShieldFolder = {
    id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: false,
  };

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("folders", "readwrite");
    tx.objectStore("folders").put(newFolder);
    tx.oncomplete = () => resolve(newFolder);
    tx.onerror = () => reject(tx.error);
  });
}

export async function renameFolder(id: string, newName: string): Promise<JobShieldFolder> {
  const trimmed = newName.trim();
  if (!trimmed) {
    throw new Error("Folder name cannot be empty.");
  }
  if (id === SYSTEM_ALL_JOBS_ID || id === DEFAULT_MY_JOBS_ID && trimmed.toLowerCase() === "all jobs") {
    throw new Error("Cannot rename system folders.");
  }

  const existing = await getFolders();
  if (
    existing.some(
      (f) => f.id !== id && f.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    throw new Error(`A folder named "${trimmed}" already exists.`);
  }

  const target = existing.find((f) => f.id === id);
  if (!target) {
    throw new Error("Folder not found.");
  }

  target.name = trimmed;
  target.updatedAt = new Date().toISOString();

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("folders", "readwrite");
    tx.objectStore("folders").put(target);
    tx.oncomplete = () => resolve(target);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteFolder(
  id: string,
  moveToFolderId: string = DEFAULT_MY_JOBS_ID
): Promise<void> {
  if (id === SYSTEM_ALL_JOBS_ID || id === DEFAULT_MY_JOBS_ID) {
    throw new Error("System folders cannot be deleted.");
  }

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["folders", "cases"], "readwrite");
    const folderStore = tx.objectStore("folders");
    const caseStore = tx.objectStore("cases");

    // 1. Move all cases inside this folder to target folder so no cases are lost
    const caseReq = caseStore.getAll();
    caseReq.onsuccess = () => {
      const allCases = (caseReq.result as JobShieldCase[]) || [];
      for (const c of allCases) {
        if (c.folderId === id) {
          c.folderId = moveToFolderId;
          c.updatedAt = new Date().toISOString();
          caseStore.put(c);
        }
      }
    };

    // 2. Delete folder
    folderStore.delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ----------------------------------------------------
// CASE OPERATIONS
// ----------------------------------------------------

export async function getCases(): Promise<JobShieldCase[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["cases", "evidence_blobs"], "readonly");
    const caseStore = tx.objectStore("cases");
    const blobStore = tx.objectStore("evidence_blobs");

    const casesReq = caseStore.getAll();
    const blobsReq = blobStore.getAll();

    let casesResult: JobShieldCase[] | null = null;
    let blobsResult: Array<{ id: string; name: string; mimeType: string; blob: Blob }> | null = null;

    const tryHydrate = () => {
      if (casesResult === null || blobsResult === null) return;

      const blobMap = new Map<string, { name: string; mimeType: string; blob: Blob }>();
      blobsResult.forEach((b) => blobMap.set(b.id, b));

      const hydrated = casesResult.map((c) => ({
        ...c,
        evidence: (c.evidence || []).map((ev) => {
          if (ev.file) return ev;
          const b = blobMap.get(ev.id);
          if (b && b.blob) {
            return {
              ...ev,
              file: new File([b.blob], b.name || ev.name, {
                type: b.mimeType || ev.mimeType || "application/octet-stream",
              }),
            };
          }
          return ev;
        }),
      }));

      resolve(hydrated);
    };

    casesReq.onsuccess = () => {
      casesResult = (casesReq.result as JobShieldCase[]) || [];
      tryHydrate();
    };

    blobsReq.onsuccess = () => {
      blobsResult = (blobsReq.result as Array<{ id: string; name: string; mimeType: string; blob: Blob }>) || [];
      tryHydrate();
    };

    casesReq.onerror = () => reject(casesReq.error);
    blobsReq.onerror = () => reject(blobsReq.error);
  });
}

export async function getCaseById(id: string): Promise<JobShieldCase | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["cases", "evidence_blobs"], "readonly");
    const caseStore = tx.objectStore("cases");
    const blobStore = tx.objectStore("evidence_blobs");
    const req = caseStore.get(id);

    req.onsuccess = () => {
      const found = (req.result as JobShieldCase) || null;
      if (!found) {
        resolve(null);
        return;
      }

      if (!found.evidence || found.evidence.length === 0) {
        resolve(found);
        return;
      }

      // Rehydrate files from Blob store using caseId index
      const blobIndex = blobStore.index("caseId");
      const blobReq = blobIndex.getAll(id);

      blobReq.onsuccess = () => {
        const blobs = (blobReq.result || []) as Array<{ id: string; name: string; mimeType: string; blob: Blob }>;
        const blobMap = new Map<string, { name: string; mimeType: string; blob: Blob }>();
        blobs.forEach((b) => blobMap.set(b.id, b));

        const hydratedEvidence = found.evidence.map((ev) => {
          if (ev.file) return ev;
          const b = blobMap.get(ev.id);
          if (b && b.blob) {
            return {
              ...ev,
              file: new File([b.blob], b.name || ev.name, {
                type: b.mimeType || ev.mimeType || "application/octet-stream",
              }),
            };
          }
          return ev;
        });

        resolve({
          ...found,
          evidence: hydratedEvidence,
        });
      };

      blobReq.onerror = () => resolve(found);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function saveCase(caseData: JobShieldCase): Promise<void> {
  const db = await getDB();

  // Create a serializable clone of case data (without native File objects directly in case record)
  const caseToStore: JobShieldCase = {
    ...caseData,
    updatedAt: new Date().toISOString(),
    evidence: caseData.evidence.map((e) => ({
      id: e.id,
      type: e.type,
      name: e.name,
      mimeType: e.mimeType,
      size: e.size,
      text: e.text,
      url: e.url,
      previewUrl: e.previewUrl,
    })),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(["cases", "evidence_blobs"], "readwrite");
    const caseStore = tx.objectStore("cases");
    const blobStore = tx.objectStore("evidence_blobs");

    // Put case
    caseStore.put(caseToStore);

    // Save any binary blobs
    for (const item of caseData.evidence) {
      if (item.file && (item.type === "pdf" || item.type === "image")) {
        blobStore.put({
          id: item.id,
          caseId: caseData.id,
          name: item.name,
          mimeType: item.mimeType || item.file.type,
          blob: item.file,
        });
      }
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function createCase(params?: {
  title?: string;
  company?: string;
  folderId?: string;
}): Promise<JobShieldCase> {
  const now = new Date().toISOString();
  const folderId =
    params?.folderId && params.folderId !== SYSTEM_ALL_JOBS_ID
      ? params.folderId
      : DEFAULT_MY_JOBS_ID;

  const newCase: JobShieldCase = {
    id: `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    folderId,
    title: params?.title?.trim() || null,
    company: params?.company?.trim() || null,
    recruiterMessage: "",
    jobUrl: "",
    evidence: [],
    analysis: null,
    status: "draft",
    completedVerificationTargets: [],
    createdAt: now,
    updatedAt: now,
    lastAnalyzedAt: null,
  };

  await saveCase(newCase);
  return newCase;
}

export async function deleteCase(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["cases", "evidence_blobs"], "readwrite");
    const caseStore = tx.objectStore("cases");
    const blobStore = tx.objectStore("evidence_blobs");

    caseStore.delete(id);

    // Clean up associated evidence blobs
    const index = blobStore.index("caseId");
    const req = index.getAllKeys(id);
    req.onsuccess = () => {
      const keys = req.result;
      for (const k of keys) {
        blobStore.delete(k);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function moveCase(caseId: string, targetFolderId: string): Promise<void> {
  const c = await getCaseById(caseId);
  if (!c) throw new Error("Case not found.");

  c.folderId = targetFolderId === SYSTEM_ALL_JOBS_ID ? DEFAULT_MY_JOBS_ID : targetFolderId;
  c.updatedAt = new Date().toISOString();

  await saveCase(c);
}

/**
 * Computes a human-readable display title for a case following Requirement 21:
 * `${job_title} • ${company}` when both exist.
 * Otherwise job title, company, or "Evidence Case".
 */
export function getCaseDisplayTitle(c: JobShieldCase): {
  title: string;
  company: string;
  displayString: string;
} {
  const role = c.title || c.analysis?.case_summary?.job_title || null;
  const company = c.company || c.analysis?.case_summary?.company || null;

  let displayString = "Evidence Case";
  if (role && company) {
    displayString = `${role} • ${company}`;
  } else if (role) {
    displayString = role;
  } else if (company) {
    displayString = company;
  }

  return {
    title: role || "Evidence Case",
    company: company || "Organization Unspecified",
    displayString,
  };
}
