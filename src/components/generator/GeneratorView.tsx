import { InputPanel } from './InputPanel';
import { StylePanel } from './StylePanel';
import { Preview } from './Preview';

export function GeneratorView() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel - Controls */}
      <div
        className="w-[360px] shrink-0 flex flex-col overflow-hidden"
        style={{ borderRight: '1px solid var(--border)' }}
      >
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <InputPanel />
          <StylePanel />
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <Preview />
      </div>
    </div>
  );
}
