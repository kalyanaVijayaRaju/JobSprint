import { useState, useEffect, useCallback } from 'react';
import { companyReviewsApi } from '../../api/client.js';
import { Star, ThumbsUp, Plus, MessageSquare, Check } from 'lucide-react';
import { Button, Badge, Spinner, EmptyState, Modal } from '../ui';

export default function CompanyReviewsTab({ companyId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Review Form State
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('current');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadReviewsData = useCallback(async () => {
    try {
      setLoading(true);
      const [rRes, sRes] = await Promise.all([
        companyReviewsApi.list(companyId),
        companyReviewsApi.getStats(companyId)
      ]);
      if (rRes.success) setReviews(rRes.data.reviews || []);
      if (sRes.success) setStats(sRes.data.stats || null);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadReviewsData();
  }, [loadReviewsData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !pros || !cons) return alert('Please fill in title, pros, and cons.');
    try {
      setSubmitting(true);
      await companyReviewsApi.create(companyId, {
        rating, title, pros, cons, employmentStatus, isAnonymous
      });
      setIsModalOpen(false);
      loadReviewsData();
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await companyReviewsApi.toggleHelpful(companyId, reviewId);
      loadReviewsData();
    } catch (err) {
      alert(err.message || 'Failed to vote');
    }
  };

  if (loading && !stats) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Spinner size="lg" label="Loading reviews..." /></div>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Review Stats Header */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '42px', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>
              {stats?.avgRating || '0.0'}
            </div>
            <div style={{ display: 'flex', gap: '2px', color: '#f59e0b', justifyContent: 'center', margin: '4px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} fill={star <= Math.round(stats?.avgRating || 0) ? '#f59e0b' : 'none'} />
              ))}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stats?.totalReviews || 0} Reviews</div>
          </div>

          <div style={{ height: '60px', width: '1px', background: 'var(--color-border)' }} />

          {/* Category Breakdown */}
          {stats?.categories && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 24px', fontSize: '13px' }}>
              <div>Work-Life Balance: <strong>{stats.categories.workLifeBalance}</strong> ★</div>
              <div>Compensation: <strong>{stats.categories.compensation}</strong> ★</div>
              <div>Company Culture: <strong>{stats.categories.culture}</strong> ★</div>
              <div>Growth Opportunities: <strong>{stats.categories.growthOpportunities}</strong> ★</div>
            </div>
          )}
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Write a Review
        </Button>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Be the first employee to review this company!" actionLabel="Write Review" onAction={() => setIsModalOpen(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((rev) => (
            <div key={rev._id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', color: '#f59e0b' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} fill={s <= rev.rating ? '#f59e0b' : 'none'} />
                      ))}
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>{rev.title}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {rev.employmentStatus === 'current' ? 'Current Employee' : 'Former Employee'} • {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <Badge style={{ textTransform: 'capitalize' }}>{rev.employmentStatus}</Badge>
              </div>

              <div style={{ marginTop: '12px', fontSize: '14px', lineHeight: 1.5 }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#10b981' }}>Pros: </strong> {rev.pros}
                </div>
                <div>
                  <strong style={{ color: '#ef4444' }}>Cons: </strong> {rev.cons}
                </div>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleHelpful(rev._id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ThumbsUp size={14} /> Helpful ({rev.helpfulCount || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Write a Company Review">
        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Overall Rating</label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: star <= rating ? '#f59e0b' : '#cbd5e1' }}
                >
                  <Star size={24} fill={star <= rating ? '#f59e0b' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Headline / Review Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Great learning culture and collaborative team" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} required />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>Pros</label>
            <textarea rows={3} value={pros} onChange={(e) => setPros(e.target.value)} placeholder="What do you like about working here?" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} required />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444' }}>Cons</label>
            <textarea rows={3} value={cons} onChange={(e) => setCons(e.target.value)} placeholder="What could be improved?" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} required />
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} /> Post Anonymously
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>Submit Review</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
