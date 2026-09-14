import React from 'react';
import { Payload } from '../types';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';

interface QRContentFormProps {
  payload: Payload;
  onChange: (updates: Partial<Payload>) => void;
}

export function QRContentForm({ payload, onChange }: QRContentFormProps) {
  if (payload.type === 'text') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-input">Plain Text</Label>
          <Textarea 
            id="text-input" 
            placeholder="Enter your message here..."
            value={payload.text} 
            onChange={(e) => onChange({ text: e.target.value } as any)} 
          />
        </div>
      </div>
    );
  }

  if (payload.type === 'url') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url-input">Website URL</Label>
          <Input 
            id="url-input" 
            type="url" 
            placeholder="example.com"
            value={payload.url} 
            onChange={(e) => onChange({ url: e.target.value } as any)} 
          />
        </div>
      </div>
    );
  }

  if (payload.type === 'email') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-input">Email Address</Label>
          <Input 
            id="email-input" 
            type="email" 
            placeholder="contact@example.com"
            value={payload.email} 
            onChange={(e) => onChange({ email: e.target.value } as any)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject-input">Subject (Optional)</Label>
          <Input 
            id="subject-input" 
            type="text" 
            placeholder="Hello"
            value={payload.subject || ''} 
            onChange={(e) => onChange({ subject: e.target.value } as any)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body-input">Body (Optional)</Label>
          <Textarea 
            id="body-input" 
            placeholder="Write your message here..."
            value={payload.body || ''} 
            onChange={(e) => onChange({ body: e.target.value } as any)} 
          />
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
            onChange={(e) => onChange({ phone: e.target.value } as any)} 
          />
        </div>
      </div>
    );
  }

  if (payload.type === 'wifi') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
          <Input 
            id="wifi-ssid" 
            type="text" 
            placeholder="MyNetwork"
            value={payload.ssid} 
            onChange={(e) => onChange({ ssid: e.target.value } as any)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wifi-password">Password</Label>
          <Input 
            id="wifi-password" 
            type="password" 
            placeholder="secretpassword"
            value={payload.password || ''} 
            onChange={(e) => onChange({ password: e.target.value } as any)} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wifi-encryption">Encryption</Label>
            <select 
              id="wifi-encryption"
              className="flex w-full rounded-xl bg-neu-base px-4 py-3 text-sm text-neu-text shadow-neu-pressed neu-border outline-none focus:ring-2 focus:ring-neu-accent/50"
              value={payload.encryption}
              onChange={(e) => onChange({ encryption: e.target.value as any } as any)}
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
                onChange={(e) => onChange({ hidden: e.target.checked } as any)}
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
