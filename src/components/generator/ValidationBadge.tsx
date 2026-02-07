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
        className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-[13px] font-semibold border transition-all disabled:opacity-50"
        style={{
          background: 'var(--success-bg)',
          borderColor: 'var(--success)',
          color: 'var(--success)',
        }}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Validate QR
      </button>
    );
  }

  if (state === 'validating') {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-sm border"
        style={{
          background: 'var(--accent-bg-tint)',
          borderColor: 'var(--accent)',
        }}
      >
        <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Validating...</span>
      </div>
    );
  }

  if (state === 'pass') {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-sm border"
        style={{ background: 'var(--success-bg)', borderColor: 'var(--success)' }}
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: 'var(--success)' }}
        >
          ✓
        </span>
        <div className="flex-1">
          <div className="text-xs font-bold" style={{ color: 'var(--success)' }}>Scan Verified</div>
          <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{message || 'QR code scans correctly'}</div>
        </div>
        <button
          onClick={onValidate}
          className="text-[10px] px-2 py-1"
          style={{ color: 'var(--text-faint)' }}
        >
          Re-test
        </button>
      </div>
    );
  }

  if (state === 'warn') {
    return (
      <div
        className="flex flex-col gap-2 px-4 py-2 rounded-sm border"
        style={{ background: 'var(--accent-bg-tint)', borderColor: 'var(--accent)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-black"
            style={{ background: 'var(--accent)' }}
          >
            !
          </span>
          <div className="flex-1">
            <div className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Marginal Scan</div>
            <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
              {message || 'Decoded but reliability is low'}
            </div>
          </div>
          <button
            onClick={onValidate}
            className="text-[10px] px-2 py-1"
            style={{ color: 'var(--text-faint)' }}
          >
            Re-test
          </button>
        </div>
        {suggestions && suggestions.length > 0 && (
          <div className="text-[10px] pl-7" style={{ color: 'var(--accent)' }}>
            {suggestions[0]}
          </div>
        )}
      </div>
    );
  }

  if (state === 'fail') {
    return (
      <div
        className="flex flex-col gap-2 px-4 py-2 rounded-sm border"
        style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'var(--danger)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: 'var(--danger)' }}
          >
            ✕
          </span>
          <div className="flex-1">
            <div className="text-xs font-bold" style={{ color: 'var(--danger)' }}>Scan Failed</div>
            <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
              {message || 'Could not decode QR code'}
            </div>
          </div>
          <button
            onClick={onValidate}
            className="text-[10px] px-2 py-1"
            style={{ color: 'var(--text-faint)' }}
          >
            Re-test
          </button>
        </div>
        {suggestions && suggestions.length > 0 && (
          <div className="text-[10px] pl-7 space-y-0.5" style={{ color: 'var(--text-faint)' }}>
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
