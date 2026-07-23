import { Building2, Globe, MapPin, Users, Calendar, Edit3, Trash2 } from 'lucide-react';
import { Badge, Button, Card, CompanyLogo } from '../ui';

/**
 * Single company directory card component.
 */
export default function CompanyCard({
  company,
  isRecruiter,
  onSelect,
  onEdit,
  onDelete,
}) {
  return (
    <Card
      variant="elevated"
      onClick={() => onSelect(company)}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <CompanyLogo logo={company.logo} name={company.name} size={48} />

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{company.name}</h3>
          {company.industry && (
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {company.industry}
            </span>
          )}
        </div>

        {isRecruiter && (
          <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit3 size={14} />}
              onClick={() => onEdit(company)}
              aria-label="Edit company"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={14} />}
              style={{ color: 'var(--color-error)' }}
              onClick={() => onDelete(company._id)}
              aria-label="Delete company"
            />
          </div>
        )}
      </div>

      {company.description && (
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {company.description}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          flexWrap: 'wrap',
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {company.size && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Users size={14} /> {company.size} employees
          </span>
        )}

        {company.locations?.length > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} /> {company.locations[0]}
          </span>
        )}

        {company.foundedYear && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} /> Founded {company.foundedYear}
          </span>
        )}
      </div>
    </Card>
  );
}
