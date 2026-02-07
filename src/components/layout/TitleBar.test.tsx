import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TitleBar } from './TitleBar';

vi.mock('../../stores/themeStore', () => ({
  useThemeStore: vi.fn(() => ({
    theme: 'dark',
    setTheme: vi.fn(),
    resolvedTheme: () => 'dark',
  })),
}));

vi.mock('../../lib/platform', () => ({
  isTauri: () => false,
}));

import { useThemeStore } from '../../stores/themeStore';

const mockUseThemeStore = vi.mocked(useThemeStore);

describe('TitleBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseThemeStore.mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      resolvedTheme: () => 'dark',
    });
  });

  describe('window dragging', () => {
    it('has data-tauri-drag-region attribute on the titlebar container', () => {
      render(<TitleBar />);

      const titlebar = screen.getByText('QR Foundry').closest('[data-tauri-drag-region]');
      expect(titlebar).not.toBeNull();
    });

    it('drag region is the outermost titlebar element', () => {
      const { container } = render(<TitleBar />);

      // The first child should be the drag region
      const outerDiv = container.firstElementChild;
      expect(outerDiv).toHaveAttribute('data-tauri-drag-region');
    });

    it('interactive buttons are not inside a drag region element themselves', () => {
      render(<TitleBar />);

      // The theme toggle button should be clickable (not blocked by drag)
      const themeButton = screen.getByLabelText('Toggle theme');
      expect(themeButton).toBeInTheDocument();
      expect(themeButton.closest('button')).not.toHaveAttribute('data-tauri-drag-region');
    });
  });

  describe('rendering', () => {
    it('renders the app title', () => {
      render(<TitleBar />);
      expect(screen.getByText('QR Foundry')).toBeInTheDocument();
    });

    it('renders the theme toggle button', () => {
      render(<TitleBar />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    it('renders the logo icon', () => {
      const { container } = render(<TitleBar />);
      const logo = container.querySelector('svg');
      expect(logo).not.toBeNull();
    });
  });

  describe('theme toggle', () => {
    it('calls setTheme when theme toggle is clicked', () => {
      const setTheme = vi.fn();
      mockUseThemeStore.mockReturnValue({
        theme: 'dark',
        setTheme,
        resolvedTheme: () => 'dark',
      });

      render(<TitleBar />);
      fireEvent.click(screen.getByLabelText('Toggle theme'));

      expect(setTheme).toHaveBeenCalledWith('light');
    });

    it('toggles from light to dark', () => {
      const setTheme = vi.fn();
      mockUseThemeStore.mockReturnValue({
        theme: 'light',
        setTheme,
        resolvedTheme: () => 'light',
      });

      render(<TitleBar />);
      fireEvent.click(screen.getByLabelText('Toggle theme'));

      expect(setTheme).toHaveBeenCalledWith('dark');
    });
  });
});
