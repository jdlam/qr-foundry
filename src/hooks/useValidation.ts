import { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useQrStore } from '../stores/qrStore';
import type { ValidationState } from '../types/qr';

interface ValidationResult {
  state: 'pass' | 'warn' | 'fail';
  decodedContent: string | null;
  contentMatch: boolean;
  message: string;
  suggestions: string[];
}

export function useValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const { content, setValidationState } = useQrStore();

  const validate = useCallback(
    async (imageDataUrl: string): Promise<ValidationResult | null> => {
      if (!content) {
        setValidationState('fail');
        return null;
      }

      setIsValidating(true);
      setValidationState('validating');

      try {
        const result = await invoke<ValidationResult>('validate_qr', {
          imageData: imageDataUrl,
          expectedContent: content,
        });

        setResult(result);
        setValidationState(result.state as ValidationState);
        return result;
      } catch (error) {
        console.error('Validation error:', error);
        setValidationState('fail');
        setResult({
          state: 'fail',
          decodedContent: null,
          contentMatch: false,
          message: `Validation error: ${error}`,
          suggestions: ['Try generating the QR code again'],
        });
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    [content, setValidationState]
  );

  const resetValidation = useCallback(() => {
    setResult(null);
    setValidationState('idle');
  }, [setValidationState]);

  return {
    validate,
    isValidating,
    result,
    resetValidation,
  };
}

interface ScanResult {
  success: boolean;
  content: string | null;
  qrType: string | null;
  error: string | null;
}

export function useScanQr() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const scanFromFile = useCallback(async (filePath: string): Promise<ScanResult | null> => {
    setIsScanning(true);
    try {
      const result = await invoke<ScanResult>('scan_qr_from_file', { filePath });
      setScanResult(result);
      return result;
    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({
        success: false,
        content: null,
        qrType: null,
        error: `Scan error: ${error}`,
      });
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const scanFromData = useCallback(async (imageData: string): Promise<ScanResult | null> => {
    setIsScanning(true);
    try {
      const result = await invoke<ScanResult>('scan_qr_from_data', { imageData });
      setScanResult(result);
      return result;
    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({
        success: false,
        content: null,
        qrType: null,
        error: `Scan error: ${error}`,
      });
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearScan = useCallback(() => {
    setScanResult(null);
  }, []);

  return {
    scanFromFile,
    scanFromData,
    isScanning,
    scanResult,
    clearScan,
  };
}
