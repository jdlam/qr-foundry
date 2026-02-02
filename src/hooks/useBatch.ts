import { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface BatchItem {
  row: number;
  content: string;
  qrType: string;
  label: string | null;
}

interface BatchParseResult {
  success: boolean;
  items: BatchItem[];
  error: string | null;
  totalRows: number;
}

export interface BatchGenerateItem {
  row: number;
  content: string;
  label: string | null;
  imageData: string;
}

export interface BatchValidationResult {
  row: number;
  success: boolean;
  decodedContent: string | null;
  contentMatch: boolean;
  error: string | null;
}

interface BatchGenerateResult {
  success: boolean;
  zipPath: string | null;
  validationResults: BatchValidationResult[];
  error: string | null;
}

interface BatchSaveFilesResult {
  success: boolean;
  directory: string | null;
  filesSaved: number;
  error: string | null;
}

export function useBatch() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Map<number, BatchValidationResult>>(
    new Map()
  );

  const parseCsvFile = useCallback(async (filePath: string): Promise<boolean> => {
    console.log('[useBatch] parseCsvFile called with:', filePath);
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await invoke<BatchParseResult>('batch_parse_csv', { filePath });
      console.log('[useBatch] parseCsvFile result:', result);
      if (result.success) {
        setItems(result.items);
        return true;
      } else {
        setParseError(result.error || 'Failed to parse CSV');
        return false;
      }
    } catch (error) {
      console.error('[useBatch] parseCsvFile error:', error);
      setParseError(`Failed to parse CSV: ${error}`);
      return false;
    } finally {
      setIsParsing(false);
    }
  }, []);

  const parseCsvContent = useCallback(async (content: string): Promise<boolean> => {
    console.log('[useBatch] parseCsvContent called, content length:', content.length);
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await invoke<BatchParseResult>('batch_parse_csv_content', { content });
      console.log('[useBatch] parseCsvContent result:', result);
      if (result.success) {
        setItems(result.items);
        return true;
      } else {
        setParseError(result.error || 'Failed to parse CSV');
        return false;
      }
    } catch (error) {
      console.error('[useBatch] parseCsvContent error:', error);
      setParseError(`Failed to parse CSV: ${error}`);
      return false;
    } finally {
      setIsParsing(false);
    }
  }, []);

  const pickCsvFile = useCallback(async (): Promise<string | null> => {
    try {
      const result = await invoke<string | null>('pick_csv_file');
      return result;
    } catch (error) {
      console.error('Failed to pick CSV file:', error);
      return null;
    }
  }, []);

  const validateBatch = useCallback(
    async (generatedItems: BatchGenerateItem[]): Promise<BatchValidationResult[]> => {
      setIsLoading(true);
      try {
        const results = await invoke<BatchValidationResult[]>('batch_validate', {
          items: generatedItems,
        });

        const resultsMap = new Map<number, BatchValidationResult>();
        results.forEach((r) => resultsMap.set(r.row, r));
        setValidationResults(resultsMap);

        return results;
      } catch (error) {
        console.error('Failed to validate batch:', error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const generateZip = useCallback(
    async (
      generatedItems: BatchGenerateItem[],
      validate: boolean
    ): Promise<BatchGenerateResult | null> => {
      setIsGenerating(true);
      try {
        const result = await invoke<BatchGenerateResult>('batch_generate_zip', {
          items: generatedItems,
          validate,
        });

        if (result.validationResults.length > 0) {
          const resultsMap = new Map<number, BatchValidationResult>();
          result.validationResults.forEach((r) => resultsMap.set(r.row, r));
          setValidationResults(resultsMap);
        }

        return result;
      } catch (error) {
        console.error('Failed to generate ZIP:', error);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const saveFiles = useCallback(
    async (
      generatedItems: BatchGenerateItem[],
      format: 'png' | 'svg',
      baseName: string = 'qr-code'
    ): Promise<BatchSaveFilesResult | null> => {
      setIsGenerating(true);
      try {
        const result = await invoke<BatchSaveFilesResult>('batch_save_files', {
          items: generatedItems,
          format,
          baseName,
        });
        return result;
      } catch (error) {
        console.error('Failed to save files:', error);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const clearBatch = useCallback(() => {
    setItems([]);
    setParseError(null);
    setValidationResults(new Map());
  }, []);

  return {
    items,
    isLoading,
    isParsing,
    isGenerating,
    parseError,
    validationResults,
    parseCsvFile,
    parseCsvContent,
    pickCsvFile,
    validateBatch,
    generateZip,
    saveFiles,
    clearBatch,
  };
}
