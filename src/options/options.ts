import '@material/web/button/filled-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/switch/switch.js';

import { qs } from '@/utils/dom';
import { getDefaultCustomizationSettings } from '@/services/defaults';
import { getFromStorage, getStorageKeys, setInStorage } from '@/services/storage';
import type { QrCustomizationSettings } from '@/types/qr';

const keys = getStorageKeys();

function showToast(message: string) {
  const el = qs<HTMLDivElement>(document, '#snackbar');
  el.textContent = message;
  el.classList.add('show');
  window.setTimeout(() => el.classList.remove('show'), 1600);
}

function parseColor(value: string): string {
  const v = value.trim();
  if (!v) return '#000000';
  return v;
}

async function main() {
  const btnSave = qs<HTMLElement>(document, '#btnSave');
  const fg = qs<HTMLInputElement>(document, '#fg');
  const bg = qs<HTMLInputElement>(document, '#bg');
  const eyeInner = qs<HTMLInputElement>(document, '#eyeInner');
  const eyeOuter = qs<HTMLInputElement>(document, '#eyeOuter');
  const transparentBg = qs<HTMLInputElement>(document, '#transparentBg');
  const size = qs<HTMLInputElement>(document, '#size');

  const defaults = (await getFromStorage(keys.defaultSettings)) ?? getDefaultCustomizationSettings();

  fg.value = defaults.colors.foreground;
  bg.value = defaults.colors.background;
  eyeInner.value = defaults.colors.eyeInner;
  eyeOuter.value = defaults.colors.eyeOuter;
  (transparentBg as any).selected = defaults.colors.transparentBackground;
  size.value = String(defaults.size.preset === 'custom' ? defaults.size.customSize : defaults.size.preset);

  btnSave.addEventListener('click', async () => {
    const next: QrCustomizationSettings = {
      ...defaults,
      colors: {
        ...defaults.colors,
        foreground: parseColor(fg.value),
        background: parseColor(bg.value),
        eyeInner: parseColor(eyeInner.value),
        eyeOuter: parseColor(eyeOuter.value),
        transparentBackground: Boolean((transparentBg as any).selected)
      },
      size: {
        preset: 'custom',
        customSize: Math.max(64, Number(size.value) || 256)
      }
    };

    await setInStorage(keys.defaultSettings, next);
    showToast('Saved');
  });
}

main().catch(() => {
  const el = document.createElement('div');
  el.style.padding = '16px';
  el.textContent = 'Failed to load options.';
  document.body.appendChild(el);
});
