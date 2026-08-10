import { useState, useEffect } from 'react';

/**
 * Dual-thumb or single-value salary range slider for Indian INR/LPA or USD values.
 */
export default function SalaryRangeSlider({ minSalary, setMinSalary, maxSalary, setMaxSalary, minLimit = 0, maxLimit = 500000 }) {
  const [minVal, setMinVal] = useState(minSalary || minLimit);
  const [maxVal, setMaxVal] = useState(maxSalary || maxLimit);

  useEffect(() => {
    setMinVal(minSalary || minLimit);
  }, [minSalary, minLimit]);

  useEffect(() => {
    setMaxVal(maxSalary || maxLimit);
  }, [maxSalary, maxLimit]);

  const formatAmount = (val) => {
    if (!val) return '$0';
    if (val >= 1000) return `$${Math.round(val / 1000)}k`;
    return `$${val}`;
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>
        <span>{formatAmount(minVal)}</span>
        <span>{formatAmount(maxVal)}</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={5000}
          value={minVal}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), maxVal - 5000);
            setMinVal(v);
            setMinSalary(v);
          }}
          style={{ flex: 1, accentColor: 'var(--color-primary)' }}
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={5000}
          value={maxVal}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), minVal + 5000);
            setMaxVal(v);
            setMaxSalary(v);
          }}
          style={{ flex: 1, accentColor: 'var(--color-primary)' }}
        />
      </div>
    </div>
  );
}
