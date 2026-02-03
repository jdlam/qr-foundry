import { useEffect, useRef, useCallback, useState } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

interface DragDropState {
  isDragging: boolean;
  droppedFiles: string[];
}

type DropCallback = (paths: string[]) => void;

/**
 * Hook to handle Tauri's native drag-drop events.
 * Returns dragging state and allows registering a callback for file drops.
 */
export function useTauriDragDrop(onDrop?: DropCallback) {
  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    droppedFiles: [],
  });

  const callbackRef = useRef(onDrop);
  callbackRef.current = onDrop;

  useEffect(() => {
    let unlistenPromise: Promise<() => void> | null = null;

    console.log('[useTauriDragDrop] Initializing hook...');

    try {
      const webview = getCurrentWebviewWindow();
      console.log('[useTauriDragDrop] Got webview:', webview ? 'yes' : 'no');

      unlistenPromise = webview.onDragDropEvent((event) => {
        console.log('[useTauriDragDrop] Event received:', event.payload.type);
        if (event.payload.type === 'over') {
          setState((s) => ({ ...s, isDragging: true }));
        } else if (event.payload.type === 'leave') {
          setState((s) => ({ ...s, isDragging: false }));
        } else if (event.payload.type === 'drop') {
          console.log('[useTauriDragDrop] Drop event - paths:', event.payload.paths);
          setState({ isDragging: false, droppedFiles: event.payload.paths });
          if (callbackRef.current) {
            console.log('[useTauriDragDrop] Calling callback with paths:', event.payload.paths);
            callbackRef.current(event.payload.paths);
          } else {
            console.log('[useTauriDragDrop] No callback registered!');
          }
        }
      });
    } catch (err) {
      // Tauri APIs not available (e.g., running in browser without Tauri)
      console.warn('Tauri drag-drop not available:', err);
    }

    return () => {
      unlistenPromise?.then((fn) => fn());
    };
  }, []);

  const clearDroppedFiles = useCallback(() => {
    setState((s) => ({ ...s, droppedFiles: [] }));
  }, []);

  return {
    isDragging: state.isDragging,
    droppedFiles: state.droppedFiles,
    clearDroppedFiles,
  };
}
