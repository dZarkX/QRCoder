declare module 'qr-code-styling' {
  export type QRCodeFileExtension = 'png' | 'jpeg' | 'webp' | 'svg';

  export interface QRCodeStylingOptions {
    width?: number;
    height?: number;
    type?: 'canvas' | 'svg';
    data?: string;
    image?: string;
    qrOptions?: {
      typeNumber?: number;
      mode?: 'Byte' | 'Numeric' | 'Alphanumeric' | 'Kanji';
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    };
    imageOptions?: {
      hideBackgroundDots?: boolean;
      imageSize?: number;
      margin?: number;
      crossOrigin?: string;
    };
    backgroundOptions?: {
      color?: string;
    };
    dotsOptions?: {
      type?: string;
      color?: string;
      gradient?: any;
    };
    cornersSquareOptions?: {
      type?: string;
      color?: string;
    };
    cornersDotOptions?: {
      type?: string;
      color?: string;
    };
  }

  export default class QRCodeStyling {
    constructor(options?: QRCodeStylingOptions);
    append(container: HTMLElement): void;
    update(options: QRCodeStylingOptions): void;
    download(options: { name: string; extension: QRCodeFileExtension }): Promise<void>;
    getRawData(extension: QRCodeFileExtension): Promise<Blob>;
  }
}
