import { InputPanel } from './InputPanel';
import { StylePanel } from './StylePanel';
import { Preview } from './Preview';

export function GeneratorView() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel - Controls */}
      <div className="w-72 border-r border-border flex flex-col overflow-hidden shrink-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <InputPanel />
          <StylePanel />
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div
        className="flex-1 flex items-center justify-center p-6 overflow-auto"
        style={{
          background: 'radial-gradient(ellipse at center, var(--surface-hover) 0%, var(--bg) 70%)',
        }}
      >
        <Preview />
      </div>
    </div>
  );
}
