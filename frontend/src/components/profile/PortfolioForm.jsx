/**
 * Portfolio and social links form tab.
 */
export default function PortfolioForm({
  portfolioLinks = {},
  onUpdatePortfolio,
}) {
  return (
    <div>
      <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>Portfolio & Social Links</h3>

      <div className="form-group">
        <label htmlFor="github-link">GitHub URL</label>
        <input
          id="github-link"
          type="url"
          placeholder="https://github.com/username"
          value={portfolioLinks.github || ''}
          onChange={(e) => onUpdatePortfolio('github', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="linkedin-link">LinkedIn Profile URL</label>
        <input
          id="linkedin-link"
          type="url"
          placeholder="https://linkedin.com/in/username"
          value={portfolioLinks.linkedin || ''}
          onChange={(e) => onUpdatePortfolio('linkedin', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="website-link">Personal Website URL</label>
        <input
          id="website-link"
          type="url"
          placeholder="https://example.com"
          value={portfolioLinks.website || ''}
          onChange={(e) => onUpdatePortfolio('website', e.target.value)}
        />
      </div>
    </div>
  );
}
