import type { ValidationState } from '../../types/qr';

interface ValidationBadgeProps {
  state: ValidationState;
  message?: string;
  suggestions?: string[];
  onValidate: () => void;
  isValidating?: boolean;
}

export function ValidationBadge({
  state,
  message,
  suggestions,
  onValidate,
  isValidating,
}: ValidationBadgeProps) {
  if (state === 'idle') {
    return (
      <button
        onClick={onValidate}
        disabled={isValidating}
        className="flex items-center gap-1.5 px-4 py-2 bg-surface-hover border border-border rounded-lg text-xs font-semibold text-muted hover:text-text hover:border-accent/50 transition-all disabled:opacity-50"
      >
        <span className="text-sm">🔍</span>
        Validate QR
      </button>
    );
  }

  if (state === 'validating') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg">
        <span className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-accent">Validating...</span>
      </div>
    );
  }

  if (state === 'pass') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-lg">
        <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-[11px] font-bold text-white">
          ✓
        </span>
        <div className="flex-1">
          <div className="text-xs font-bold text-success">Scan Verified</div>
          <div className="text-[10px] text-dim">{message || 'QR code scans correctly'}</div>
        </div>
        <button
          onClick={onValidate}
          className="text-[10px] text-dim hover:text-muted px-2 py-1"
        >
          Re-test
        </button>
      </div>
    );
  }

  if (state === 'warn') {
    return (
      <div className="flex flex-col gap-2 px-4 py-2 bg-warning/10 border border-warning/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-warning flex items-center justify-center text-[11px] font-bold text-black">
            !
          </span>
          <div className="flex-1">
            <div className="text-xs font-bold text-warning">Marginal Scan</div>
            <div className="text-[10px] text-dim">
              {message || 'Decoded but reliability is low'}
            </div>
          </div>
          <button
            onClick={onValidate}
            className="text-[10px] text-dim hover:text-muted px-2 py-1"
          >
            Re-test
          </button>
        </div>
        {suggestions && suggestions.length > 0 && (
          <div className="text-[10px] text-warning/80 pl-7">
            💡 {suggestions[0]}
          </div>
        )}
      </div>
    );
  }

  if (state === 'fail') {
    return (
      <div className="flex flex-col gap-2 px-4 py-2 bg-danger/10 border border-danger/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-danger flex items-center justify-center text-[11px] font-bold text-white">
            ✕
          </span>
          <div className="flex-1">
            <div className="text-xs font-bold text-danger">Scan Failed</div>
            <div className="text-[10px] text-dim">
              {message || 'Could not decode QR code'}
            </div>
          </div>
          <button
            onClick={onValidate}
            className="text-[10px] text-dim hover:text-muted px-2 py-1"
          >
            Re-test
          </button>
        </div>
        {suggestions && suggestions.length > 0 && (
          <div className="text-[10px] text-dim pl-7 space-y-0.5">
            {suggestions.slice(0, 2).map((s, i) => (
              <div key={i}>• {s}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
