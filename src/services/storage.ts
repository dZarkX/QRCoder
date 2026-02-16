import type { QrCustomizationSettings, QrState } from '@/types/qr';

const STORAGE_KEYS = {
  lastState: 'lastState',
  defaultSettings: 'defaultSettings'
} as const;

export interface StorageShape {
  [STORAGE_KEYS.lastState]?: QrState;
  [STORAGE_KEYS.defaultSettings]?: QrCustomizationSettings;
}

export async function getFromStorage<K extends keyof StorageShape>(
  key: K
): Promise<StorageShape[K] | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as StorageShape[K] | undefined;
}

export async function setInStorage<K extends keyof StorageShape>(
  key: K,
  value: StorageShape[K]
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export function getStorageKeys() {
  return STORAGE_KEYS;
}
