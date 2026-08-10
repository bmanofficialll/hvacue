// Mobile persistence — expo-secure-store keeps the API key in the device
// keychain / keystore. Mirrors app/src/platform/storage.ts (localStorage).
// SecureStore keys must be alphanumeric + ._- , so callers use safe keys.

import * as SecureStore from 'expo-secure-store';

export async function storageGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function storageSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    /* ignore */
  }
}

export async function storageDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* ignore */
  }
}
