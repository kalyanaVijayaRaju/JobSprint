import { useState } from 'react';
import { Download, Eye, FileText, Sparkles } from 'lucide-react';
import ResumePreview from './ResumePreview.jsx';
import { Button } from '../ui';

/**
 * Interactive Resume Builder component with live preview and browser-native PDF export.
 */
export default function ResumeBuilder({ profile, onSaveProfile }) {
  const [showPreview, setShowPreview] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)' }}>
            Interactive Resume Builder
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Generated directly from your professional profile. Print or save as PDF.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            icon={<Eye size={16} />}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            variant="primary"
            icon={<Download size={16} />}
            onClick={handlePrint}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <ResumePreview profile={profile} />
      </div>
    </div>
  );
}
