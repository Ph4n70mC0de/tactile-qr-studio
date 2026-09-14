import React, { useRef, useState, useMemo } from 'react';
import { useQREditor } from './hooks/useQREditor';
import { QRPreview } from './components/QRPreview';
import { QRContentForm } from './components/QRContentForm';
import { QRAppearanceForm } from './components/QRAppearanceForm';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { PRESETS } from './lib/presets';
import { ContentType } from './types';
import { Download, RotateCcw, AlertTriangle, Settings, Image as ImageIcon, Type, Link, Mail, Phone, Wifi } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import { getContrastRatio } from './lib/utils';

const TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  text: <Type className="w-5 h-5" />,
  url: <Link className="w-5 h-5" />,
  email: <Mail className="w-5 h-5" />,
  phone: <Phone className="w-5 h-5" />,
  wifi: <Wifi className="w-5 h-5" />,
};

export default function App() {
  const {
    payload,
    payloadString,
    appearance,
    updatePayload,
    changeType,
    updateAppearance,
    applyPreset,
    reset
  } = useQREditor();

  const qrRef = useRef<QRCodeStyling | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'appearance' | 'presets'>('content');

  const handleDownload = async (extension: 'png' | 'svg') => {
    if (!qrRef.current) return;
    try {
      await qrRef.current.download({ name: `qr-${Date.now()}`, extension });
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-neu-base py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-neu-accent/30 text-neu-text">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neu-text">QR Studio</h1>
            <p className="text-neu-text-muted mt-1">Design and generate custom QR codes.</p>
          </div>
          <Button variant="default" onClick={reset} className="gap-2 shrink-0">
            <RotateCcw className="w-4 h-4" />
            Reset Design
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Editor Area */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Editor Tabs */}
            <Card className="flex flex-wrap gap-4 justify-center sm:justify-start p-4">
              {(['content', 'appearance', 'presets'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-200 outline-none flex-1 sm:flex-none
                    ${activeTab === tab 
                      ? 'shadow-neu-pressed text-neu-accent neu-border' 
                      : 'shadow-neu hover:shadow-neu-hover text-neu-text neu-border'}`}
                >
                  {tab}
                </button>
              ))}
            </Card>

            {/* Active Tab Content */}
            <Card className="min-h-[500px]">
              {activeTab === 'content' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Content Type</h2>
                    <div className="flex flex-wrap gap-4">
                      {(Object.keys(TYPE_ICONS) as ContentType[]).map(type => (
                        <button
                          key={type}
                          onClick={() => changeType(type)}
                          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium capitalize transition-all duration-200 outline-none
                            ${payload.type === type 
                              ? 'shadow-neu-pressed text-neu-accent neu-border' 
                              : 'shadow-neu hover:shadow-neu-hover text-neu-text neu-border'}`}
                        >
                          {TYPE_ICONS[type]}
                          <span className="hidden sm:inline">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-px bg-neu-dark/10 w-full" />
                  
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Payload</h2>
                    <QRContentForm payload={payload} onChange={updatePayload} />
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-lg font-semibold">Appearance Settings</h2>
                  <QRAppearanceForm appearance={appearance} onChange={updateAppearance} />
                </div>
              )}

              {activeTab === 'presets' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-lg font-semibold">Design Presets</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="p-6 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed transition-all duration-200 neu-border outline-none text-neu-text hover:text-neu-accent"
                      >
                        <Settings className="w-8 h-8 opacity-50" />
                        <span className="font-medium">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8 sticky top-8">
            <QRPreview 
              data={payloadString} 
              appearance={appearance} 
              onInstanceReady={(instance) => (qrRef.current = instance)}
            />

            {/* Warnings Area (e.g. contrast) */}
            <div className="space-y-4">
              {!appearance.transparentBackground && getContrastRatio(appearance.foregroundColor, appearance.backgroundColor) < 3.0 && (
                <Card className="p-4 flex gap-3 text-red-600 bg-red-50/50 neu-border">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">Low contrast between foreground and background. This QR code may not scan reliably.</p>
                </Card>
              )}
              {appearance.logoUrl && appearance.errorCorrectionLevel !== 'H' && (
                <Card className="p-4 flex gap-3 text-amber-600 bg-amber-50/50 neu-border">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">When using a logo, consider setting Error Correction to 'H' for better scan reliability.</p>
                </Card>
              )}
            </div>

            {/* Export Actions */}
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-center mb-4">Export Code</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleDownload('png')} 
                  className="w-full gap-2"
                  disabled={!payloadString}
                >
                  <ImageIcon className="w-4 h-4" />
                  PNG
                </Button>
                <Button 
                  onClick={() => handleDownload('svg')} 
                  className="w-full gap-2"
                  disabled={!payloadString}
                >
                  <Download className="w-4 h-4" />
                  SVG
                </Button>
              </div>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
