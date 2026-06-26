import { useEffect, useState } from 'react';
import { Activity, BriefcaseBusiness, CheckCircle2, CircleAlert, UsersRound } from 'lucide-react';
import { getReadiness } from './api/client.js';
import './styles.css';

const summaryItems = [
  {
    label: 'Open roles',
    value: '0',
    detail: 'Job publishing comes next',
    icon: BriefcaseBusiness
  },
  {
    label: 'Candidates',
    value: '0',
    detail: 'Profile APIs pending',
    icon: UsersRound
  },
  {
    label: 'API status',
    value: 'Live',
    detail: 'Health endpoint connected',
    icon: Activity
  }
];

function App() {
  const [readiness, setReadiness] = useState({
    loading: true,
    ok: false,
    status: 'CHECKING',
    timestamp: null
  });

  useEffect(() => {
    let active = true;

    getReadiness()
      .then((result) => {
        if (active) {
          setReadiness({ loading: false, ...result });
        }
      })
      .catch(() => {
        if (active) {
          setReadiness({
            loading: false,
            ok: false,
            status: 'OFFLINE',
            timestamp: null
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const StatusIcon = readiness.ok ? CheckCircle2 : CircleAlert;

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">JS</span>
          <span>JobSprint</span>
        </div>
        <nav className="nav-list">
          <a className="nav-link active" href="#overview">Overview</a>
          <a className="nav-link" href="#jobs">Jobs</a>
          <a className="nav-link" href="#candidates">Candidates</a>
          <a className="nav-link" href="#settings">Settings</a>
        </nav>
      </aside>

      <section className="workspace" id="overview">
        <header className="topbar">
          <div>
            <p className="eyebrow">Recruiting workspace</p>
            <h1>Operations dashboard</h1>
          </div>
          <div className={`status-pill ${readiness.ok ? 'ready' : 'not-ready'}`}>
            <StatusIcon size={18} aria-hidden="true" />
            <span>{readiness.loading ? 'Checking API' : readiness.status}</span>
          </div>
        </header>

        <section className="summary-grid" aria-label="Workspace summary">
          {summaryItems.map((item) => {
            const Icon = item.icon;

            return (
              <article className="metric-card" key={item.label}>
                <div className="metric-icon">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <span>{item.detail}</span>
              </article>
            );
          })}
        </section>

        <section className="panel">
          <div>
            <p className="eyebrow">Today</p>
            <h2>Frontend foundation connected to backend health</h2>
            <p>
              The app shell is ready for the next backend modules, and the frontend is already
              reading the API readiness probe used by deployment checks.
            </p>
          </div>
          <dl className="readiness-list">
            <div>
              <dt>Endpoint</dt>
              <dd>/health/ready</dd>
            </div>
            <div>
              <dt>Last response</dt>
              <dd>{readiness.timestamp || 'Not available'}</dd>
            </div>
          </dl>
        </section>
      </section>
    </main>
  );
}

export default App;
