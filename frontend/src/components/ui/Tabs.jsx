/**
 * Reusable Tabs component with accessible tab navigation.
 *
 * @param {{ id: string, label: string, icon?: import('react').ReactNode }[]} tabs
 * @param {string} activeTab - Current active tab id
 * @param {function} onChange - Called with tab id
 */
export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`tabs-nav ${className}`.trim()} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className="tab-icon" aria-hidden="true">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Tab panel wrapper — renders children only when active.
 *
 * @param {string} id - Tab id
 * @param {string} activeTab - Currently active tab id
 */
Tabs.Panel = function TabPanel({ id, activeTab, children, className = '' }) {
  if (activeTab !== id) return null;

  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-labelledby={id}
      className={`tab-panel ${className}`.trim()}
    >
      {children}
    </div>
  );
};
