import { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface HistoryItem {
  id: number;
  content: string;
  qrType: string;
  label: string | null;
  styleJson: string;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NewHistoryItem {
  content: string;
  qrType: string;
  label?: string;
  styleJson: string;
  thumbnail?: string;
}

interface HistoryListResult {
  items: HistoryItem[];
  total: number;
  hasMore: boolean;
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchHistory = useCallback(
    async (limit = 50, offset = 0, search?: string): Promise<void> => {
      setIsLoading(true);
      try {
        const result = await invoke<HistoryListResult>('history_list', {
          limit,
          offset,
          search: search || null,
        });

        if (offset === 0) {
          setItems(result.items);
        } else {
          setItems((prev) => [...prev, ...result.items]);
        }
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const saveToHistory = useCallback(
    async (item: NewHistoryItem): Promise<number | null> => {
      try {
        const id = await invoke<number>('history_save', { item });
        // Refresh the list
        await fetchHistory();
        return id;
      } catch (error) {
        console.error('Failed to save to history:', error);
        return null;
      }
    },
    [fetchHistory]
  );

  const deleteFromHistory = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const success = await invoke<boolean>('history_delete', { id });
        if (success) {
          setItems((prev) => prev.filter((item) => item.id !== id));
          setTotal((prev) => prev - 1);
        }
        return success;
      } catch (error) {
        console.error('Failed to delete from history:', error);
        return false;
      }
    },
    []
  );

  const clearHistory = useCallback(async (): Promise<boolean> => {
    try {
      await invoke<number>('history_clear');
      setItems([]);
      setTotal(0);
      setHasMore(false);
      return true;
    } catch (error) {
      console.error('Failed to clear history:', error);
      return false;
    }
  }, []);

  return {
    items,
    isLoading,
    total,
    hasMore,
    fetchHistory,
    saveToHistory,
    deleteFromHistory,
    clearHistory,
  };
}
