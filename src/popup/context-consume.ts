import type { QrSourceType } from '@/types/qr';

export interface PendingContext {
  payload: string;
  sourceType: QrSourceType;
  at: number;
}

export async function consumePendingContext(maxAgeMs = 60_000): Promise<PendingContext | undefined> {
  const result = await chrome.storage.local.get('pendingContext');
  const pending = result.pendingContext as PendingContext | undefined;
  if (!pending) return undefined;

  await chrome.storage.local.remove('pendingContext');

  if (Date.now() - pending.at > maxAgeMs) return undefined;
  return pending;
}
