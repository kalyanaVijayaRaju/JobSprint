import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Building2,
  Search,
  MapPin,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Rocket,
  Globe,
  Code,
  Palette,
  LineChart,
  Megaphone,
  Wrench,
  HeartPulse,
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import './LandingPage.css';

function AnimatedCounter({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = Date.now();
          const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const CATEGORIES = [
  { icon: Code, label: 'Engineering', count: '2,400+' },
  { icon: Palette, label: 'Design', count: '890+' },
  { icon: LineChart, label: 'Finance', count: '1,200+' },
  { icon: Megaphone, label: 'Marketing', count: '760+' },
  { icon: Wrench, label: 'Operations', count: '540+' },
  { icon: HeartPulse, label: 'Healthcare', count: '980+' },
  { icon: GraduationCap, label: 'Education', count: '430+' },
  { icon: Globe, label: 'Remote', count: '3,100+' }
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const searchParams = new URLSearchParams();
  if (searchQuery.trim()) searchParams.set('search', searchQuery.trim());
  if (searchLocation.trim()) searchParams.set('location', searchLocation.trim());
  const jobsSearchUrl = `/jobs${searchParams.size ? `?${searchParams}` : ''}`;

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="brand">
            <span className="brand-mark">JS</span>
            <span className="brand-name">JobSprint</span>
          </div>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost">Sign In</Link>
            <Link to="/register" className="btn btn-primary landing-cta-btn">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            <span>Accelerate Your Career</span>
          </div>
          <h1>
            Find Your Next
            <span className="hero-gradient-text"> Dream Role</span>
            <br />In Record Time
          </h1>
          <p className="hero-subtitle">
            One-click applications, visual ATS pipelines, and real-time hiring updates.
            Join thousands of professionals sprinting toward their next opportunity.
          </p>

          {/* Glassmorphic Search Bar */}
          <div className="hero-search-bar">
            <div className="search-field">
              <Search size={18} />
              <input
                type="text"
                placeholder="Job title, skill, or keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="search-divider"></div>
            <div className="search-field">
              <MapPin size={18} />
              <input
                type="text"
                placeholder="City or remote"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <Link
              to={jobsSearchUrl}
              className="btn btn-primary search-btn"
            >
              <Search size={18} />
              Search Jobs
            </Link>
          </div>

          <div className="hero-tags">
            <span>Trending:</span>
            <button type="button" className="hero-tag">React Developer</button>
            <button type="button" className="hero-tag">Product Manager</button>
            <button type="button" className="hero-tag">Data Engineer</button>
            <button type="button" className="hero-tag">UX Designer</button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Briefcase size={24} />
            </div>
            <div className="stat-value"><AnimatedCounter target={12500} suffix="+" /></div>
            <div className="stat-label">Active Job Listings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-value"><AnimatedCounter target={48000} suffix="+" /></div>
            <div className="stat-label">Registered Candidates</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Building2 size={24} />
            </div>
            <div className="stat-value"><AnimatedCounter target={3200} suffix="+" /></div>
            <div className="stat-label">Partner Companies</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Rocket size={24} />
            </div>
            <div className="stat-value"><AnimatedCounter target={92} suffix="%" /></div>
            <div className="stat-label">Placement Rate</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="landing-categories">
        <div className="section-container">
          <div className="section-header-center">
            <h2>Explore Trending Categories</h2>
            <p>Discover opportunities across the fastest-growing industries</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link to="/login" key={cat.label} className="category-card">
                <div className="category-icon">
                  <cat.icon size={24} />
                </div>
                <h3>{cat.label}</h3>
                <span className="category-count">{cat.count} roles</span>
                <ChevronRight size={16} className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how-it-works">
        <div className="section-container">
          <div className="section-header-center">
            <h2>How JobSprint Works</h2>
            <p>Three simple steps to your next career move</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon-wrap">
                <Shield size={28} />
              </div>
              <h3>Create Your Profile</h3>
              <p>Build a standout professional profile with your experience, skills, and resume. Our completeness meter guides you every step.</p>
            </div>
            <div className="step-connector">
              <ArrowRight size={24} />
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon-wrap">
                <Search size={28} />
              </div>
              <h3>Discover & Apply</h3>
              <p>Search thousands of curated roles with smart filters. Apply with one click using your saved profile — no more repetitive forms.</p>
            </div>
            <div className="step-connector">
              <ArrowRight size={24} />
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon-wrap">
                <BarChart3 size={28} />
              </div>
              <h3>Track Progress</h3>
              <p>Monitor every application in real time with our visual pipeline tracker. Get instant notifications when your status changes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="cta-container">
          <div className="cta-bg-effects">
            <div className="cta-orb cta-orb-1"></div>
            <div className="cta-orb cta-orb-2"></div>
          </div>
          <div className="cta-content">
            <h2>Ready to Sprint Toward Your Future?</h2>
            <p>Join the platform that's redefining how talent meets opportunity.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                <Rocket size={18} />
                Start as Candidate
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg cta-recruiter-btn">
                <Building2 size={18} />
                I'm a Recruiter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-mark">JS</span>
            <span>JobSprint</span>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} JobSprint. Built for the future of hiring.</p>
        </div>
      </footer>
    </div>
  );
}
