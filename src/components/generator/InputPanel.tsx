import { useQrStore } from '../../stores/qrStore';
import {
  formatWifi,
  formatVCard,
  formatEmail,
  formatSms,
  formatPhone,
  formatGeo,
  formatUrl,
} from '../../lib/formatters';
import type { QrType } from '../../types/qr';

const INPUT_TYPES: { id: QrType; label: string; icon: string }[] = [
  { id: 'url', label: 'URL', icon: '🔗' },
  { id: 'text', label: 'Text', icon: '✎' },
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'phone', label: 'Phone', icon: '📞' },
  { id: 'vcard', label: 'vCard', icon: '👤' },
  { id: 'email', label: 'Email', icon: '✉️' },
  { id: 'sms', label: 'SMS', icon: '💬' },
  { id: 'geo', label: 'Location', icon: '📍' },
];

export function InputPanel() {
  const {
    content,
    inputType,
    wifiConfig,
    vcardConfig,
    emailConfig,
    smsConfig,
    geoConfig,
    setContent,
    setInputType,
    setWifiConfig,
    setVcardConfig,
    setEmailConfig,
    setSmsConfig,
    setGeoConfig,
  } = useQrStore();

  const inputClassName =
    'w-full bg-surface-hover border border-border rounded-md px-3 py-2 text-sm font-mono text-text outline-none focus:border-accent/50 transition-colors';

  const renderInputFields = () => {
    switch (inputType) {
      case 'wifi':
        return (
          <div className="flex flex-col gap-2">
            <input
              value={wifiConfig.ssid}
              onChange={(e) => {
                setWifiConfig({ ssid: e.target.value });
                setContent(formatWifi({ ...wifiConfig, ssid: e.target.value }));
              }}
              placeholder="Network name (SSID)"
              className={inputClassName}
            />
            <input
              value={wifiConfig.password}
              onChange={(e) => {
                setWifiConfig({ password: e.target.value });
                setContent(formatWifi({ ...wifiConfig, password: e.target.value }));
              }}
              placeholder="Password"
              type="password"
              className={inputClassName}
            />
            <select
              value={wifiConfig.encryption}
              onChange={(e) => {
                const encryption = e.target.value as 'WPA' | 'WEP' | 'nopass';
                setWifiConfig({ encryption });
                setContent(formatWifi({ ...wifiConfig, encryption }));
              }}
              className={`${inputClassName} cursor-pointer`}
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={wifiConfig.hidden}
                onChange={(e) => {
                  setWifiConfig({ hidden: e.target.checked });
                  setContent(formatWifi({ ...wifiConfig, hidden: e.target.checked }));
                }}
                className="accent-accent"
              />
              Hidden network
            </label>
          </div>
        );

      case 'vcard':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                value={vcardConfig.firstName}
                onChange={(e) => {
                  setVcardConfig({ firstName: e.target.value });
                  setContent(formatVCard({ ...vcardConfig, firstName: e.target.value }));
                }}
                placeholder="First name"
                className={inputClassName}
              />
              <input
                value={vcardConfig.lastName}
                onChange={(e) => {
                  setVcardConfig({ lastName: e.target.value });
                  setContent(formatVCard({ ...vcardConfig, lastName: e.target.value }));
                }}
                placeholder="Last name"
                className={inputClassName}
              />
            </div>
            <input
              value={vcardConfig.organization || ''}
              onChange={(e) => {
                setVcardConfig({ organization: e.target.value });
                setContent(formatVCard({ ...vcardConfig, organization: e.target.value }));
              }}
              placeholder="Organization"
              className={inputClassName}
            />
            <input
              value={vcardConfig.phone || ''}
              onChange={(e) => {
                setVcardConfig({ phone: e.target.value });
                setContent(formatVCard({ ...vcardConfig, phone: e.target.value }));
              }}
              placeholder="Phone"
              className={inputClassName}
            />
            <input
              value={vcardConfig.email || ''}
              onChange={(e) => {
                setVcardConfig({ email: e.target.value });
                setContent(formatVCard({ ...vcardConfig, email: e.target.value }));
              }}
              placeholder="Email"
              className={inputClassName}
            />
            <input
              value={vcardConfig.url || ''}
              onChange={(e) => {
                setVcardConfig({ url: e.target.value });
                setContent(formatVCard({ ...vcardConfig, url: e.target.value }));
              }}
              placeholder="Website"
              className={inputClassName}
            />
          </div>
        );

      case 'email':
        return (
          <div className="flex flex-col gap-2">
            <input
              value={emailConfig.to}
              onChange={(e) => {
                setEmailConfig({ to: e.target.value });
                setContent(formatEmail({ ...emailConfig, to: e.target.value }));
              }}
              placeholder="Recipient email"
              className={inputClassName}
            />
            <input
              value={emailConfig.subject || ''}
              onChange={(e) => {
                setEmailConfig({ subject: e.target.value });
                setContent(formatEmail({ ...emailConfig, subject: e.target.value }));
              }}
              placeholder="Subject"
              className={inputClassName}
            />
            <textarea
              value={emailConfig.body || ''}
              onChange={(e) => {
                setEmailConfig({ body: e.target.value });
                setContent(formatEmail({ ...emailConfig, body: e.target.value }));
              }}
              placeholder="Body"
              rows={2}
              className={`${inputClassName} resize-y`}
            />
          </div>
        );

      case 'sms':
        return (
          <div className="flex flex-col gap-2">
            <input
              value={smsConfig.phone}
              onChange={(e) => {
                setSmsConfig({ phone: e.target.value });
                setContent(formatSms({ ...smsConfig, phone: e.target.value }));
              }}
              placeholder="Phone number"
              className={inputClassName}
            />
            <textarea
              value={smsConfig.message || ''}
              onChange={(e) => {
                setSmsConfig({ message: e.target.value });
                setContent(formatSms({ ...smsConfig, message: e.target.value }));
              }}
              placeholder="Message (optional)"
              rows={2}
              className={`${inputClassName} resize-y`}
            />
          </div>
        );

      case 'phone':
        return (
          <input
            value={content.replace('tel:', '')}
            onChange={(e) => setContent(formatPhone(e.target.value))}
            placeholder="+1 555-0123"
            className={inputClassName}
          />
        );

      case 'geo':
        return (
          <div className="flex gap-2">
            <input
              value={geoConfig.latitude}
              onChange={(e) => {
                setGeoConfig({ latitude: e.target.value });
                setContent(formatGeo({ ...geoConfig, latitude: e.target.value }));
              }}
              placeholder="Latitude"
              className={inputClassName}
            />
            <input
              value={geoConfig.longitude}
              onChange={(e) => {
                setGeoConfig({ longitude: e.target.value });
                setContent(formatGeo({ ...geoConfig, longitude: e.target.value }));
              }}
              placeholder="Longitude"
              className={inputClassName}
            />
          </div>
        );

      case 'url':
        return (
          <input
            value={content}
            onChange={(e) => setContent(formatUrl(e.target.value))}
            placeholder="https://example.com"
            className={inputClassName}
          />
        );

      default: // text
        return (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your text..."
            rows={3}
            className={`${inputClassName} resize-y min-h-[60px]`}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Content Type Selector */}
      <div>
        <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
          Content Type
        </div>
        <div className="grid grid-cols-3 gap-1">
          {INPUT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setInputType(type.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-md text-[10px] font-semibold transition-all ${
                inputType === type.id
                  ? 'bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/50 text-accent'
                  : 'bg-surface-hover border border-border text-muted hover:text-text'
              }`}
            >
              <span className="text-base">{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Input */}
      <div>
        <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
          Content
        </div>
        {renderInputFields()}
        <div className="text-[10px] text-dim font-mono mt-1">{content.length} chars</div>
      </div>
    </div>
  );
}
