import { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { Button } from '../ui';
import { exportApi } from '../../api/client.js';

export default function ExportButton({ type = 'applications', filters = {} }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCSV = () => {
    let url = '';
    if (type === 'applications') {
      url = exportApi.applicationsCSV(filters);
    } else if (type === 'analytics') {
      url = exportApi.analyticsCSV();
    }

    if (url) {
      window.open(url, '_blank');
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <Download size={14} /> Export Data
      </Button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: '4px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          padding: '6px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          zIndex: 100,
          minWidth: '160px'
        }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              color: 'var(--color-text)',
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '6px',
              textAlign: 'left'
            }}
            className="dropdown-item-hover"
          >
            <Table size={14} /> Export as CSV
          </button>
        </div>
      )}
    </div>
  );
}
