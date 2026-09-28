import { Payload } from '../types';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';

interface QRContentFormProps {
  payload: Payload;
  onChange: (payload: Payload) => void;
}

const MAX_TEXT_LENGTH = 4296;
const MAX_EMAIL_SUBJECT = 255;
const MAX_EMAIL_BODY = 1000;
const MAX_WIFI_PASSWORD = 63;

function charHintClass(current: number, max: number): string {
  if (current >= max) return 'text-red-500';
  if (current >= max * 0.8) return 'text-amber-500';
  return 'text-neu-text-muted';
}

export function QRContentForm({ payload, onChange }: QRContentFormProps) {
  if (payload.type === 'text') {
    const charCount = payload.text.length;
    const textHintId = 'text-char-count';
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-input">Plain Text</Label>
          <Textarea
            id="text-input"
            placeholder="Enter your message here..."
            value={payload.text}
            aria-invalid={charCount === 0}
            aria-describedby={charCount > 0 ? textHintId : undefined}
            aria-errormessage={charCount === 0 ? 'text-error' : undefined}
            onChange={(e) => onChange({ ...payload, text: e.target.value })}
          />
          {charCount === 0 && (
            <p id="text-error" className="text-xs text-red-500" role="alert">
              Text content is required.
            </p>
          )}
          {charCount > 0 && (
            <p id={textHintId} className={`text-xs ${charHintClass(charCount, MAX_TEXT_LENGTH)}`} aria-live="polite">
              {charCount}/{MAX_TEXT_LENGTH} characters
            </p>
          )}
        </div>
      </div>
    );
  }

  if (payload.type === 'url') {
    const trimmed = payload.url.trim();
    const unsupportedProtocol = trimmed && !/^https?:\/\//i.test(trimmed) && /^(ftp|javascript|data|file|vbscript):/i.test(trimmed);
    const urlHintId = 'url-hint';
    const urlErrorId = 'url-error';
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url-input">Website URL</Label>
          <Input
            id="url-input"
            type="url"
            placeholder="example.com or https://example.com"
            value={payload.url}
            aria-invalid={!!unsupportedProtocol}
            aria-describedby={unsupportedProtocol ? urlErrorId : undefined}
            onChange={(e) => onChange({ ...payload, url: e.target.value })}
          />
          {!unsupportedProtocol && trimmed && (
            <p id={urlHintId} className="text-xs text-neu-text-muted">
              No protocol detected — HTTPS will be added automatically.
            </p>
          )}
          {unsupportedProtocol && (
            <p id={urlErrorId} className="text-xs text-red-500" role="alert">
              Unsupported protocol. Only HTTP and HTTPS URLs are accepted.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (payload.type === 'email') {
    const subjectCount = payload.subject?.length ?? 0;
    const bodyCount = payload.body?.length ?? 0;
    const subjectHintId = 'email-subject-count';
    const bodyHintId = 'email-body-count';
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-input">Email Address</Label>
          <Input
            id="email-input"
            type="email"
            placeholder="contact@example.com"
            value={payload.email}
            onChange={(e) => onChange({ ...payload, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject-input">Subject (Optional)</Label>
          <Input
            id="subject-input"
            type="text"
            placeholder="Hello"
            maxLength={MAX_EMAIL_SUBJECT}
            value={payload.subject ?? ''}
            aria-describedby={subjectCount > 0 ? subjectHintId : undefined}
            onChange={(e) => onChange({ ...payload, subject: e.target.value })}
          />
          {subjectCount > 0 && subjectCount >= MAX_EMAIL_SUBJECT * 0.8 && (
            <p id={subjectHintId} className={`text-xs ${charHintClass(subjectCount, MAX_EMAIL_SUBJECT)}`} aria-live="polite">
              {subjectCount}/{MAX_EMAIL_SUBJECT} characters
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="body-input">Body (Optional)</Label>
          <Textarea
            id="body-input"
            placeholder="Write your message here..."
            value={payload.body ?? ''}
            aria-describedby={bodyCount > 0 ? bodyHintId : undefined}
            onChange={(e) => onChange({ ...payload, body: e.target.value })}
          />
          {bodyCount > 0 && (
            <p id={bodyHintId} className={`text-xs ${charHintClass(bodyCount, MAX_EMAIL_BODY)}`} aria-live="polite">
              {bodyCount}/{MAX_EMAIL_BODY} characters
            </p>
          )}
        </div>
      </div>
    );
  }

  if (payload.type === 'phone') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone-input">Phone Number</Label>
          <Input
            id="phone-input"
            type="tel"
            placeholder="+1 555 123 4567"
            value={payload.phone}
            onChange={(e) => onChange({ ...payload, phone: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (payload.type === 'wifi') {
    const passwordCount = payload.password?.length ?? 0;
    const showHint = passwordCount > 0;
    const hasSpecialChars = payload.password && /([\\;,":])/.test(payload.password);
    const passwordHintId = 'wifi-password-count';
    const specialCharsId = 'wifi-password-special';
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
          <Input
            id="wifi-ssid"
            type="text"
            placeholder="MyNetwork"
            maxLength={32}
            value={payload.ssid}
            aria-describedby={payload.ssid.length > 28 ? 'ssid-char-count' : undefined}
            onChange={(e) => onChange({ ...payload, ssid: e.target.value })}
          />
          {payload.ssid.length > 28 && (
            <p id="ssid-char-count" className={`text-xs ${charHintClass(payload.ssid.length, 32)}`} aria-live="polite">
              {payload.ssid.length}/32 characters
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="wifi-password">Password</Label>
          <Input
            id="wifi-password"
            type="password"
            placeholder="secretpassword"
            maxLength={MAX_WIFI_PASSWORD}
            value={payload.password ?? ''}
            disabled={payload.encryption === 'nopass'}
            aria-describedby={
              [showHint && passwordHintId, hasSpecialChars && specialCharsId]
                .filter(Boolean)
                .join(' ') || undefined
            }
            onChange={(e) => onChange({ ...payload, password: e.target.value })}
          />
          {showHint && (
            <p id={passwordHintId} className={`text-xs ${charHintClass(passwordCount, MAX_WIFI_PASSWORD)}`} aria-live="polite">
              {passwordCount}/{MAX_WIFI_PASSWORD} characters
            </p>
          )}
          {hasSpecialChars && (
            <p id={specialCharsId} className="text-xs text-neu-text-muted">
              Special characters will be escaped during encoding.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wifi-encryption">Encryption</Label>
            <select
              id="wifi-encryption"
              className="flex w-full rounded-xl bg-neu-base px-4 py-3 text-sm text-neu-text shadow-neu-pressed neu-border outline-none focus:ring-2 focus:ring-neu-accent/50"
              value={payload.encryption}
              onChange={(e) => onChange({
                ...payload,
                encryption: e.target.value as 'WEP' | 'WPA' | 'nopass',
                password: e.target.value === 'nopass' ? '' : (payload.password ?? ''),
              })}
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <label className="flex items-center space-x-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                className="w-5 h-5 rounded bg-neu-base shadow-neu-pressed border-none text-neu-accent focus:ring-neu-accent"
                checked={payload.hidden}
                onChange={(e) => onChange({ ...payload, hidden: e.target.checked })}
              />
              <span className="text-sm font-medium text-neu-text">Hidden Network</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
