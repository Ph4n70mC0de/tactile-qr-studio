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

function buildOptions(data: string, appearance: QRAppearance, logoImage?: string): Options {
  return {
    width: appearance.size,
    height: appearance.size,
    type: "svg" as DrawType,
    data: data || ' ',
    image: logoImage,
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
}

export function QRPreview({ data, appearance, onInstanceReady }: QRPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const prevLogoImageRef = useRef<string | undefined>(undefined);

  const logoImage = useMemo(() => {
    if (!appearance.logoFile) return undefined;
    return URL.createObjectURL(appearance.logoFile);
  }, [appearance.logoFile]);

  const options = useMemo(() => buildOptions(data, appearance, logoImage), [data, appearance, logoImage]);
  const isValid = useMemo(() => Boolean(data && data.trim().length > 0), [data]);

  useEffect(() => {
    const prev = prevLogoImageRef.current;
    if (prev && prev !== logoImage) {
      URL.revokeObjectURL(prev);
    }
    prevLogoImageRef.current = logoImage;

    return () => {
      if (prevLogoImageRef.current) {
        URL.revokeObjectURL(prevLogoImageRef.current);
      }
    };
  }, [logoImage]);

  const stableOnInstanceReady = useRef(onInstanceReady);
  useEffect(() => {
    stableOnInstanceReady.current = onInstanceReady;
  });

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling(options);
      qrCode.current.append(container);
      stableOnInstanceReady.current?.(qrCode.current);
    } else {
      qrCode.current.update(options);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [options]);

  useEffect(() => {
    return () => {
      if (qrCode.current) {
        qrCode.current = null;
      }
    };
  }, []);

  return (
    <Card className="flex flex-col items-center justify-center relative min-h-[400px]">
      <div
        ref={ref}
        className={`w-full flex items-center justify-center ${isValid ? 'flex' : 'hidden'}`}
      />
      {!isValid && (
        <div className="absolute inset-0 flex items-center justify-center flex-col text-neu-text-muted">
          <span className="font-semibold text-lg">Enter content to preview</span>
        </div>
      )}
    </Card>
  );
}

