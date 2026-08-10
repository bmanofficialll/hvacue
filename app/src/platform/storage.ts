// Web persistence — localStorage. Mirrors mobile/src/platform/storage.ts,
// which uses expo-secure-store. Same async interface on both platforms.

export async function storageGet(key: string): Promise<string | null> {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function storageSet(key: string, value: string): Promise<void> {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export async function storageDelete(key: string): Promise<void> {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
