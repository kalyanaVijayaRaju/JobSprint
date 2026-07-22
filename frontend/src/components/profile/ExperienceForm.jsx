import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { Button, EmptyState } from '../ui';

/**
 * Work experience history form tab.
 */
export default function ExperienceForm({
  experiences = [],
  onAdd,
  onUpdate,
  onRemove,
  formatDateValue,
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontWeight: '700' }}>Work History</h3>
        <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
          Add Work Experience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={32} />}
          title="No work history"
          description="No work history added yet."
          action={
            <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
              Add Work Experience
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {experiences.map((exp, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                background: 'var(--color-bg)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => onRemove(index)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-error)',
                  cursor: 'pointer',
                }}
                aria-label="Remove Experience"
              >
                <Trash2 size={16} />
              </button>

              <div className="form-row-2" style={{ marginTop: '8px' }}>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={exp.company}
                    onChange={(e) => onUpdate(index, 'company', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={exp.position}
                    onChange={(e) => onUpdate(index, 'position', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formatDateValue(exp.startDate)}
                    onChange={(e) => onUpdate(index, 'startDate', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formatDateValue(exp.endDate)}
                    onChange={(e) => onUpdate(index, 'endDate', e.target.value)}
                    disabled={exp.current}
                    required={!exp.current}
                  />
                </div>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id={`current-${index}`}
                  checked={exp.current || false}
                  onChange={(e) => onUpdate(index, 'current', e.target.checked)}
                />
                <label htmlFor={`current-${index}`} style={{ margin: 0, cursor: 'pointer' }}>
                  I currently work here
                </label>
              </div>

              <div className="form-group">
                <label>Responsibilities & Achievements</label>
                <textarea
                  rows={3}
                  placeholder="Describe your role and impact..."
                  value={exp.description || ''}
                  onChange={(e) => onUpdate(index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
