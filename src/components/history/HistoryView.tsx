import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useHistory, type HistoryItem } from '../../hooks/useHistory';
import { useQrStore } from '../../stores/qrStore';

export function HistoryView() {
  const { items, isLoading, total, hasMore, fetchHistory, deleteFromHistory, clearHistory } =
    useHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      fetchHistory(50, 0, term || undefined);
    },
    [fetchHistory]
  );

  const handleLoadMore = useCallback(() => {
    fetchHistory(50, items.length, searchTerm || undefined);
  }, [fetchHistory, items.length, searchTerm]);

  const handleSelectItem = useCallback((item: HistoryItem) => {
    setSelectedItem(item);
  }, []);

  const handleLoadItem = useCallback(
    (item: HistoryItem) => {
      const store = useQrStore.getState();
      store.setContent(item.content);

      try {
        const style = JSON.parse(item.styleJson);
        if (style.dotStyle) store.setDotStyle(style.dotStyle);
        if (style.cornerSquareStyle) store.setCornerSquareStyle(style.cornerSquareStyle);
        if (style.cornerDotStyle) store.setCornerDotStyle(style.cornerDotStyle);
        if (style.foreground) store.setForeground(style.foreground);
        if (style.background) store.setBackground(style.background);
        if (style.transparentBg !== undefined) store.setTransparentBg(style.transparentBg);
        if (style.logo) store.setLogo(style.logo);
        if (style.errorCorrection) store.setErrorCorrection(style.errorCorrection);
        toast.success('Loaded in Generator');
      } catch {
        toast.error('Failed to load style');
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (id: number) => {
      const success = await deleteFromHistory(id);
      if (success) {
        toast.success('Deleted from history');
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      }
    },
    [deleteFromHistory, selectedItem]
  );

  const handleClearAll = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      const success = await clearHistory();
      if (success) {
        toast.success('History cleared');
        setSelectedItem(null);
      }
    }
  }, [clearHistory]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel */}
      <div
        className="w-72 flex flex-col overflow-hidden shrink-0"
        style={{ borderRight: '1px solid var(--border)' }}
      >
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <div
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
              style={{ color: 'var(--text-muted)' }}
            >
              History ({total})
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[10px] hover:underline"
                style={{ color: 'var(--danger)' }}
              >
                Clear All
              </button>
            )}
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search history..."
            className="w-full rounded-sm px-3 py-2 text-xs outline-none border-2 transition-colors"
            style={{
              background: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--input-border)'; }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading && items.length === 0 ? (
            <div className="text-center text-xs py-8" style={{ color: 'var(--text-faint)' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center text-xs py-8" style={{ color: 'var(--text-faint)' }}>
              {searchTerm ? 'No results found' : 'No history yet'}
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="p-3 rounded-sm border cursor-pointer transition-all"
                  style={{
                    background: selectedItem?.id === item.id ? 'var(--active-bg)' : 'var(--input-bg)',
                    borderColor: selectedItem?.id === item.id ? 'var(--accent)' : 'var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedItem?.id !== item.id) e.currentTarget.style.borderColor = 'var(--text-faint)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedItem?.id !== item.id) e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div className="font-mono text-xs truncate" style={{ color: 'var(--text-primary)' }}>{item.content}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm uppercase"
                      style={{ background: 'var(--accent-bg-tint)', color: 'var(--accent)' }}
                    >
                      {item.qrType}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{formatTime(item.createdAt)}</span>
                  </div>
                  {item.label && (
                    <div className="text-[10px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                  )}
                </div>
              ))}

              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="w-full py-2 text-xs rounded-sm border transition-colors disabled:opacity-50"
                  style={{
                    color: 'var(--text-muted)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {selectedItem ? (
          <div className="text-center max-w-md">
            {selectedItem.thumbnail && (
              <img
                src={selectedItem.thumbnail}
                alt="QR Preview"
                className="w-48 h-48 mx-auto mb-4 rounded-sm border"
                style={{ borderColor: 'var(--border)' }}
              />
            )}
            <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {selectedItem.label || 'QR Code'}
            </div>
            <div
              className="font-mono text-sm p-4 rounded-sm border break-all max-h-32 overflow-y-auto"
              style={{
                color: 'var(--text-muted)',
                background: 'var(--input-bg)',
                borderColor: 'var(--border)',
              }}
            >
              {selectedItem.content}
            </div>
            <div className="flex gap-2 mt-4 justify-center">
              <button
                onClick={() => handleLoadItem(selectedItem)}
                className="px-4 py-2 rounded-sm text-sm font-semibold border transition-all"
                style={{
                  background: 'var(--accent-bg-tint)',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                }}
              >
                Load in Generator
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedItem.content);
                  toast.success('Copied to clipboard');
                }}
                className="px-4 py-2 rounded-sm text-sm font-semibold border transition-all"
                style={{
                  background: 'var(--btn-secondary-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Copy
              </button>
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="px-4 py-2 rounded-sm text-sm font-semibold border transition-all"
                style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-faint)', opacity: 0.3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Select an item from history</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>Click to preview, then load into generator</div>
          </div>
        )}
      </div>
    </div>
  );
}
