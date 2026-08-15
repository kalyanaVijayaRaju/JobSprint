import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { talentPoolApi } from '../api/client.js';
import { Search, Filter, MapPin, Briefcase, Award, GraduationCap, X, ChevronDown } from 'lucide-react';
import { Button, Badge, Spinner, EmptyState, Pagination } from '../components/ui';

export default function TalentPoolPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [degree, setDegree] = useState('');

  const fetchCandidates = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (skills.length > 0) params.skills = skills.join(',');
      if (location) params.location = location;
      if (minExperience) params.minExperience = minExperience;
      if (degree) params.degree = degree;

      const res = await talentPoolApi.search(params);
      if (res?.success) {
        setCandidates(res.data.candidates || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [search, skills, location, minExperience, degree]);

  useEffect(() => {
    fetchCandidates(1);
  }, [fetchCandidates]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const clearFilters = () => {
    setSearch('');
    setSkills([]);
    setLocation('');
    setMinExperience('');
    setDegree('');
  };

  return (
    <div className="talent-pool-page">
      <div className="talent-pool-header">
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800 }}>
            <Search size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Talent Pool
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Search and discover qualified candidates for your job openings
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Badge>{pagination.total} candidate{pagination.total !== 1 ? 's' : ''}</Badge>
          <Button
            variant="outline"
            icon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="talent-pool-filters">
          <div className="talent-pool-filter-row">
            <div className="talent-pool-filter-group" style={{ flex: 2 }}>
              <label>Search</label>
              <div className="talent-pool-search-wrap">
                <Search size={16} className="talent-pool-search-icon" />
                <input
                  type="text"
                  placeholder="Name, summary..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="talent-pool-search-input"
                />
              </div>
            </div>
            <div className="talent-pool-filter-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="City, state..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="talent-pool-input"
              />
            </div>
            <div className="talent-pool-filter-group">
              <label>Min Experience (yrs)</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                className="talent-pool-input"
              />
            </div>
            <div className="talent-pool-filter-group">
              <label>Degree</label>
              <input
                type="text"
                placeholder="B.Tech, M.Sc..."
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="talent-pool-input"
              />
            </div>
          </div>

          <div className="talent-pool-filter-row">
            <div className="talent-pool-filter-group" style={{ flex: 1 }}>
              <label>Skills</label>
              <div className="talent-pool-skill-input-wrap">
                <input
                  type="text"
                  placeholder="Add skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="talent-pool-input"
                />
                <Button size="sm" onClick={addSkill}>Add</Button>
              </div>
              {skills.length > 0 && (
                <div className="talent-pool-skill-tags">
                  {skills.map((s) => (
                    <Badge key={s} className="talent-pool-skill-tag">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="talent-pool-skill-remove">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button variant="outline" onClick={clearFilters} size="sm">Clear All</Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Spinner size="lg" label="Searching candidates..." />
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={<Search size={40} />}
          title="No candidates found"
          description="Try adjusting your search filters to find more candidates."
        />
      ) : (
        <>
          <div className="talent-pool-results">
            {candidates.map((c) => (
              <div key={c._id || c.userId} className="talent-card">
                <div className="talent-card-header">
                  <div className="talent-card-avatar">
                    {(c.firstName || 'U')[0]}{(c.lastName || '')[0]}
                  </div>
                  <div className="talent-card-info">
                    <h3 className="talent-card-name">{c.firstName} {c.lastName}</h3>
                    <span className="talent-card-email">{c.userEmail}</span>
                  </div>
                  {c.skillMatchScore > 0 && (
                    <div className="talent-card-match">
                      <span className="talent-card-match-score">{c.skillMatchScore}%</span>
                      <span className="talent-card-match-label">Match</span>
                    </div>
                  )}
                </div>

                {c.summary && (
                  <p className="talent-card-summary">{c.summary.substring(0, 150)}{c.summary.length > 150 ? '...' : ''}</p>
                )}

                <div className="talent-card-meta">
                  {c.experienceYears > 0 && (
                    <span className="talent-card-meta-item">
                      <Briefcase size={14} /> {c.experienceYears} yr{c.experienceYears !== 1 ? 's' : ''} exp
                    </span>
                  )}
                  {c.badgesCount > 0 && (
                    <span className="talent-card-meta-item">
                      <Award size={14} /> {c.badgesCount} badge{c.badgesCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {c.applicationCount > 0 && (
                    <span className="talent-card-meta-item">
                      {c.applicationCount} application{c.applicationCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {c.skills && c.skills.length > 0 && (
                  <div className="talent-card-skills">
                    {c.skills.slice(0, 8).map((skill) => (
                      <Badge key={skill} className="talent-card-skill-badge">{skill}</Badge>
                    ))}
                    {c.skills.length > 8 && (
                      <Badge className="talent-card-skill-badge">+{c.skills.length - 8}</Badge>
                    )}
                  </div>
                )}

                {c.badges && c.badges.length > 0 && (
                  <div className="talent-card-badges">
                    {c.badges.map((b, i) => (
                      <span key={i} className="talent-card-badge-icon" title={b.skill}>
                        {b.icon || '🏆'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => fetchCandidates(p)}
            />
          )}
        </>
      )}
    </div>
  );
}
