import { useState, useMemo } from 'react';

const GRADIENT_COLORS = [
  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #ec4899, #be185d)',
  'linear-gradient(135deg, #10b981, #047857)',
  'linear-gradient(135deg, #f59e0b, #b45309)',
  'linear-gradient(135deg, #06b6d4, #0e7490)',
];

function getGradientForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_COLORS.length;
  return GRADIENT_COLORS[index];
}

/**
 * Resolves a reliable CDN logo URL for a company.
 * Converts deprecated Clearbit URLs to Unavatar / Google Favicon CDN URLs.
 */
function resolveRealLogoUrl(logo, name = '') {
  if (logo && typeof logo === 'string' && logo.trim()) {
    let url = logo.trim();
    if (url.includes('logo.clearbit.com')) {
      const domain = url.split('logo.clearbit.com/')[1] || '';
      return `https://unavatar.io/${domain}?fallback=https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
    return url;
  }

  // Fallback to unavatar.io by company name/domain
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://unavatar.io/${cleanName}.com?fallback=https://www.google.com/s2/favicons?domain=${cleanName}.com&sz=128`;
}

/**
 * CompanyLogo component — renders high-resolution real company logos with multi-tier CDN resolution.
 */
export default function CompanyLogo({ logo, name = 'Company', size = 48, className = '' }) {
  const [retryStage, setRetryStage] = useState(0);

  const realLogoUrl = useMemo(() => {
    const primary = resolveRealLogoUrl(logo, name);

    if (retryStage === 1) {
      // Secondary fallback: Google high-res favicon CDN
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return `https://www.google.com/s2/favicons?domain=${cleanName}.com&sz=128`;
    }

    return primary;
  }, [logo, name, retryStage]);

  const initial = name ? name.trim()[0].toUpperCase() : 'C';
  const gradient = getGradientForName(name);

  if (retryStage < 2) {
    return (
      <img
        src={realLogoUrl}
        alt={name}
        onError={() => setRetryStage((prev) => prev + 1)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size / 4)}px`,
          objectFit: 'contain',
          background: '#ffffff',
          padding: '4px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          flexShrink: 0,
        }}
        className={className}
      />
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size / 4)}px`,
        background: gradient,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '800',
        fontSize: `${Math.round(size * 0.42)}px`,
        boxShadow: 'var(--shadow-sm)',
        flexShrink: 0,
        letterSpacing: '-0.5px',
      }}
      title={name}
      className={className}
    >
      {initial}
    </div>
  );
}
