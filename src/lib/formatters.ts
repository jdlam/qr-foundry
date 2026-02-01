import type { WifiConfig, VCardConfig, EmailConfig, SmsConfig, GeoConfig } from '../types/qr';

/**
 * Format WiFi credentials for QR code
 * Format: WIFI:T:<encryption>;S:<ssid>;P:<password>;H:<hidden>;;
 */
export function formatWifi(config: WifiConfig): string {
  const { ssid, password, encryption, hidden } = config;
  let result = `WIFI:T:${encryption};S:${escapeWifiField(ssid)};`;

  if (encryption !== 'nopass' && password) {
    result += `P:${escapeWifiField(password)};`;
  }

  if (hidden) {
    result += 'H:true;';
  }

  return result + ';';
}

/**
 * Escape special characters in WiFi fields
 */
function escapeWifiField(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/:/g, '\\:')
    .replace(/"/g, '\\"');
}

/**
 * Format vCard for QR code
 * Using vCard 3.0 format for compatibility
 */
export function formatVCard(config: VCardConfig): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  // Name (required)
  lines.push(`N:${config.lastName || ''};${config.firstName || ''};;;`);
  lines.push(`FN:${[config.firstName, config.lastName].filter(Boolean).join(' ')}`);

  // Organization
  if (config.organization) {
    lines.push(`ORG:${config.organization}`);
  }

  // Title
  if (config.title) {
    lines.push(`TITLE:${config.title}`);
  }

  // Phone
  if (config.phone) {
    lines.push(`TEL:${config.phone}`);
  }

  // Email
  if (config.email) {
    lines.push(`EMAIL:${config.email}`);
  }

  // URL
  if (config.url) {
    lines.push(`URL:${config.url}`);
  }

  // Address
  if (config.address) {
    const { street, city, state, zip, country } = config.address;
    lines.push(`ADR:;;${street || ''};${city || ''};${state || ''};${zip || ''};${country || ''}`);
  }

  lines.push('END:VCARD');

  return lines.join('\n');
}

/**
 * Format email for QR code
 * Format: mailto:<to>?subject=<subject>&body=<body>
 */
export function formatEmail(config: EmailConfig): string {
  const params: string[] = [];

  if (config.subject) {
    params.push(`subject=${encodeURIComponent(config.subject)}`);
  }

  if (config.body) {
    params.push(`body=${encodeURIComponent(config.body)}`);
  }

  let result = `mailto:${config.to}`;
  if (params.length > 0) {
    result += `?${params.join('&')}`;
  }

  return result;
}

/**
 * Format SMS for QR code
 * Format: sms:<phone>?body=<message> or smsto:<phone>:<message>
 */
export function formatSms(config: SmsConfig): string {
  let result = `sms:${config.phone}`;

  if (config.message) {
    result += `?body=${encodeURIComponent(config.message)}`;
  }

  return result;
}

/**
 * Format phone number for QR code
 * Format: tel:<number>
 */
export function formatPhone(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`;
}

/**
 * Format geo coordinates for QR code
 * Format: geo:<lat>,<lng>
 */
export function formatGeo(config: GeoConfig): string {
  return `geo:${config.latitude},${config.longitude}`;
}

/**
 * Format URL - ensures it has a protocol
 */
export function formatUrl(url: string): string {
  if (!url) return '';

  // If no protocol, add https://
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }

  return url;
}

/**
 * Detect QR type from content
 */
export function detectQrType(content: string): string {
  if (!content) return 'text';

  const lower = content.toLowerCase();

  if (lower.startsWith('wifi:')) return 'wifi';
  if (lower.startsWith('begin:vcard')) return 'vcard';
  if (lower.startsWith('mailto:')) return 'email';
  if (lower.startsWith('sms:') || lower.startsWith('smsto:')) return 'sms';
  if (lower.startsWith('tel:')) return 'phone';
  if (lower.startsWith('geo:')) return 'geo';
  if (lower.startsWith('begin:vevent')) return 'calendar';
  if (/^https?:\/\//i.test(content)) return 'url';
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(content)) return 'url';

  return 'text';
}
