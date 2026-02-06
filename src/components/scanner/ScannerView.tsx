import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useScanQr } from '../../hooks/useValidation';
import { useExport } from '../../hooks/useExport';
import { useQrStore } from '../../stores/qrStore';
import { useTauriDragDrop } from '../../hooks/useTauriDragDrop';

export function ScannerView() {
  const { scanFromFile, scanFromData, isScanning, scanResult, clearScan } = useScanQr();
  const { pickImageFile } = useExport();
  const [isHtmlDragging, setIsHtmlDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Tauri native drag-drop (for files dragged from OS file manager)
  const handleTauriFileDrop = useCallback(
    async (paths: string[]) => {
      const filePath = paths[0];
      if (filePath) {
        const ext = filePath.toLowerCase().split('.').pop();
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext || '')) {
          setError(null);
          await scanFromFile(filePath);
        } else {
          setError('Please drop an image file');
        }
      }
    },
    [scanFromFile]
  );

  const { isDragging: isTauriDragging } = useTauriDragDrop(handleTauriFileDrop);
  const isDragging = isHtmlDragging || isTauriDragging;

  useEffect(() => {
    if (scanResult) {
      setError(scanResult.error);
    }
  }, [scanResult]);

  const handleFileDrop = useCallback(
    async (file: File) => {
      setError(null);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        await scanFromData(dataUrl);
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsDataURL(file);
    },
    [scanFromData]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsHtmlDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFileDrop(file);
      } else {
        setError('Please drop an image file');
      }
    },
    [handleFileDrop]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFileDrop(file);
          }
          break;
        }
      }
    },
    [handleFileDrop]
  );

  const handlePickFile = useCallback(async () => {
    const filePath = await pickImageFile();
    if (filePath) {
      await scanFromFile(filePath);
    }
  }, [pickImageFile, scanFromFile]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleCopyContent = useCallback(() => {
    if (scanResult?.content) {
      navigator.clipboard.writeText(scanResult.content);
      toast.success('Copied to clipboard');
    }
  }, [scanResult]);

  const handleRegenerate = useCallback(() => {
    if (scanResult?.content) {
      const store = useQrStore.getState();
      store.setContent(scanResult.content);
      toast.success('Loaded in Generator');
    }
  }, [scanResult]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel */}
      <div
        className="w-72 flex flex-col overflow-hidden shrink-0"
        style={{ borderRight: '1px solid var(--border)' }}
      >
        <div className="flex-1 overflow-y-auto p-5">
          <div
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] mb-2.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Scan QR Code
          </div>

          {/* Drop Zone */}
          <div
            onClick={handlePickFile}
            onDragOver={(e) => {
              e.preventDefault();
              setIsHtmlDragging(true);
            }}
            onDragLeave={() => setIsHtmlDragging(false)}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors"
            style={{
              borderColor: isDragging ? 'var(--accent)' : 'var(--dropzone-border)',
              background: isDragging ? 'var(--accent-bg-tint)' : 'var(--dropzone-bg)',
            }}
          >
            {isScanning ? (
              <>
                <span className="w-6 h-6 border-2 rounded-full animate-spin inline-block mb-2" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                <div className="text-xs" style={{ color: 'var(--accent)' }}>Scanning...</div>
              </>
            ) : (
              <>
                <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-faint)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                </svg>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Drop QR image here</div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>
                  or click to browse / paste (⌘V)
                </div>
              </>
            )}
          </div>

          {/* Result */}
          {(scanResult || error) && (
            <div
              className="mt-5 p-3 rounded-sm border"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--border)' }}
            >
              <div
                className="text-[10px] uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-faint)' }}
              >
                {error || !scanResult?.success ? 'Error' : 'Decoded Content'}
              </div>
              {error || !scanResult?.success ? (
                <div className="text-xs" style={{ color: 'var(--danger)' }}>
                  {error || scanResult?.error || 'Unknown error'}
                </div>
              ) : (
                <>
                  <div className="font-mono text-xs break-all max-h-32 overflow-y-auto" style={{ color: 'var(--text-primary)' }}>
                    {scanResult?.content}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-sm uppercase"
                      style={{ background: 'var(--accent-bg-tint)', color: 'var(--accent)' }}
                    >
                      {scanResult?.qrType}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyContent}
                        className="text-[10px] transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Copy
                      </button>
                      <button
                        onClick={handleRegenerate}
                        className="text-[10px] transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Re-generate
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Clear button */}
          {scanResult && (
            <button
              onClick={clearScan}
              className="w-full mt-3 py-2 text-xs rounded-sm border transition-colors"
              style={{
                color: 'var(--text-muted)',
                borderColor: 'var(--border)',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {scanResult?.success ? (
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4" style={{ color: 'var(--success)' }}>✓</div>
            <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>QR Code Decoded</div>
            <div
              className="font-mono text-sm p-4 rounded-sm border break-all max-h-48 overflow-y-auto"
              style={{
                color: 'var(--text-muted)',
                background: 'var(--input-bg)',
                borderColor: 'var(--border)',
              }}
            >
              {scanResult.content}
            </div>
            <div className="flex gap-2 mt-4 justify-center flex-wrap">
              <button
                onClick={handleCopyContent}
                className="px-4 py-2 rounded-sm text-sm font-semibold border transition-all"
                style={{
                  background: 'var(--btn-secondary-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Copy Content
              </button>
              {scanResult.qrType === 'url' && (
                <button
                  onClick={() => window.open(scanResult.content!, '_blank')}
                  className="px-4 py-2 rounded-sm text-sm font-semibold border transition-all"
                  style={{
                    background: 'var(--accent-bg-tint)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                  }}
                >
                  Open URL
                </button>
              )}
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 rounded-sm text-sm font-semibold border transition-all"
                style={{
                  background: 'var(--btn-secondary-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Re-generate
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-faint)', opacity: 0.3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Drop a QR code image to scan</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>Supports PNG, JPG, WebP, and clipboard</div>
          </div>
        )}
      </div>
    </div>
  );
}
