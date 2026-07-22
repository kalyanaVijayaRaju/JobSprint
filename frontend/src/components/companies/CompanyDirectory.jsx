import { useEffect, useState } from 'react';
import { Building2, Plus, Search, Globe, MapPin, Users, Calendar, ExternalLink, X } from 'lucide-react';
import { companiesApi } from '../../api/client.js';
import CompanyCard from './CompanyCard.jsx';
import { Button, Modal, Spinner, EmptyState, Pagination } from '../ui';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

/**
 * Main CompanyDirectory component — lists tech companies with registration and edit modals.
 */
export default function CompanyDirectory({ user, triggerAlert }) {
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Create / Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    industry: '',
    size: '1-10',
    website: '',
    logo: '',
    foundedYear: '',
    locations: '',
  });

  const isRecruiter = user.role === 'recruiter' || user.role === 'admin';

  const fetchCompanies = (page = 1) => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (searchQuery.trim()) params.search = searchQuery.trim();

    companiesApi
      .list(params)
      .then((res) => {
        if (res.success && res.data) {
          setCompanies(res.data.companies);
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => triggerAlert(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies(1);
  };

  const resetForm = () => {
    setCompanyForm({
      name: '',
      description: '',
      industry: '',
      size: '1-10',
      website: '',
      logo: '',
      foundedYear: '',
      locations: '',
    });
    setEditingCompany(null);
    setShowForm(false);
  };

  const openEditForm = (company) => {
    setCompanyForm({
      name: company.name || '',
      description: company.description || '',
      industry: company.industry || '',
      size: company.size || '1-10',
      website: company.website || '',
      logo: company.logo || '',
      foundedYear: company.foundedYear || '',
      locations: company.locations ? company.locations.join(', ') : '',
    });
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    const data = {
      name: companyForm.name,
      description: companyForm.description,
      industry: companyForm.industry,
      size: companyForm.size,
      website: companyForm.website || undefined,
      logo: companyForm.logo || undefined,
      foundedYear: companyForm.foundedYear ? Number(companyForm.foundedYear) : undefined,
      locations: companyForm.locations
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
    };

    try {
      if (editingCompany) {
        await companiesApi.update(editingCompany._id, data);
        triggerAlert('Company updated successfully');
      } else {
        await companiesApi.create(data);
        triggerAlert('Company created successfully');
      }
      resetForm();
      fetchCompanies(pagination.page);
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await companiesApi.delete(id);
      triggerAlert('Company deleted successfully');
      if (selectedCompany?._id === id) setSelectedCompany(null);
      fetchCompanies(pagination.page);
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  return (
    <div className="tab-content">
      {/* Header Actions */}
      <div
        className="company-header-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearchSubmit} className="company-search-form" style={{ flex: 1, minWidth: '240px' }}>
          <div className="search-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search companies by name or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {isRecruiter && (
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            Register Company
          </Button>
        )}
      </div>

      {/* Company Grid */}
      {loading && companies.length === 0 ? (
        <Spinner size="lg" label="Loading companies..." />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={<Building2 size={40} />}
          title="No companies found"
          description={
            isRecruiter
              ? 'Register your company to get started.'
              : 'Companies will appear here once recruiters register them.'
          }
          action={
            isRecruiter && (
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                Register Company
              </Button>
            )
          }
        />
      ) : (
        <>
          <div
            className="company-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {companies.map((company) => (
              <CompanyCard
                key={company._id}
                company={company}
                isRecruiter={isRecruiter}
                onSelect={(comp) =>
                  setSelectedCompany(selectedCompany?._id === comp._id ? null : comp)
                }
                onEdit={openEditForm}
                onDelete={handleDeleteCompany}
              />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            onPageChange={(page) => fetchCompanies(page)}
          />
        </>
      )}

      {/* Expanded Company Detail Panel */}
      {selectedCompany && (
        <div
          className="company-detail-panel"
          style={{
            marginTop: '32px',
            padding: '24px',
            background: 'var(--color-card)',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} /> {selectedCompany.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              icon={<X size={16} />}
              onClick={() => setSelectedCompany(null)}
            />
          </div>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            {selectedCompany.description}
          </p>
          <dl
            className="company-detail-dl"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <dt style={{ fontWeight: '700', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Industry
              </dt>
              <dd style={{ margin: '4px 0 0', fontWeight: '600' }}>{selectedCompany.industry}</dd>
            </div>
            <div>
              <dt style={{ fontWeight: '700', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Company Size
              </dt>
              <dd style={{ margin: '4px 0 0', fontWeight: '600' }}>
                {selectedCompany.size} employees
              </dd>
            </div>
            <div>
              <dt style={{ fontWeight: '700', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Locations
              </dt>
              <dd style={{ margin: '4px 0 0', fontWeight: '600' }}>
                {selectedCompany.locations?.join(', ') || 'Not specified'}
              </dd>
            </div>
            {selectedCompany.foundedYear && (
              <div>
                <dt
                  style={{ fontWeight: '700', fontSize: '12px', color: 'var(--color-text-muted)' }}
                >
                  Founded
                </dt>
                <dd style={{ margin: '4px 0 0', fontWeight: '600' }}>
                  {selectedCompany.foundedYear}
                </dd>
              </div>
            )}
            {selectedCompany.website && (
              <div>
                <dt
                  style={{ fontWeight: '700', fontSize: '12px', color: 'var(--color-text-muted)' }}
                >
                  Website
                </dt>
                <dd style={{ margin: '4px 0 0', fontWeight: '600' }}>
                  <a href={selectedCompany.website} target="_blank" rel="noreferrer">
                    {selectedCompany.website} <ExternalLink size={11} />
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt style={{ fontWeight: '700', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Company ID
              </dt>
              <dd style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: '12px' }}>
                {selectedCompany._id}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingCompany ? 'Update Company' : 'Register New Company'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="modal-form">
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="company-name">Company Name *</label>
              <input
                id="company-name"
                type="text"
                placeholder="Acme Corp"
                value={companyForm.name}
                onChange={(e) => setCompanyForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="company-industry">Industry *</label>
              <input
                id="company-industry"
                type="text"
                placeholder="Technology, Finance, Healthcare..."
                value={companyForm.industry}
                onChange={(e) => setCompanyForm((prev) => ({ ...prev, industry: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="company-description">Description *</label>
            <textarea
              id="company-description"
              rows={3}
              placeholder="Brief description of the company, mission, and culture..."
              value={companyForm.description}
              onChange={(e) => setCompanyForm((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="company-size">Company Size *</label>
              <select
                id="company-size"
                value={companyForm.size}
                onChange={(e) => setCompanyForm((prev) => ({ ...prev, size: e.target.value }))}
              >
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} employees
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="company-founded">Founded Year</label>
              <input
                id="company-founded"
                type="number"
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
                value={companyForm.foundedYear}
                onChange={(e) => setCompanyForm((prev) => ({ ...prev, foundedYear: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="company-locations">Locations * (comma-separated)</label>
            <input
              id="company-locations"
              type="text"
              placeholder="San Francisco, New York, Remote"
              value={companyForm.locations}
              onChange={(e) => setCompanyForm((prev) => ({ ...prev, locations: e.target.value }))}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="company-website">Website URL</label>
              <input
                id="company-website"
                type="url"
                placeholder="https://acme.com"
                value={companyForm.website}
                onChange={(e) => setCompanyForm((prev) => ({ ...prev, website: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="company-logo">Logo URL</label>
              <input
                id="company-logo"
                type="url"
                placeholder="https://acme.com/logo.png"
                value={companyForm.logo}
                onChange={(e) => setCompanyForm((prev) => ({ ...prev, logo: e.target.value }))}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '20px' }}>
            <Button variant="outline" onClick={resetForm} disabled={formSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formSubmitting}>
              {editingCompany ? 'Update Company' : 'Create Company'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
