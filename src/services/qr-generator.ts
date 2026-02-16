import QRCodeStyling from 'qr-code-styling';
import type { QrCustomizationSettings, QrExportFormat } from '@/types/qr';

export interface QrRenderTarget {
  element: HTMLElement;
}

export class QrGenerator {
  private qr: QRCodeStyling;

  constructor() {
    this.qr = new QRCodeStyling({
      width: 256,
      height: 256,
      type: 'canvas',
      data: '',
      qrOptions: {
        errorCorrectionLevel: 'H'
      }
    });
  }

  render(target: QrRenderTarget) {
    target.element.innerHTML = '';
    this.qr.append(target.element);
  }

  async update(data: string, settings: QrCustomizationSettings) {
    const size = settings.size.preset === 'custom' ? settings.size.customSize : settings.size.preset;

    const backgroundOptions = settings.colors.transparentBackground
      ? { color: 'rgba(0,0,0,0)' }
      : { color: settings.colors.background };

    const dotsColor = settings.gradient.enabled
      ? undefined
      : settings.colors.foreground;

    const dotsGradient = settings.gradient.enabled
      ? {
          type: settings.gradient.type,
          rotation: settings.gradient.rotation,
          colorStops: settings.gradient.colorStops
        }
      : undefined;

    const dotType = settings.dotStyle === 'square'
      ? 'square'
      : settings.dotStyle === 'rounded'
        ? 'rounded'
        : 'dots';

    this.qr.update({
      data,
      width: size,
      height: size,
      backgroundOptions,
      dotsOptions: {
        type: dotType,
        color: dotsColor,
        gradient: dotsGradient
      },
      cornersSquareOptions: {
        type: 'square',
        color: settings.colors.eyeOuter
      },
      cornersDotOptions: {
        type: 'square',
        color: settings.colors.eyeInner
      },
      image: settings.logo.enabled ? settings.logo.dataUrl : undefined,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: Math.min(0.6, Math.max(0.05, settings.logo.sizePercent / 100)),
        margin: settings.logo.padding
      }
    });
  }

  async download(format: QrExportFormat, fileName: string) {
    const extension = format;
    await this.qr.download({ name: fileName, extension });
  }

  async getBlob(format: Exclude<QrExportFormat, 'svg'>): Promise<Blob> {
    const blob = await this.qr.getRawData(format);
    return blob;
  }

  async getSvgText(): Promise<string> {
    const svgBlob = await this.qr.getRawData('svg');
    return await svgBlob.text();
  }
}
