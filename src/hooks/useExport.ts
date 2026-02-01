import { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ExportResult {
  success: boolean;
  path: string | null;
  error: string | null;
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportPath, setLastExportPath] = useState<string | null>(null);

  const exportPng = useCallback(
    async (imageDataUrl: string, suggestedName?: string): Promise<ExportResult> => {
      setIsExporting(true);
      try {
        const result = await invoke<ExportResult>('export_png', {
          imageData: imageDataUrl,
          suggestedName: suggestedName || 'qr-code.png',
        });

        if (result.success && result.path) {
          setLastExportPath(result.path);
        }

        return result;
      } catch (error) {
        console.error('Export error:', error);
        return {
          success: false,
          path: null,
          error: `Export failed: ${error}`,
        };
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportSvg = useCallback(
    async (svgData: string, suggestedName?: string): Promise<ExportResult> => {
      setIsExporting(true);
      try {
        const result = await invoke<ExportResult>('export_svg', {
          svgData,
          suggestedName: suggestedName || 'qr-code.svg',
        });

        if (result.success && result.path) {
          setLastExportPath(result.path);
        }

        return result;
      } catch (error) {
        console.error('Export error:', error);
        return {
          success: false,
          path: null,
          error: `Export failed: ${error}`,
        };
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const copyToClipboard = useCallback(async (imageDataUrl: string): Promise<boolean> => {
    try {
      await invoke<boolean>('copy_image_to_clipboard', {
        imageData: imageDataUrl,
      });
      return true;
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      return false;
    }
  }, []);

  const pickImageFile = useCallback(async (): Promise<string | null> => {
    try {
      const result = await invoke<string | null>('pick_image_file');
      return result;
    } catch (error) {
      console.error('Pick file error:', error);
      return null;
    }
  }, []);

  return {
    exportPng,
    exportSvg,
    copyToClipboard,
    pickImageFile,
    isExporting,
    lastExportPath,
  };
}
