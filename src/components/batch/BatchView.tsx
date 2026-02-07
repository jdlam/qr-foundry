import { useCallback, useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { toast } from 'sonner';
import { useBatch, type BatchGenerateItem } from '../../hooks/useBatch';
import { useQrStore } from '../../stores/qrStore';
import {
  useBatchStore,
  type BatchItemWithStatus,
  type ItemStatus,
  type ExportFormat,
} from '../../stores/batchStore';
import { useTauriDragDrop } from '../../hooks/useTauriDragDrop';
import { isTauri } from '../../lib/platform';
import { useState } from 'react';

export function BatchView() {
  const {
    isParsing,
    isGenerating,
    parseError,
    parseCsvContent,
    pickCsvFile,
    parseCsvFile,
    generateZip,
    validateBatch,
    clearBatch,
  } = useBatch();

  const {
    itemsWithStatus,
    generatedItems,
    generateProgress,
    previewIndex,
    exportFormat,
    isValidating,
    setItemsWithStatus,
    setGeneratedItems,
    setGenerateProgress,
    setPreviewIndex,
    setExportFormat,
    setIsValidating,
  } = useBatchStore();

  const [isHtmlDragging, setIsHtmlDragging] = useState(false);
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generatingRef = useRef<Set<number>>(new Set());

  const store = useQrStore();

  // Handle Tauri native drag-drop (for files dragged from OS file manager)
  const handleTauriFileDrop = useCallback(
    async (paths: string[]) => {
      const filePath = paths[0];
      if (filePath && (filePath.endsWith('.csv') || filePath.endsWith('.txt'))) {
        await parseCsvFile(filePath);
      }
    },
    [parseCsvFile]
  );

  const { isDragging: isTauriDragging } = useTauriDragDrop(handleTauriFileDrop);
  const isDragging = isHtmlDragging || isTauriDragging;

  // Preview navigation
  const currentPreviewItem = itemsWithStatus[previewIndex] || null;
  const canGoPrev = previewIndex > 0;
  const canGoNext = previewIndex < itemsWithStatus.length - 1;

  const goToPrevItem = useCallback(() => {
    if (canGoPrev) setPreviewIndex(previewIndex - 1);
  }, [canGoPrev, previewIndex, setPreviewIndex]);

  const goToNextItem = useCallback(() => {
    if (canGoNext) setPreviewIndex(previewIndex + 1);
  }, [canGoNext, previewIndex, setPreviewIndex]);

  const selectPreviewItem = useCallback((index: number) => {
    setPreviewIndex(index);
  }, [setPreviewIndex]);

  // Keyboard navigation for preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (itemsWithStatus.length === 0) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (canGoPrev) setPreviewIndex(previewIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (canGoNext) setPreviewIndex(previewIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemsWithStatus.length, canGoPrev, canGoNext, previewIndex, setPreviewIndex]);

  const handleFileDrop = useCallback(
    async (file: File) => {
      const text = await file.text();
      await parseCsvContent(text);
    },
    [parseCsvContent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsHtmlDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
        handleFileDrop(file);
      }
    },
    [handleFileDrop]
  );

  const handlePickFile = useCallback(async () => {
    const filePath = await pickCsvFile();
    if (filePath) {
      await parseCsvFile(filePath);
    }
  }, [pickCsvFile, parseCsvFile]);

  void handlePickFile;

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFileDrop(file);
      }
    },
    [handleFileDrop]
  );

  const generateQrForItem = useCallback(
    async (
      item: BatchItemWithStatus,
      format: ExportFormat,
      forValidation: boolean = false
    ): Promise<string | null> => {
      return new Promise((resolve) => {
        let qr: QRCodeStyling;

        if (forValidation) {
          qr = new QRCodeStyling({
            width: 512,
            height: 512,
            type: 'canvas',
            data: item.content,
            margin: 20,
            qrOptions: {
              typeNumber: 0,
              mode: 'Byte',
              errorCorrectionLevel: store.errorCorrection,
            },
            dotsOptions: { type: 'square', color: '#000000' },
            cornersSquareOptions: { type: 'square', color: '#000000' },
            cornersDotOptions: { type: 'square', color: '#000000' },
            backgroundOptions: { color: '#ffffff' },
          });
        } else {
          qr = new QRCodeStyling({
            width: store.exportSize,
            height: store.exportSize,
            type: format === 'svg' ? 'svg' : 'canvas',
            data: item.content,
            margin: 10,
            qrOptions: { errorCorrectionLevel: store.errorCorrection },
            dotsOptions: { type: store.dotStyle, color: store.foreground },
            cornersSquareOptions: { type: store.cornerSquareStyle, color: store.foreground },
            cornersDotOptions: { type: store.cornerDotStyle, color: store.foreground },
            backgroundOptions: store.transparentBg
              ? { color: 'transparent' }
              : { color: store.background },
            ...(store.logo?.src
              ? {
                  image: store.logo.src,
                  imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: store.logo.size / 100,
                    margin: store.logo.margin,
                  },
                }
              : {}),
          });
        }

        qr.getRawData(forValidation ? 'png' : format).then((blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const actualBlob = blob instanceof Blob ? blob : new Blob([blob]);
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(actualBlob);
        });
      });
    },
    [store]
  );

  // Auto-generate QR code for current preview item
  useEffect(() => {
    const item = itemsWithStatus[previewIndex];
    if (!item) return;
    if (item.imageData) return;
    if (item.status === 'generating') return;
    if (generatingRef.current.has(previewIndex)) return;

    generatingRef.current.add(previewIndex);

    setItemsWithStatus(
      itemsWithStatus.map((it, idx) =>
        idx === previewIndex ? { ...it, status: 'generating' as ItemStatus } : it
      )
    );

    generateQrForItem(item, 'png')
      .then((imageData) => {
        setItemsWithStatus(
          itemsWithStatus.map((it, idx) =>
            idx === previewIndex
              ? {
                  ...it,
                  status: imageData ? ('done' as ItemStatus) : ('error' as ItemStatus),
                  imageData: imageData || undefined,
                  error: imageData ? undefined : 'Failed to generate',
                }
              : it
          )
        );
      })
      .catch((error) => {
        console.error('Failed to generate preview QR:', error);
        setItemsWithStatus(
          itemsWithStatus.map((it, idx) =>
            idx === previewIndex
              ? { ...it, status: 'error' as ItemStatus, error: 'Failed to generate' }
              : it
          )
        );
      })
      .finally(() => {
        generatingRef.current.delete(previewIndex);
      });
  }, [previewIndex, itemsWithStatus, generateQrForItem, setItemsWithStatus]);

  // Generate all QR codes with validation
  const handleGenerateAll = useCallback(async () => {
    if (itemsWithStatus.length === 0) return;

    setIsLocalGenerating(true);
    setGenerateProgress(0);
    const generated: BatchGenerateItem[] = [];
    const forValidation: BatchGenerateItem[] = [];
    const updatedItems = [...itemsWithStatus];

    try {
      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        updatedItems[i] = { ...item, status: 'generating' };
        setItemsWithStatus([...updatedItems]);

        try {
          const imageData = await generateQrForItem(item, exportFormat);

          if (imageData) {
            updatedItems[i] = { ...item, status: 'done', imageData };
            generated.push({
              row: item.row,
              content: item.content,
              label: item.label,
              imageData,
            });

            const pngForValidation = await generateQrForItem(item, 'png', true);
            if (pngForValidation) {
              forValidation.push({
                row: item.row,
                content: item.content,
                label: item.label,
                imageData: pngForValidation,
              });
            }
          } else {
            updatedItems[i] = { ...item, status: 'error', error: 'Failed to generate' };
          }
        } catch (error) {
          console.error(`Failed to generate QR for row ${item.row}:`, error);
          updatedItems[i] = { ...item, status: 'error', error: 'Failed to generate' };
        }

        setItemsWithStatus([...updatedItems]);
        setGenerateProgress(((i + 1) / updatedItems.length) * 100);
      }

      if (forValidation.length > 0) {
        setIsValidating(true);
        const validatingItems = updatedItems.map((item) =>
          item.status === 'done' ? { ...item, status: 'validating' as ItemStatus } : item
        );
        setItemsWithStatus(validatingItems);

        try {
          const validationResults = await validateBatch(forValidation);

          setItemsWithStatus(
            validatingItems.map((item) => {
              const validation = validationResults.find((v) => v.row === item.row);
              if (validation) {
                if (!validation.success) {
                  return { ...item, status: 'error' as ItemStatus, error: validation.error || 'Validation failed' };
                } else if (!validation.contentMatch) {
                  return { ...item, status: 'error' as ItemStatus, error: 'Content mismatch' };
                } else {
                  return { ...item, status: 'validated' as ItemStatus };
                }
              }
              return item;
            })
          );
        } catch (error) {
          console.error('Failed to validate batch:', error);
          setItemsWithStatus(
            validatingItems.map((item) =>
              item.status === 'validating' ? { ...item, status: 'done' as ItemStatus } : item
            )
          );
        } finally {
          setIsValidating(false);
        }
      }

      setGeneratedItems(generated);
    } finally {
      setIsLocalGenerating(false);
    }
  }, [itemsWithStatus, generateQrForItem, exportFormat, validateBatch, setItemsWithStatus, setGeneratedItems, setGenerateProgress, setIsValidating]);

  const handleExportZip = useCallback(async () => {
    if (generatedItems.length === 0) return;
    const result = await generateZip(generatedItems, exportFormat, false);
    if (result?.success) {
      toast.success('ZIP exported successfully');
    } else {
      toast.error('Failed to export ZIP');
    }
  }, [generatedItems, generateZip, exportFormat]);

  const handleDownloadCurrent = useCallback(async () => {
    if (!currentPreviewItem?.imageData) return;
    const link = document.createElement('a');
    link.href = currentPreviewItem.imageData;
    const filename = currentPreviewItem.label
      ? `${currentPreviewItem.label}.${exportFormat}`
      : `qr-code-${currentPreviewItem.row}.${exportFormat}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentPreviewItem, exportFormat]);

  const handleClear = useCallback(() => {
    clearBatch();
    setGenerateProgress(0);
  }, [clearBatch, setGenerateProgress]);

  const handleFormatChange = useCallback((newFormat: ExportFormat) => {
    if (newFormat === exportFormat) return;
    setExportFormat(newFormat);
    if (generatedItems.length > 0) {
      setGeneratedItems([]);
      setGenerateProgress(0);
      setItemsWithStatus(
        itemsWithStatus.map((item) => ({
          ...item,
          status: 'pending' as ItemStatus,
          error: undefined,
        }))
      );
    }
  }, [exportFormat, generatedItems.length, itemsWithStatus, setExportFormat, setGeneratedItems, setGenerateProgress, setItemsWithStatus]);

  const allGenerated = generatedItems.length > 0 && generatedItems.length === itemsWithStatus.length;
  const isProcessing = isLocalGenerating || isGenerating || isValidating;

  const renderStatusIndicator = (status: ItemStatus) => {
    switch (status) {
      case 'pending':
        return null;
      case 'generating':
        return <span className="w-3 h-3 border rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />;
      case 'validating':
        return <span className="w-3 h-3 border rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />;
      case 'done':
        return (
          <span style={{ color: 'var(--accent)' }} title="Generated">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
          </span>
        );
      case 'validated':
        return (
          <span style={{ color: 'var(--success)' }} title="Validated">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'error':
        return (
          <span style={{ color: 'var(--danger)' }} title="Error">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel */}
      <div
        className="w-80 flex flex-col overflow-hidden shrink-0"
        style={{ borderRight: '1px solid var(--border)' }}
      >
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Batch Generation
          </div>

          {/* File Drop Zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileInput}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsHtmlDragging(true);
            }}
            onDragLeave={() => setIsHtmlDragging(false)}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors"
            style={{
              borderColor: isDragging ? 'var(--accent)' : 'var(--dropzone-border)',
              background: isDragging ? 'var(--accent-bg-tint)' : 'var(--dropzone-bg)',
            }}
          >
            {isParsing ? (
              <>
                <span className="w-5 h-5 border-2 rounded-full animate-spin inline-block mb-2" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                <div className="text-xs" style={{ color: 'var(--accent)' }}>Parsing...</div>
              </>
            ) : (
              <>
                <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-faint)', opacity: 0.4 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="1" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Drop CSV file here</div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>or click to browse</div>
              </>
            )}
          </div>

          {parseError && (
            <div
              className="mt-3 p-2 rounded-sm border text-xs"
              style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'var(--danger)', color: 'var(--danger)' }}
            >
              {parseError}
            </div>
          )}

          {/* CSV Format Help */}
          <div
            className="mt-3 p-2 rounded-sm border"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--border)' }}
          >
            <div className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Expected columns:</div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>content, type, label</div>
          </div>
        </div>

        {/* Items Table */}
        {itemsWithStatus.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs">
              <thead style={{ background: 'var(--input-bg)' }} className="sticky top-0">
                <tr style={{ color: 'var(--text-faint)' }} className="text-left">
                  <th className="p-2 font-medium">#</th>
                  <th className="p-2 font-medium">Content</th>
                  <th className="p-2 font-medium">Type</th>
                  <th className="p-2 font-medium w-10">Status</th>
                </tr>
              </thead>
              <tbody>
                {itemsWithStatus.map((item, index) => (
                  <tr
                    key={item.row}
                    onClick={() => selectPreviewItem(index)}
                    className="cursor-pointer transition-colors"
                    style={{
                      borderTop: '1px solid var(--border)',
                      background: index === previewIndex ? 'var(--active-bg)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (index !== previewIndex) e.currentTarget.style.background = 'var(--hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                      if (index !== previewIndex) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td className="p-2" style={{ color: 'var(--text-faint)' }}>{item.row}</td>
                    <td className="p-2 font-mono truncate max-w-[140px]" title={item.content} style={{ color: 'var(--text-primary)' }}>
                      {item.content}
                    </td>
                    <td className="p-2">
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm uppercase"
                        style={{ background: 'var(--accent-bg-tint)', color: 'var(--accent)' }}
                      >
                        {item.qrType}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center justify-center" title={item.error}>
                        {renderStatusIndicator(item.status)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        {itemsWithStatus.length > 0 && (
          <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
            {/* Format Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Format:</span>
              <div className="flex gap-1 flex-1">
                <button
                  onClick={() => handleFormatChange('png')}
                  disabled={isProcessing}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-sm border transition-all disabled:opacity-50"
                  style={{
                    background: exportFormat === 'png' ? 'var(--accent-bg-tint)' : 'var(--btn-secondary-bg)',
                    borderColor: exportFormat === 'png' ? 'var(--accent)' : 'var(--border)',
                    color: exportFormat === 'png' ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  PNG
                </button>
                <button
                  onClick={() => handleFormatChange('svg')}
                  disabled={isProcessing}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-sm border transition-all disabled:opacity-50"
                  style={{
                    background: exportFormat === 'svg' ? 'var(--accent-bg-tint)' : 'var(--btn-secondary-bg)',
                    borderColor: exportFormat === 'svg' ? 'var(--accent)' : 'var(--border)',
                    color: exportFormat === 'svg' ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  SVG
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateAll}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-sm text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent-bg-tint)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              }}
            >
              {isLocalGenerating && !isValidating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                  Generating...
                </span>
              ) : isValidating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                  Validating...
                </span>
              ) : (
                'Generate All'
              )}
            </button>

            {/* Export ZIP Button (desktop only) */}
            {isTauri() && (
              <button
                onClick={handleExportZip}
                disabled={!allGenerated || isProcessing}
                className="w-full py-2.5 rounded-sm text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--btn-secondary-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Export as ZIP
              </button>
            )}

            <button
              onClick={handleClear}
              disabled={isProcessing}
              className="w-full py-2 text-xs rounded-sm border transition-colors disabled:opacity-50"
              style={{
                color: 'var(--text-muted)',
                borderColor: 'var(--border)',
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {itemsWithStatus.length > 0 ? (
          <div className="flex flex-col items-center max-w-lg w-full">
            {/* Progress bar when generating */}
            {isLocalGenerating && (
              <div className="w-full max-w-xs mb-6">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${generateProgress}%`, background: 'var(--accent)' }}
                  />
                </div>
              </div>
            )}

            {/* Gallery Navigation */}
            <div className="flex items-center gap-4 w-full justify-center">
              <button
                onClick={goToPrevItem}
                disabled={!canGoPrev}
                className="p-3 rounded-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--btn-secondary-bg)',
                  borderColor: 'var(--border)',
                }}
                title="Previous (←)"
              >
                <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex flex-col items-center">
                <div
                  className="rounded-sm p-4 border"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--border)' }}
                >
                  <div className="w-[250px] h-[250px] flex items-center justify-center bg-white rounded-sm">
                    {currentPreviewItem?.imageData ? (
                      <img
                        src={currentPreviewItem.imageData}
                        alt={`QR ${currentPreviewItem.row}`}
                        className="w-full h-full object-contain"
                      />
                    ) : currentPreviewItem?.status === 'generating' ? (
                      <span className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                    ) : (
                      <div className="text-sm text-center px-4" style={{ color: 'var(--text-faint)' }}>
                        Click "Generate All" to create QR codes
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Info */}
                {currentPreviewItem && (
                  <div className="mt-4 text-center">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      Item {previewIndex + 1} of {itemsWithStatus.length}
                    </div>
                    <div className="font-mono text-sm max-w-[250px] truncate" style={{ color: 'var(--text-primary)' }} title={currentPreviewItem.content}>
                      {currentPreviewItem.content}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-sm uppercase"
                        style={{ background: 'var(--accent-bg-tint)', color: 'var(--accent)' }}
                      >
                        {currentPreviewItem.qrType}
                      </span>
                      {currentPreviewItem.label && (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {currentPreviewItem.label}
                        </span>
                      )}
                    </div>

                    {/* Validation Status Badge */}
                    {currentPreviewItem.status !== 'pending' && (
                      <div className="mt-3 flex items-center justify-center gap-1.5">
                        {currentPreviewItem.status === 'generating' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-medium" style={{ background: 'var(--accent-bg-tint)', color: 'var(--accent)' }}>
                            <span className="w-2.5 h-2.5 border rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                            Generating...
                          </span>
                        )}
                        {currentPreviewItem.status === 'validating' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-medium" style={{ background: 'var(--accent-bg-tint)', color: 'var(--accent)' }}>
                            <span className="w-2.5 h-2.5 border rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                            Validating...
                          </span>
                        )}
                        {currentPreviewItem.status === 'done' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-medium" style={{ background: 'var(--accent-bg-tint)', color: 'var(--accent)' }}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                            Generated
                          </span>
                        )}
                        {currentPreviewItem.status === 'validated' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-medium" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Validated
                          </span>
                        )}
                        {currentPreviewItem.status === 'error' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-medium" style={{ background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)' }} title={currentPreviewItem.error}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {currentPreviewItem.error || 'Error'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Download Current Button */}
                {currentPreviewItem?.imageData && (
                  <button
                    onClick={handleDownloadCurrent}
                    className="mt-4 px-4 py-2 rounded-sm text-xs font-semibold border transition-all flex items-center gap-2"
                    style={{
                      background: 'var(--btn-secondary-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download {exportFormat.toUpperCase()}
                  </button>
                )}
              </div>

              <button
                onClick={goToNextItem}
                disabled={!canGoNext}
                className="p-3 rounded-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--btn-secondary-bg)',
                  borderColor: 'var(--border)',
                }}
                title="Next (→)"
              >
                <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-faint)', opacity: 0.3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Import a CSV to batch generate QR codes</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>Each row becomes a styled QR code</div>

            {/* Example CSV */}
            <div
              className="mt-6 p-4 rounded-sm border text-left max-w-xs mx-auto"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--border)' }}
            >
              <div className="text-[10px] mb-2" style={{ color: 'var(--text-faint)' }}>Example CSV:</div>
              <pre className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {`content,type,label
https://example.com,url,Homepage
+1-555-0123,phone,Support
Hello World,text,Greeting`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
