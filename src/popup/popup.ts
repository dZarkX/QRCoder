import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/textfield/outlined-text-field.js';

import { qs } from '@/utils/dom';
import { getDefaultCustomizationSettings } from '@/services/defaults';
import { getFromStorage, getStorageKeys, setInStorage } from '@/services/storage';
import { QrGenerator } from '@/services/qr-generator';
import type { QrState } from '@/types/qr';
import { consumePendingContext } from '@/popup/context-consume';

const keys = getStorageKeys();

function showToast(message: string) {
  const el = qs<HTMLDivElement>(document, '#snackbar');
  el.textContent = message;
  el.classList.add('show');
  window.setTimeout(() => el.classList.remove('show'), 1600);
}

async function getActiveTabUrl(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) throw new Error('No active tab URL');
  return tab.url;
}

async function loadInitialState(): Promise<QrState> {
  const saved = await getFromStorage(keys.lastState);
  if (saved) return saved;

  const defaults = (await getFromStorage(keys.defaultSettings)) ?? getDefaultCustomizationSettings();
  return {
    sourceType: 'customText',
    payload: '',
    settings: defaults
  };
}

async function main() {
  const btnActiveTab = qs<HTMLElement>(document, '#btnActiveTab');
  const btnGenerate = qs<HTMLElement>(document, '#btnGenerate');
  const btnOptions = qs<HTMLElement>(document, '#btnOptions');
  const btnDownloadPng = qs<HTMLElement>(document, '#btnDownloadPng');
  const btnDownloadSvg = qs<HTMLElement>(document, '#btnDownloadSvg');
  const btnCopy = qs<HTMLElement>(document, '#btnCopy');
  const inputPayload = qs<HTMLInputElement>(document, '#inputPayload');
  const qrMount = qs<HTMLElement>(document, '#qrMount');

  const state = await loadInitialState();
  inputPayload.value = state.payload;

  const generator = new QrGenerator();
  generator.render({ element: qrMount });

  async function generateAndPersist(next: Partial<QrState>) {
    const merged: QrState = {
      ...state,
      ...next,
      payload: next.payload ?? inputPayload.value,
      settings: next.settings ?? state.settings
    };

    if (!merged.payload.trim()) {
      showToast('Enter text or use active tab URL');
      return;
    }

    await generator.update(merged.payload, merged.settings);
    await setInStorage(keys.lastState, merged);
    state.sourceType = merged.sourceType;
    state.payload = merged.payload;
    state.settings = merged.settings;
  }

  btnActiveTab.addEventListener('click', async () => {
    try {
      const url = await getActiveTabUrl();
      inputPayload.value = url;
      await generateAndPersist({ sourceType: 'activeTabUrl', payload: url });
      showToast('Generated from active tab');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to read active tab URL');
    }
  });

  btnGenerate.addEventListener('click', async () => {
    await generateAndPersist({ sourceType: 'customText', payload: inputPayload.value });
  });

  btnOptions.addEventListener('click', async () => {
    await chrome.runtime.openOptionsPage();
  });

  btnDownloadPng.addEventListener('click', async () => {
    if (!state.payload.trim()) {
      showToast('Nothing to download');
      return;
    }
    await generator.download('png', 'qr');
  });

  btnDownloadSvg.addEventListener('click', async () => {
    if (!state.payload.trim()) {
      showToast('Nothing to download');
      return;
    }
    await generator.download('svg', 'qr');
  });

  btnCopy.addEventListener('click', async () => {
    if (!state.payload.trim()) {
      showToast('Nothing to copy');
      return;
    }

    try {
      const blob = await generator.getBlob('png');
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      showToast('Copied to clipboard');
    } catch {
      showToast('Clipboard copy failed');
    }
  });

  const pending = await consumePendingContext();
  if (pending?.payload) {
    inputPayload.value = pending.payload;
    await generateAndPersist({ sourceType: pending.sourceType, payload: pending.payload });
    showToast('Generated from context menu');
    return;
  }

  if (state.payload.trim()) {
    await generator.update(state.payload, state.settings);
  }
}

main().catch(() => {
  const el = document.createElement('div');
  el.style.padding = '12px';
  el.textContent = 'Failed to start popup.';
  document.body.appendChild(el);
});
