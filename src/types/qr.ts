export type QrSourceType =
  | 'activeTabUrl'
  | 'customText'
  | 'customUrl'
  | 'imageUrl'
  | 'uploadedImage'
  | 'contextPage'
  | 'contextLink'
  | 'contextImage';

export type QrExportFormat = 'png' | 'svg' | 'jpeg' | 'webp';

export type QrDotStyle = 'square' | 'rounded' | 'dots';

export interface QrGradient {
  enabled: boolean;
  type: 'linear' | 'radial';
  rotation: number;
  colorStops: Array<{ offset: number; color: string }>;
}

export interface QrLogoSettings {
  enabled: boolean;
  dataUrl?: string;
  sizePercent: number;
  padding: number;
  borderRadius: number;
}

export interface QrFrameSettings {
  enabled: boolean;
  thickness: number;
  color: string;
}

export interface QrColors {
  foreground: string;
  background: string;
  eyeInner: string;
  eyeOuter: string;
  transparentBackground: boolean;
}

export interface QrSizeSettings {
  preset: 128 | 256 | 512 | 1024 | 'custom';
  customSize: number;
}

export interface QrCustomizationSettings {
  colors: QrColors;
  dotStyle: QrDotStyle;
  gradient: QrGradient;
  logo: QrLogoSettings;
  frame: QrFrameSettings;
  size: QrSizeSettings;
}

export interface QrState {
  sourceType: QrSourceType;
  payload: string;
  settings: QrCustomizationSettings;
}
