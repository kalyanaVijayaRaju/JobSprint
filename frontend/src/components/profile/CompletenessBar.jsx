import { CheckCircle2 } from 'lucide-react';
import { ProgressBar } from '../ui';

/**
 * Profile strength/completeness meter component.
 */
export default function CompletenessBar({ completeness = 0 }) {
  return (
    <div className="profile-strength-meter" style={{ marginBottom: '24px' }}>
      <ProgressBar
        value={completeness}
        max={100}
        color={completeness === 100 ? 'success' : 'primary'}
        label="Profile Completeness Meter"
      />
      {completeness === 100 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: 'var(--color-success)',
            fontWeight: 600,
            marginTop: '4px',
          }}
        >
          <CheckCircle2 size={14} /> Profile 100% Complete!
        </span>
      )}
    </div>
  );
}
