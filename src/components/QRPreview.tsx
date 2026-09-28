import { useEffect, useRef, useMemo } from 'react';
import QRCodeStyling, {
  DrawType,
  TypeNumber,
  Mode,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType,
  Options
} from 'qr-code-styling';
import { QRAppearance } from '../types';
import { Card } from './ui/Card';

interface QRPreviewProps {
  data: string;
  appearance: QRAppearance;
  onInstanceReady?: (instance: QRCodeStyling) => void;
}

export function QRPreview({ data, appearance, onInstanceReady }: QRPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const isValid = useMemo(() => Boolean(data && data.trim().length > 0), [data]);

  useEffect(() => {
    const container = ref.current;
    const options: Options = {
      width: appearance.size,
      height: appearance.size,
      type: "svg" as DrawType,
      data: data || ' ',
      image: appearance.logoUrl,
      margin: appearance.margin,
      qrOptions: {
        typeNumber: 0 as TypeNumber,
        mode: "Byte" as Mode,
        errorCorrectionLevel: appearance.errorCorrectionLevel as ErrorCorrectionLevel
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: appearance.logoSize,
        margin: 5,
        crossOrigin: "anonymous"
      },
      dotsOptions: {
        color: appearance.foregroundColor,
        type: (appearance.moduleStyle === 'dots' ? 'dots' : appearance.moduleStyle === 'rounded' ? 'rounded' : 'square') as DotType
      },
      backgroundOptions: {
        color: appearance.transparentBackground ? 'transparent' : appearance.backgroundColor,
      },
      cornersSquareOptions: {
        color: appearance.foregroundColor,
        type: (appearance.finderStyle === 'dot' ? 'dot' : appearance.finderStyle === 'extra-rounded' ? 'extra-rounded' : 'square') as CornerSquareType
      },
      cornersDotOptions: {
        color: appearance.foregroundColor,
        type: (appearance.finderStyle === 'dot' ? 'dot' : appearance.finderStyle === 'extra-rounded' ? 'dot' : 'square') as CornerDotType
      }
    };

    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling(options);
      if (container) {
        qrCode.current.append(container);
      }
      if (onInstanceReady) {
        onInstanceReady(qrCode.current);
      }
    } else {
      qrCode.current.update(options);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [data, appearance, onInstanceReady]);

  return (
    <Card className="flex flex-col items-center justify-center relative min-h-[400px]">
      <div
        ref={ref}
        className={`w-full items-center justify-center ${isValid ? 'flex' : 'hidden'}`}
      />
      {!isValid && (
        <div className="absolute inset-0 flex items-center justify-center flex-col text-neu-text-muted">
          <span className="font-semibold text-lg">Enter content to preview</span>
        </div>
      )}
    </Card>
  );
}
