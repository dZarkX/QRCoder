import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/switch/switch.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';

import { qs } from '@/utils/dom';
import { getDefaultCustomizationSettings } from '@/services/defaults';
import { getFromStorage, getStorageKeys, setInStorage } from '@/services/storage';
import { QrGenerator } from '@/services/qr-generator';
import type { QrState, QrDotStyle } from '@/types/qr';
import { consumePendingContext } from '@/popup/context-consume';

const keys = getStorageKeys();

type PopupStateUpdate = Omit<Partial<QrState>, 'settings'> & {
  settings?: Partial<QrState['settings']>;
};

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

function mergeSettings(prev: QrState['settings'], next: Partial<QrState['settings']>): QrState['settings'] {
  return {
    ...prev,
    ...next,
    colors: { ...prev.colors, ...next.colors },
    gradient: { ...prev.gradient, ...next.gradient },
    logo: { ...prev.logo, ...next.logo },
    size: { ...prev.size, ...next.size },
    frame: { ...prev.frame, ...next.frame }
  };
}

function readFormSettings(): Partial<QrState['settings']> {
  const fg = qs<HTMLInputElement>(document, '#fg').value;
  const bg = qs<HTMLInputElement>(document, '#bg').value;
  const eyeInner = qs<HTMLInputElement>(document, '#eyeInner').value;
  const eyeOuter = qs<HTMLInputElement>(document, '#eyeOuter').value;
  const transparentBg = (qs<any>(document, '#transparentBg') as any).selected;
  const dotStyleSelect = qs<any>(document, '#dotStyle');
  const dotStyleValue = (dotStyleSelect as any).value ?? (dotStyleSelect as any).selected;
  const dotStyle = ['square', 'rounded', 'dots'].includes(dotStyleValue) ? dotStyleValue as QrDotStyle : 'square';
  const gradientEnabled = (qs<any>(document, '#gradientEnabled') as any).selected;
  const gradientRotation = Number(qs<HTMLInputElement>(document, '#gradientRotation').value) || 0;
  const logoEnabled = (qs<any>(document, '#logoEnabled') as any).selected;
  const logoSize = Number(qs<HTMLInputElement>(document, '#logoSize').value) || 22;
  const logoPadding = Number(qs<HTMLInputElement>(document, '#logoPadding').value) || 6;
  const logoRadius = Number(qs<HTMLInputElement>(document, '#logoRadius').value) || 8;
  const sizePresetSelect = qs<any>(document, '#sizePreset');
  const sizePreset = (sizePresetSelect as any).value ?? (sizePresetSelect as any).selected;
  const customSize = Number(qs<HTMLInputElement>(document, '#customSize').value) || 256;
  const frameEnabled = (qs<any>(document, '#frameEnabled') as any).selected;
  const frameThickness = Number(qs<HTMLInputElement>(document, '#frameThickness').value) || 14;
  const frameColor = qs<HTMLInputElement>(document, '#frameColor').value;

  return {
    colors: {
      foreground: fg,
      background: bg,
      eyeInner,
      eyeOuter,
      transparentBackground: transparentBg
    },
    dotStyle,
    gradient: {
      enabled: gradientEnabled,
      type: 'linear',
      rotation: gradientRotation,
      colorStops: [
        { offset: 0, color: fg },
        { offset: 1, color: eyeInner }
      ]
    },
    logo: {
      enabled: logoEnabled,
      sizePercent: logoSize,
      padding: logoPadding,
      borderRadius: logoRadius
    },
    size: {
      preset: sizePreset === 'custom' ? 'custom' : Number(sizePreset) as 128 | 256 | 512 | 1024,
      customSize
    },
    frame: {
      enabled: frameEnabled,
      thickness: frameThickness,
      color: frameColor
    }
  };
}

function writeFormSettings(settings: QrState['settings']) {
  qs<HTMLInputElement>(document, '#fg').value = settings.colors.foreground;
  qs<HTMLInputElement>(document, '#bg').value = settings.colors.background;
  qs<HTMLInputElement>(document, '#eyeInner').value = settings.colors.eyeInner;
  qs<HTMLInputElement>(document, '#eyeOuter').value = settings.colors.eyeOuter;
  (qs<any>(document, '#transparentBg') as any).selected = settings.colors.transparentBackground;
  const dotStyleSelect = qs<any>(document, '#dotStyle');
  (dotStyleSelect as any).value = settings.dotStyle;
  (qs<any>(document, '#gradientEnabled') as any).selected = settings.gradient.enabled;
  qs<HTMLInputElement>(document, '#gradientRotation').value = String(settings.gradient.rotation);
  (qs<any>(document, '#logoEnabled') as any).selected = settings.logo.enabled;
  qs<HTMLInputElement>(document, '#logoSize').value = String(settings.logo.sizePercent);
  qs<HTMLInputElement>(document, '#logoPadding').value = String(settings.logo.padding);
  qs<HTMLInputElement>(document, '#logoRadius').value = String(settings.logo.borderRadius);
  const sizePresetSelect = qs<any>(document, '#sizePreset');
  (sizePresetSelect as any).value = settings.size.preset === 'custom' ? 'custom' : String(settings.size.preset);
  qs<HTMLInputElement>(document, '#customSize').value = String(settings.size.customSize);
  (qs<any>(document, '#frameEnabled') as any).selected = settings.frame.enabled;
  qs<HTMLInputElement>(document, '#frameThickness').value = String(settings.frame.thickness);
  qs<HTMLInputElement>(document, '#frameColor').value = settings.frame.color;
}

async function main() {
  const btnActiveTab = qs<HTMLElement>(document, '#btnActiveTab');
  const btnGenerate = qs<HTMLElement>(document, '#btnGenerate');
  const btnOptions = qs<HTMLElement>(document, '#btnOptions');
  const btnDownloadPng = qs<HTMLElement>(document, '#btnDownloadPng');
  const btnDownloadSvg = qs<HTMLElement>(document, '#btnDownloadSvg');
  const btnDownloadJpeg = qs<HTMLElement>(document, '#btnDownloadJpeg');
  const btnDownloadWebp = qs<HTMLElement>(document, '#btnDownloadWebp');
  const btnCopy = qs<HTMLElement>(document, '#btnCopy');
  const btnToggleCustomize = qs<HTMLElement>(document, '#btnToggleCustomize');
  const customizeDetails = qs<HTMLDetailsElement>(document, '#customizeDetails');
  const btnUploadLogo = qs<HTMLElement>(document, '#btnUploadLogo');
  const logoFile = qs<HTMLInputElement>(document, '#logoFile');
  const inputPayload = qs<HTMLInputElement>(document, '#inputPayload');
  const qrMount = qs<HTMLElement>(document, '#qrMount');

  const state = await loadInitialState();
  inputPayload.value = state.payload;
  writeFormSettings(state.settings);

  const generator = new QrGenerator();
  generator.render({ element: qrMount });

  async function generateAndPersist(next: PopupStateUpdate) {
    const nextSettings = next.settings ?? readFormSettings();
    const merged: QrState = {
      ...state,
      ...next,
      payload: next.payload ?? inputPayload.value,
      settings: mergeSettings(state.settings, nextSettings)
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

  btnToggleCustomize.addEventListener('click', () => {
    customizeDetails.open = !customizeDetails.open;
  });

  // Right-click on preview to quickly download
  // - Right click: PNG
  // - Shift + Right click: SVG
  qrMount.addEventListener('contextmenu', async (e) => {
    e.preventDefault();
    if (!state.payload.trim()) {
      showToast('Nothing to download');
      return;
    }

    await generator.download(e.shiftKey ? 'svg' : 'png', 'qr');
  });

  // Live updates on any setting change
  const liveInputs = [
    'fg', 'bg', 'eyeInner', 'eyeOuter',
    'gradientRotation', 'logoSize', 'logoPadding', 'logoRadius',
    'customSize', 'frameThickness', 'frameColor'
  ];
  liveInputs.forEach(id => {
    qs<HTMLInputElement>(document, `#${id}`).addEventListener('input', async () => {
      if (state.payload.trim()) {
        await generateAndPersist({});
      }
    });
  });

  // Native color inputs often only fire 'change'
  ['fg', 'bg', 'eyeInner', 'eyeOuter', 'frameColor'].forEach(id => {
    qs<HTMLInputElement>(document, `#${id}`).addEventListener('change', async () => {
      if (state.payload.trim()) {
        await generateAndPersist({});
      }
    });
  });

  const liveSwitches = ['transparentBg', 'gradientEnabled', 'logoEnabled', 'frameEnabled'];
  liveSwitches.forEach(id => {
    qs<any>(document, `#${id}`).addEventListener('change', async () => {
      if (state.payload.trim()) {
        await generateAndPersist({});
      }
    });
  });

  const liveSelects = ['dotStyle', 'sizePreset'];
  liveSelects.forEach(id => {
    qs<any>(document, `#${id}`).addEventListener('change', async () => {
      if (state.payload.trim()) {
        await generateAndPersist({});
      }
    });
  });

  // Logo upload
  btnUploadLogo.addEventListener('click', () => logoFile.click());
  logoFile.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const dataUrl = await new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.readAsDataURL(file);
    });
    state.settings.logo.dataUrl = dataUrl;
    if (state.payload.trim()) {
      await generateAndPersist({ settings: { logo: { ...state.settings.logo, dataUrl } } });
    }
    showToast('Logo uploaded');
  });

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

  btnDownloadJpeg.addEventListener('click', async () => {
    if (!state.payload.trim()) {
      showToast('Nothing to download');
      return;
    }
    await generator.download('jpeg', 'qr');
  });

  btnDownloadWebp.addEventListener('click', async () => {
    if (!state.payload.trim()) {
      showToast('Nothing to download');
      return;
    }
    await generator.download('webp', 'qr');
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
