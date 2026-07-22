import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';

/**
 * 404 Page Not Found component.
 */
export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 16px',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <Compass size={44} />
      </div>

      <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 12px' }}>404</h1>
      <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px' }}>Page Not Found</h2>
      <p
        style={{
          maxWidth: '420px',
          color: 'var(--color-text-secondary)',
          fontSize: '15px',
          lineHeight: '1.6',
          margin: '0 0 32px',
        }}
      >
        The page you are looking for doesn't exist or has been moved. Check the URL or return to the main dashboard.
      </p>

      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button variant="primary" icon={<ArrowLeft size={16} />}>
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
