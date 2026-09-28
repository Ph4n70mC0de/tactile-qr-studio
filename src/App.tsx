import { useRef, useState, useMemo, useCallback } from 'react';
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
import { validatePayload, validateAppearance, validateExport } from './domain/qrValidation';
import { generateSafeFilename } from './domain/qrExport';

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
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [exportError, setExportError] = useState<string | null>(null);

  const payloadValid = useMemo(() => {
    const result = validatePayload(payload);
    return result.isValid;
  }, [payload]);

  const payloadMessages = useMemo(() => {
    return validatePayload(payload).messages;
  }, [payload]);

  const appearanceMessages = useMemo(() => {
    return validateAppearance(appearance, payload);
  }, [appearance, payload]);

  const handleDownload = useCallback(async (extension: 'png' | 'svg') => {
    if (!qrRef.current) return;

    const exportMessages = validateExport(appearance, payload, extension);
    const hasErrors = exportMessages.some(m => m.severity === 'error');

    if (hasErrors) {
      setExportStatus('error');
      setExportError(exportMessages.filter(m => m.severity === 'error').map(m => m.message).join(' '));
      return;
    }

    setExportStatus('exporting');
    setExportError(null);

    try {
      const filename = generateSafeFilename(payloadString || 'qr-code', extension);
      await qrRef.current.download({ name: filename, extension });

      setTimeout(() => {
        setExportStatus('success');
      }, 500);
    } catch (err) {
      setExportStatus('error');
      setExportError(err instanceof Error ? err.message : 'Export failed. Please try again.');
    }
  }, [qrRef, appearance, payload, payloadString]);

  const handleExport = (format: 'png' | 'svg') => {
    setExportStatus('idle');
    setExportError(null);
    void handleDownload(format);
  };

  const tabs = useMemo(() => [
    { id: 'content' as const, label: 'Content', icon: <Type className="w-4 h-4" /> },
    { id: 'appearance' as const, label: 'Appearance', icon: <Settings className="w-4 h-4" /> },
    { id: 'presets' as const, label: 'Presets', icon: <Wifi className="w-4 h-4" /> },
  ], []);

  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    const container = tabListRef.current;
    if (!container) return;

    const tabButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const currentIndex = tabButtons.findIndex(tab => tab === e.currentTarget);

    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = (currentIndex + 1) % tabButtons.length;
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
        e.preventDefault();
        break;
      case 'Home':
        newIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        newIndex = tabButtons.length - 1;
        e.preventDefault();
        break;
      default:
        return;
    }

    const newTab = tabs[newIndex];
    setActiveTab(newTab.id);
    tabButtons[newIndex].focus();
  }, [tabs]);

  const isExportDisabled = !payloadString || !payloadValid || exportStatus === 'exporting';

  return (
    <div className="min-h-screen bg-neu-base py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-neu-accent/30 text-neu-text">
      <div className="max-w-6xl mx-auto space-y-8">

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

          <div className="lg:col-span-7 xl:col-span-8 space-y-8">

            <Card className="flex flex-wrap gap-4 justify-center sm:justify-start p-4" role="tablist" ref={tabListRef}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onKeyDown={handleTabKeyDown}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-200 outline-none flex items-center gap-2 flex-1 sm:flex-none
                    ${activeTab === tab.id
                      ? 'shadow-neu-pressed text-neu-accent neu-border'
                      : 'shadow-neu hover:shadow-neu-hover text-neu-text neu-border'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </Card>

            <Card className={`min-h-[500px]`} id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={0}>
              {activeTab === 'content' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Content Type</h2>
                    <div className="flex flex-wrap gap-4" role="radiogroup" aria-label="Content type">
                      {(Object.keys(TYPE_ICONS) as ContentType[]).map(type => (
                        <button
                          key={type}
                          type="button"
                          role="radio"
                          aria-checked={payload.type === type}
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

                    {payloadMessages.filter(m => m.severity === 'error').length > 0 && (
                      <div className="mt-4 space-y-2" role="alert" aria-live="polite">
                        {payloadMessages.filter(m => m.severity === 'error').map(msg => (
                          <p key={msg.code} className="text-sm text-red-600 bg-red-50/50 px-3 py-2 rounded-xl">
                            {msg.message}
                          </p>
                        ))}
                      </div>
                    )}
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

          <div className="lg:col-span-5 xl:col-span-4 space-y-8 sticky top-8">
            <QRPreview
              data={payloadString}
              appearance={appearance}
              onInstanceReady={(instance) => { qrRef.current = instance; }}
            />

            <div className="space-y-4" aria-live="polite">
              {appearanceMessages.map(msg => {
                if (msg.severity === 'info') return null;
                const isError = msg.severity === 'error';
                return (
                  <Card
                    key={msg.code}
                    className={`p-4 flex gap-3 ${
                      isError
                        ? 'text-red-600 bg-red-50/50'
                        : 'text-amber-600 bg-amber-50/50'
                    } neu-border`}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{msg.message}</p>
                  </Card>
                );
              })}
            </div>

            {exportStatus === 'error' && exportError && (
              <Card className="p-4 flex gap-3 text-red-600 bg-red-50/50 neu-border" role="alert">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{exportError}</p>
              </Card>
            )}

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-center mb-4">Export Code</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleExport('png')}
                  className="w-full gap-2"
                  disabled={isExportDisabled}
                >
                  <ImageIcon className="w-4 h-4" />
                  PNG
                </Button>
                <Button
                  onClick={() => handleExport('svg')}
                  className="w-full gap-2"
                  disabled={isExportDisabled}
                >
                  <Download className="w-4 h-4" />
                  SVG
                </Button>
              </div>

              {exportStatus === 'exporting' && (
                <p className="text-sm text-neu-text-muted text-center" aria-live="polite">
                  Exporting your QR code...
                </p>
              )}

              {exportStatus === 'success' && (
                <p className="text-sm text-neu-text text-center" aria-live="polite">
                  QR code exported successfully!
                </p>
              )}
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
