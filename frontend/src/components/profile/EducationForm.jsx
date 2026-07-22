import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Button, EmptyState } from '../ui';

/**
 * Education history form tab.
 */
export default function EducationForm({
  educations = [],
  onAdd,
  onUpdate,
  onRemove,
  formatDateValue,
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontWeight: '700' }}>Education History</h3>
        <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
          Add Education
        </Button>
      </div>

      {educations.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={32} />}
          title="No education history"
          description="No education history added yet."
          action={
            <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
              Add Education
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {educations.map((edu, index) => (
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
                aria-label="Remove Education"
              >
                <Trash2 size={16} />
              </button>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label>Institution</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={edu.institution}
                  onChange={(e) => onUpdate(index, 'institution', e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Degree</label>
                  <input
                    type="text"
                    placeholder="e.g. Bachelor of Science"
                    value={edu.degree}
                    onChange={(e) => onUpdate(index, 'degree', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Field of Study</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={edu.fieldOfStudy}
                    onChange={(e) => onUpdate(index, 'fieldOfStudy', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formatDateValue(edu.startDate)}
                    onChange={(e) => onUpdate(index, 'startDate', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date (or Expected)</label>
                  <input
                    type="date"
                    value={formatDateValue(edu.endDate)}
                    onChange={(e) => onUpdate(index, 'endDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
