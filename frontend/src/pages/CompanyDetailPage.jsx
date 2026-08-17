import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Globe, Users, Briefcase, Heart, CheckCircle2, ArrowLeft } from 'lucide-react';
import { companiesApi } from '../api/client.js';
import CompanyJobs from '../components/companies/CompanyJobs.jsx';
import CompanyReviewsTab from '../components/companies/CompanyReviewsTab.jsx';
import { Button, Badge, Spinner, Tabs } from '../components/ui';

/**
 * Company detail page component showing company profile, stats, follower count, and open roles.
 */
export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'jobs' | 'reviews'

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'jobs', label: `Jobs (${company?.activeJobCount || 0})` },
    { id: 'reviews', label: 'Reviews & Ratings' }
  ];

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    companiesApi
      .getDetail(companyId)
      .then((res) => {
        if (res.success && res.data) {
          setCompany(res.data.company);
        }
      })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [companyId]);

  const handleToggleFollow = async () => {
    if (!company) return;
    setFollowLoading(true);
    try {
      if (company.isFollowing) {
        const res = await companiesApi.unfollow(company._id);
        if (res.success) {
          setCompany((prev) => ({ ...prev, isFollowing: false, followerCount: res.data.followerCount }));
        }
      } else {
        const res = await companiesApi.follow(company._id);
        if (res.success) {
          setCompany((prev) => ({ ...prev, isFollowing: true, followerCount: res.data.followerCount }));
        }
      }
    } catch (err) {
      alert(err.message || 'Please log in to follow companies');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!company) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <h2>Company Not Found</h2>
        <Button onClick={() => navigate('/companies')} style={{ marginTop: '16px' }}>
          Back to Companies Directory
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate('/companies')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-primary)',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '32px',
          marginBottom: '28px',
          animation: 'scaleUp 0.4s ease both',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {company.logo ? (
              <img
                src={company.logo}
                alt=""
                style={{ width: '72px', height: '72px', borderRadius: '16px', objectFit: 'contain', border: '1px solid var(--color-border)', padding: '4px' }}
              />
            ) : (
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '16px',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={36} />
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--color-text-main)' }}>
                  {company.name}
                </h1>
                {company.isVerified && (
                  <Badge variant="verified" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> Verified
                  </Badge>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                <span>{company.industry}</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> {company.size} employees
                </span>
                {company.locations && company.locations.length > 0 && (
                  <>
                    <span>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {company.locations.join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <Button
            variant={company.isFollowing ? 'secondary' : 'primary'}
            icon={<Heart size={16} fill={company.isFollowing ? 'currentColor' : 'none'} />}
            onClick={handleToggleFollow}
            disabled={followLoading}
          >
            {company.isFollowing ? 'Following' : 'Follow Company'} ({company.followerCount || 0})
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: '24px' }} />

      {/* Overview Tab */}
      <Tabs.Panel id="overview" activeTab={activeTab}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Main Description */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)' }}>
              About {company.name}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', color: 'var(--color-text-main)', whiteSpace: 'pre-line' }}>
              {company.description}
            </p>
          </div>

          {/* Sidebar Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                Company Highlights
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                {company.website && (
                  <div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Website</div>
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                    >
                      <Globe size={14} /> {company.website}
                    </a>
                  </div>
                )}

                {company.foundedYear && (
                  <div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Founded</div>
                    <div style={{ fontWeight: '600', color: 'var(--color-text-main)', marginTop: '2px' }}>{company.foundedYear}</div>
                  </div>
                )}

                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Active Openings</div>
                  <div style={{ fontWeight: '700', color: 'var(--color-primary)', marginTop: '2px' }}>
                    {company.activeJobCount || 0} jobs
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Followers</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text-main)', marginTop: '2px' }}>
                    {company.followerCount || 0} candidates
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tabs.Panel>

      {/* Jobs Tab */}
      <Tabs.Panel id="jobs" activeTab={activeTab}>
        <CompanyJobs companyId={company._id} />
      </Tabs.Panel>

      {/* Reviews Tab */}
      <Tabs.Panel id="reviews" activeTab={activeTab}>
        <CompanyReviewsTab companyId={company._id} />
      </Tabs.Panel>
    </div>
  );
}
