import type { QrCustomizationSettings } from '@/types/qr';

export function getDefaultCustomizationSettings(): QrCustomizationSettings {
  return {
    colors: {
      foreground: '#111111',
      background: '#ffffff',
      eyeInner: '#111111',
      eyeOuter: '#111111',
      transparentBackground: false
    },
    dotStyle: 'square',
    gradient: {
      enabled: false,
      type: 'linear',
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#111111' },
        { offset: 1, color: '#111111' }
      ]
    },
    logo: {
      enabled: false,
      dataUrl: undefined,
      sizePercent: 22,
      padding: 6,
      borderRadius: 8
    },
    frame: {
      enabled: false,
      thickness: 14,
      color: '#111111'
    },
    size: {
      preset: 256,
      customSize: 256
    }
  };
}
