import { useState, useEffect, useCallback, useRef } from 'react';
import { isTauri } from '../lib/platform';

interface UpdateCheckResult {
  updateAvailable: boolean;
  installing: boolean;
  install: () => void;
  dismiss: () => void;
}

export function useUpdateCheck(): UpdateCheckResult {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installing, setInstalling] = useState(false);
  const installingRef = useRef(false);
  // Store the update object so we can install later
  const [pendingUpdate, setPendingUpdate] = useState<{
    downloadAndInstall: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    if (!isTauri()) return;

    let cancelled = false;

    (async () => {
      try {
        const { check } = await import('@tauri-apps/plugin-updater');
        const update = await check();
        if (cancelled) return;

        if (update) {
          setPendingUpdate(update);
          setUpdateAvailable(true);
        }
      } catch {
        // Silently fail — no releases exist yet, or offline
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const install = useCallback(async () => {
    if (!pendingUpdate || installingRef.current) return;
    installingRef.current = true;
    setInstalling(true);
    try {
      await pendingUpdate.downloadAndInstall();
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch {
      installingRef.current = false;
      setInstalling(false);
    }
  }, [pendingUpdate]);

  const dismiss = useCallback(() => {
    setUpdateAvailable(false);
    setPendingUpdate(null);
  }, []);

  return { updateAvailable, installing, install, dismiss };
}
