// QR content types
export type QrType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'sms'
  | 'phone'
  | 'geo'
  | 'calendar';

// Dot style options
export type DotStyle = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';
export type CornerSquareStyle = 'square' | 'dot' | 'extra-rounded';
export type CornerDotStyle = 'square' | 'dot';

// Error correction levels
export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';

// Export formats
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'eps';

// Logo placement positions
export type LogoPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'all-corners';

// Validation result
export type ValidationState = 'idle' | 'validating' | 'pass' | 'warn' | 'fail';

export interface ValidationResult {
  state: ValidationState;
  decodedContent?: string;
  contentMatch: boolean;
  confidence: number;
  message: string;
  suggestions?: string[];
}

// Gradient configuration
export interface GradientConfig {
  type: 'linear' | 'radial';
  rotation?: number;
  colorStops: Array<{ offset: number; color: string }>;
}

// Logo configuration
export interface LogoConfig {
  src: string; // base64 data URL
  size: number; // percentage of QR area (10-40)
  margin: number; // padding around logo in px
  shape: 'square' | 'circle';
}

// Core style configuration
export interface QrStyle {
  dotStyle: DotStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
  foreground: string;
  background: string;
  gradient?: GradientConfig;
  logo?: LogoConfig;
  transparentBg: boolean;
}

// Core QR configuration
export interface QrConfig {
  content: string;
  type: QrType;
  style: QrStyle;
  errorCorrection: ErrorCorrection;
  size: number;
}

// WiFi-specific input
export interface WifiConfig {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

// vCard input
export interface VCardConfig {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  email?: string;
  phone?: string;
  url?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

// Email input
export interface EmailConfig {
  to: string;
  subject?: string;
  body?: string;
}

// SMS input
export interface SmsConfig {
  phone: string;
  message?: string;
}

// Geo input
export interface GeoConfig {
  latitude: string;
  longitude: string;
}

// Template
export interface Template {
  id: number;
  name: string;
  style: QrStyle;
  preview?: string;
  isDefault: boolean;
  createdAt: Date;
}

// History item
export interface HistoryItem {
  id: number;
  content: string;
  type: QrType;
  label?: string;
  style: QrStyle;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Batch item
export interface BatchItem {
  row: number;
  content: string;
  type: QrType;
  label?: string;
  status: 'pending' | 'generating' | 'validating' | 'done' | 'error';
  validation?: ValidationResult;
  error?: string;
}
