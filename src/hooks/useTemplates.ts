import { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface Template {
  id: number;
  name: string;
  styleJson: string;
  preview: string | null;
  isDefault: boolean;
  createdAt: string;
}

interface NewTemplate {
  name: string;
  styleJson: string;
  preview?: string;
  isDefault?: boolean;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await invoke<Template[]>('template_list');
      setTemplates(result);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTemplate = useCallback(async (id: number): Promise<Template | null> => {
    try {
      const result = await invoke<Template | null>('template_get', { id });
      return result;
    } catch (error) {
      console.error('Failed to get template:', error);
      return null;
    }
  }, []);

  const saveTemplate = useCallback(
    async (template: NewTemplate): Promise<number | null> => {
      try {
        const id = await invoke<number>('template_save', { template });
        await fetchTemplates();
        return id;
      } catch (error) {
        console.error('Failed to save template:', error);
        return null;
      }
    },
    [fetchTemplates]
  );

  const updateTemplate = useCallback(
    async (id: number, template: NewTemplate): Promise<boolean> => {
      try {
        const success = await invoke<boolean>('template_update', { id, template });
        if (success) {
          await fetchTemplates();
        }
        return success;
      } catch (error) {
        console.error('Failed to update template:', error);
        return false;
      }
    },
    [fetchTemplates]
  );

  const deleteTemplate = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const success = await invoke<boolean>('template_delete', { id });
        if (success) {
          setTemplates((prev) => prev.filter((t) => t.id !== id));
        }
        return success;
      } catch (error) {
        console.error('Failed to delete template:', error);
        return false;
      }
    },
    []
  );

  const setDefaultTemplate = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const success = await invoke<boolean>('template_set_default', { id });
        if (success) {
          setTemplates((prev) =>
            prev.map((t) => ({
              ...t,
              isDefault: t.id === id,
            }))
          );
        }
        return success;
      } catch (error) {
        console.error('Failed to set default template:', error);
        return false;
      }
    },
    []
  );

  return {
    templates,
    isLoading,
    fetchTemplates,
    getTemplate,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}
