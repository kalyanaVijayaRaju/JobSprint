import { useEffect, useState } from 'react';
import {
  Building2, Plus, Search, Globe, MapPin, Users, Calendar,
  ExternalLink, Edit3, Trash2, X, Loader2, Briefcase
} from 'lucide-react';
import { companiesApi } from '../api/client.js';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

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
    name: '', description: '', industry: '', size: '1-10',
    website: '', logo: '', foundedYear: '', locations: ''
  });

  const isRecruiter = user.role === 'recruiter' || user.role === 'admin';

  const fetchCompanies = (page = 1) => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (searchQuery.trim()) params.search = searchQuery.trim();

    companiesApi.list(params)
      .then((res) => {
        if (res.success && res.data) {
          setCompanies(res.data.companies);
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => triggerAlert(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCompanies(1); }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies(1);
  };

  const resetForm = () => {
    setCompanyForm({
      name: '', description: '', industry: '', size: '1-10',
      website: '', logo: '', foundedYear: '', locations: ''
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
      locations: company.locations ? company.locations.join(', ') : ''
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
      locations: companyForm.locations.split(',').map(l => l.trim()).filter(Boolean)
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
    if (!confirm('Are you sure you want to delete this company?')) return;
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
      <div className="company-header-bar">
        <form onSubmit={handleSearchSubmit} className="company-search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search companies by name or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn"><Search size={14} /></button>
          </div>
        </form>

        {isRecruiter && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => { resetForm(); setShowForm(true); }}
          >
            <Plus size={16} /> Register Company
          </button>
        )}
      </div>

      {/* Company Grid */}
      {loading && companies.length === 0 ? (
        <div className="table-loader-wrapper">
          <div className="loader-spinner"></div>
          <p>Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="empty-state-panel">
          <Building2 size={40} className="empty-icon text-muted" />
          <p className="empty-title">No companies found</p>
          <p className="empty-subtitle">
            {isRecruiter ? 'Register your company to get started.' : 'Companies will appear here once recruiters register them.'}
          </p>
        </div>
      ) : (
        <>
          <div className="company-grid">
            {companies.map((company) => (
              <article
                key={company._id}
                className={`company-card ${selectedCompany?._id === company._id ? 'selected' : ''}`}
                onClick={() => setSelectedCompany(selectedCompany?._id === company._id ? null : company)}
              >
                <div className="company-card-header">
                  <div className="company-avatar">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} />
                    ) : (
                      <Building2 size={24} />
                    )}
                  </div>
                  <div className="company-card-title">
                    <h3>{company.name}</h3>
                    <span className="company-industry-tag">{company.industry}</span>
                  </div>
                  {company.isVerified && (
                    <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '9px' }}>Verified</span>
                  )}
                </div>

                <p className="company-description-preview">
                  {company.description?.substring(0, 120)}{company.description?.length > 120 ? '...' : ''}
                </p>

                <div className="company-meta-row">
                  <span><MapPin size={13} /> {company.locations?.join(', ') || 'N/A'}</span>
                  <span><Users size={13} /> {company.size}</span>
                  {company.foundedYear && <span><Calendar size={13} /> Est. {company.foundedYear}</span>}
                </div>

                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="company-website-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe size={13} /> Visit website <ExternalLink size={11} />
                  </a>
                )}

                {isRecruiter && (
                  <div className="company-card-actions">
                    <button type="button" className="btn btn-xs btn-outline" onClick={(e) => { e.stopPropagation(); openEditForm(company); }}>
                      <Edit3 size={12} /> Edit
                    </button>
                    <button type="button" className="btn btn-xs btn-outline border-error-btn" onClick={(e) => { e.stopPropagation(); handleDeleteCompany(company._id); }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination-bar" style={{ marginTop: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchCompanies(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={pagination.page >= pagination.pages || loading}
                onClick={() => fetchCompanies(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Expanded Company Detail */}
      {selectedCompany && (
        <div className="company-detail-panel">
          <div className="panel-header-actions">
            <h3>
              <Building2 size={20} /> {selectedCompany.name}
            </h3>
            <button type="button" className="btn btn-icon btn-outline" onClick={() => setSelectedCompany(null)}>
              <X size={16} />
            </button>
          </div>
          <p>{selectedCompany.description}</p>
          <dl className="company-detail-dl">
            <div><dt>Industry</dt><dd>{selectedCompany.industry}</dd></div>
            <div><dt>Company Size</dt><dd>{selectedCompany.size} employees</dd></div>
            <div><dt>Locations</dt><dd>{selectedCompany.locations?.join(', ') || 'Not specified'}</dd></div>
            {selectedCompany.foundedYear && <div><dt>Founded</dt><dd>{selectedCompany.foundedYear}</dd></div>}
            {selectedCompany.website && (
              <div>
                <dt>Website</dt>
                <dd><a href={selectedCompany.website} target="_blank" rel="noreferrer">{selectedCompany.website} <ExternalLink size={11} /></a></dd>
              </div>
            )}
            <div><dt>Company ID</dt><dd style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedCompany._id}</dd></div>
          </dl>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <Building2 size={22} className="text-success" />
              <h3>{editingCompany ? 'Update Company' : 'Register New Company'}</h3>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="company-name">Company Name *</label>
                  <input
                    id="company-name"
                    type="text"
                    placeholder="Acme Corp"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, industry: e.target.value }))}
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
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="company-size">Company Size *</label>
                  <select
                    id="company-size"
                    value={companyForm.size}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, size: e.target.value }))}
                  >
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
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
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, foundedYear: e.target.value }))}
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
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, locations: e.target.value }))}
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
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company-logo">Logo URL</label>
                  <input
                    id="company-logo"
                    type="url"
                    placeholder="https://acme.com/logo.png"
                    value={companyForm.logo}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, logo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={resetForm} disabled={formSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? (
                    <><Loader2 size={14} className="spinner-icon" /> Saving...</>
                  ) : (
                    editingCompany ? 'Update Company' : 'Create Company'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
