import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Activity, BriefcaseBusiness, User, Building2, MessageSquare, Award, Settings, Bookmark, Clock } from 'lucide-react';

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: Activity, path: '/dashboard', keywords: 'overview home' },
  { id: 'jobs', label: 'Find Jobs', icon: BriefcaseBusiness, path: '/jobs', keywords: 'search careers positions' },
  { id: 'applications', label: 'My Applications', icon: Clock, path: '/applications', keywords: 'applied tracker pipeline' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages', keywords: 'chat dm inbox' },
  { id: 'assessments', label: 'Skill Assessments', icon: Award, path: '/assessments', keywords: 'quiz test badge skills' },
  { id: 'companies', label: 'Company Directory', icon: Building2, path: '/companies', keywords: 'employers organizations' },
  { id: 'saved', label: 'Saved Jobs', icon: Bookmark, path: '/saved-jobs', keywords: 'bookmarked favorites' },
  { id: 'profile', label: 'Profile Settings', icon: User, path: '/profile', keywords: 'account edit resume' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', keywords: 'preferences notifications privacy theme' },
];

/**
 * CommandPalette — global ⌘K / Ctrl+K overlay with fuzzy search.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter commands
  const filtered = COMMANDS.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords.toLowerCase().includes(q) ||
      cmd.id.includes(q)
    );
  });

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleSelect = useCallback((cmd) => {
    setOpen(false);
    navigate(cmd.path);
  }, [navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      handleSelect(filtered[selectedIdx]);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="cmd-backdrop" onClick={() => setOpen(false)} />
      <div className="cmd-palette" role="dialog" aria-label="Command palette">
        <div className="cmd-input-wrap">
          <Search size={18} className="cmd-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <kbd className="cmd-kbd">ESC</kbd>
        </div>
        <div className="cmd-list">
          {filtered.length === 0 ? (
            <div className="cmd-empty">No matching commands</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  className={`cmd-item ${idx === selectedIdx ? 'selected' : ''}`}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                >
                  <Icon size={18} className="cmd-item-icon" />
                  <span className="cmd-item-label">{cmd.label}</span>
                  <ArrowRight size={14} className="cmd-item-arrow" />
                </button>
              );
            })
          )}
        </div>
        <div className="cmd-footer">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </>
  );
}
