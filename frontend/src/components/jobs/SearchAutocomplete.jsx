import { useState, useEffect, useRef } from 'react';
import { Search, X, Briefcase, Code } from 'lucide-react';
import { jobsApi } from '../../api/client.js';

/**
 * Debounced search input with live autocomplete dropdown suggestions.
 */
export default function SearchAutocomplete({ value, onChange, onSelectSuggestion, placeholder = 'Title, skill, or keyword...' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      jobsApi
        .autocomplete(value.trim())
        .then((res) => {
          if (res.success && res.data) {
            setSuggestions(res.data.suggestions || []);
            setIsOpen(res.data.suggestions?.length > 0);
          }
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div className="search-input" style={{ position: 'relative' }}>
        <Search size={16} />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          style={{ width: '100%' }}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '6px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(item.text);
                if (onSelectSuggestion) onSelectSuggestion(item.text);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--color-text-main)',
                transition: 'background 0.15s ease',
              }}
              className="dropdown-item-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {item.type === 'skill' ? (
                  <Code size={14} style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <Briefcase size={14} style={{ color: 'var(--color-accent)' }} />
                )}
                <span>{item.text}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                {item.type} {item.count ? `(${item.count})` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
