import { useQrStore } from '../../stores/qrStore';

export function StatusBar() {
  const { exportSize, errorCorrection, validationState } = useQrStore();

  const ecPercent: Record<string, string> = {
    L: '7%',
    M: '15%',
    Q: '25%',
    H: '30%',
  };

  return (
    <div
      className="h-8 flex items-center px-4 shrink-0 transition-colors"
      style={{
        background: 'var(--statusbar-bg)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div
        className="font-mono text-[11px] font-medium flex items-center gap-1.5"
        style={{ color: 'var(--text-faint)' }}
      >
        <span>{exportSize}×{exportSize}</span>
        <span style={{ color: 'var(--text-faint)', margin: '0 4px' }}>·</span>
        <span>EC: {errorCorrection} ({ecPercent[errorCorrection]})</span>

        {validationState === 'pass' && (
          <>
            <span style={{ color: 'var(--text-faint)', margin: '0 4px' }}>·</span>
            <span className="flex items-center gap-1" style={{ color: 'var(--success)' }}>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Validated
            </span>
          </>
        )}

        {validationState === 'fail' && (
          <>
            <span style={{ color: 'var(--text-faint)', margin: '0 4px' }}>·</span>
            <span style={{ color: 'var(--danger)' }}>Failed</span>
          </>
        )}

        {validationState === 'warn' && (
          <>
            <span style={{ color: 'var(--text-faint)', margin: '0 4px' }}>·</span>
            <span style={{ color: 'var(--accent)' }}>Warning</span>
          </>
        )}

        {validationState === 'validating' && (
          <>
            <span style={{ color: 'var(--text-faint)', margin: '0 4px' }}>·</span>
            <span style={{ color: 'var(--accent)' }}>Validating...</span>
          </>
        )}
      </div>
    </div>
  );
}
