import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useQREditor } from './hooks/useQREditor';
import { QRPreview } from './components/QRPreview';
import { QRContentForm } from './components/QRContentForm';
import { QRAppearanceForm } from './components/QRAppearanceForm';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { PRESETS } from './lib/presets';
import { ContentType } from './types';
import { Download, AlertTriangle, Settings, Image as ImageIcon, Type, Link, Mail, Phone, Wifi } from 'lucide-react';
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
    applyPreset
  } = useQREditor();

  const qrRef = useRef<QRCodeStyling | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'appearance' | 'presets'>('content');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [exportError, setExportError] = useState<string | null>(null);
  const [starCount, setStarCount] = useState<number | null>(null);
  const [isStarring, setIsStarring] = useState(false);
  const [starred, setStarred] = useState<boolean | null>(null);
  const [starError, setStarError] = useState<string | null>(null);

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

  useEffect(() => {
    const repo = 'Ph4n70mC0de/tactile-qr-studio';
    fetch(`https://api.github.com/repos/${repo}`)
      .then(res => res.json())
      .then(data => {
        if (typeof data.stargazers_count === 'number') {
          setStarCount(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  const getStoredToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('github_token') || '';
    }
    return '';
  };

  const handleStar = async () => {
    setStarError(null);
    let token = getStoredToken();
    if (!token) {
      token = window.prompt('Enter GitHub personal access token with `public_repo` scope to star this repo:') || '';
      if (!token) return;
      localStorage.setItem('github_token', token.trim());
    }

    setIsStarring(true);
    try {
      const repo = 'Ph4n70mC0de/tactile-qr-studio';
      const res = await fetch(`https://api.github.com/user/starred/${repo}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `GitHub API error: ${res.status}`);
      }
      setStarred(true);
      setStarCount(prev => (typeof prev === 'number' ? prev + 1 : prev));
    } catch (err) {
      setStarred(false);
      setStarError(err instanceof Error ? err.message : 'Failed to star repository');
    } finally {
      setIsStarring(false);
    }
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
            {starError && <p className="text-xs text-red-600 mt-1" role="alert">{starError}</p>}
          </div>
          <button
            type="button"
            onClick={handleStar}
            disabled={isStarring}
            className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-neu-accent disabled:opacity-50 disabled:pointer-events-none select-none bg-neu-base neu-border text-neu-text hover:text-neu-accent shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed h-11 px-6 py-2 gap-2 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github w-4 h-4" aria-hidden="true">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15.28 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            {isStarring ? 'Starring...' : starred ? 'Starred' : 'Star on GitHub'}
            {typeof starCount === 'number' && (
              <span className="text-xs text-neu-text-muted">({starCount})</span>
            )}
          </button>
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

          <div className="lg:col-span-5 xl:col-span-4 space-y-8 lg:sticky lg:top-8">
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
