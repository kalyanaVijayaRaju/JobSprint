import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { interviewPrepApi } from '../api/client.js';
import {
  BookOpen, Star, Sparkles, CheckCircle2, ChevronRight, RefreshCw,
  Trophy, Filter, HelpCircle, Eye, EyeOff, Award, Clock
} from 'lucide-react';
import { Button, Badge, Spinner, EmptyState } from '../components/ui';

const CATEGORIES = [
  { id: '', label: 'All Questions' },
  { id: 'behavioral', label: 'Behavioral' },
  { id: 'technical', label: 'Technical' },
  { id: 'system-design', label: 'System Design' },
  { id: 'coding', label: 'Coding' },
  { id: 'hr', label: 'HR & Culture' },
  { id: 'situational', label: 'Situational' }
];

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];

export default function InterviewPrepPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;

      const [qRes, fRes, sRes] = await Promise.all([
        interviewPrepApi.listQuestions(params),
        interviewPrepApi.getFavorites().catch(() => ({ data: { favorites: [] } })),
        interviewPrepApi.getStats().catch(() => ({ data: { stats: null } }))
      ]);

      if (qRes.success) setQuestions(qRes.data.questions || []);
      if (fRes.success) setFavorites((fRes.data.favorites || []).map(f => f.questionId?._id || f.questionId));
      if (sRes.success) setStats(sRes.data.stats || null);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, selectedDifficulty]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeed = async () => {
    try {
      setLoading(true);
      await interviewPrepApi.seed();
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to seed questions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await interviewPrepApi.toggleFavorite(id);
      if (favorites.includes(id)) {
        setFavorites(favorites.filter(f => f !== id));
      } else {
        setFavorites([...favorites, id]);
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle favorite');
    }
  };

  const handleSaveConfidence = async (questionId, confidence) => {
    try {
      await interviewPrepApi.savePractice(questionId, { confidence });
      // Move to next question in practice mode
      if (practiceMode && currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to save practice');
    }
  };

  const currentQuestion = questions[currentIndex];

  if (loading && questions.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Spinner size="lg" label="Loading interview questions..." /></div>;
  }

  return (
    <div className="interview-prep-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Interview Preparation Hub</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '14px' }}>Master top behavioral, technical, and system design questions with sample answers.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {questions.length === 0 && (
            <Button variant="outline" onClick={handleSeed}>
              <Sparkles size={16} /> Load Sample Questions
            </Button>
          )}
          <Button
            variant={practiceMode ? 'secondary' : 'primary'}
            onClick={() => {
              setPracticeMode(!practiceMode);
              setCurrentIndex(0);
              setShowAnswer(false);
            }}
          >
            {practiceMode ? 'Exit Practice Mode' : 'Start Practice Mode'}
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      {!practiceMode && (
        <>
          <div className="assessments-tabs" style={{ marginBottom: '16px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`assessments-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Difficulty:</span>
            {DIFFICULTIES.map(diff => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border)',
                  background: selectedDifficulty === diff ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedDifficulty === diff ? '#ffffff' : 'var(--color-text)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {diff}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Practice Mode Flashcard View */}
      {practiceMode ? (
        questions.length === 0 ? (
          <EmptyState title="No questions match filters" description="Select a different category or clear difficulty filters." />
        ) : (
          <div style={{ maxWidth: '720px', margin: '0 auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '32px' }}>
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Badge style={{ textTransform: 'capitalize' }}>{currentQuestion?.category}</Badge>
                <Badge style={{ textTransform: 'capitalize' }}>{currentQuestion?.difficulty}</Badge>
              </div>
            </div>

            {/* Question Text */}
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.4 }}>
              {currentQuestion?.question}
            </h2>

            {/* Action to reveal answer */}
            {!showAnswer ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Button variant="primary" onClick={() => setShowAnswer(true)}>
                  <Eye size={18} /> Reveal Sample Answer & Tips
                </Button>
              </div>
            ) : (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '10px' }}>Sample Answer</h3>
                <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text)', background: 'var(--color-bg)', padding: '16px', borderRadius: '12px' }}>
                  {currentQuestion?.sampleAnswer}
                </p>

                {currentQuestion?.tips?.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Pro Tips:</h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                      {currentQuestion.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                    </ul>
                  </div>
                )}

                {/* Self Evaluation */}
                <div style={{ marginTop: '28px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>How confident do you feel with this answer?</p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <Button variant="outline" size="sm" onClick={() => handleSaveConfidence(currentQuestion._id, 'not-confident')}>Need Practice</Button>
                    <Button variant="outline" size="sm" onClick={() => handleSaveConfidence(currentQuestion._id, 'somewhat')}>Getting There</Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveConfidence(currentQuestion._id, 'confident')}>Confident ✨</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={() => { setCurrentIndex(currentIndex - 1); setShowAnswer(false); }}>
                Previous
              </Button>

              <button
                type="button"
                onClick={() => handleToggleFavorite(currentQuestion._id)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: favorites.includes(currentQuestion._id) ? '#f59e0b' : 'var(--text-muted)' }}
              >
                <Star size={20} fill={favorites.includes(currentQuestion._id) ? '#f59e0b' : 'none'} />
              </button>

              <Button variant="outline" size="sm" disabled={currentIndex === questions.length - 1} onClick={() => { setCurrentIndex(currentIndex + 1); setShowAnswer(false); }}>
                Next Question
              </Button>
            </div>
          </div>
        )
      ) : (
        /* Question List View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {questions.map((q) => (
            <div key={q._id} className="assessment-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Badge style={{ fontSize: '11px', textTransform: 'capitalize' }}>{q.category}</Badge>
                    <Badge style={{ fontSize: '11px', textTransform: 'capitalize' }}>{q.difficulty}</Badge>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(q._id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: favorites.includes(q._id) ? '#f59e0b' : 'var(--text-muted)' }}
                  >
                    <Star size={18} fill={favorites.includes(q._id) ? '#f59e0b' : 'none'} />
                  </button>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 10px', lineHeight: 1.4 }}>{q.question}</h3>
                {q.skill && <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>Skill: {q.skill}</span>}
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{q.tips?.length || 0} pro tips</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const idx = questions.findIndex(item => item._id === q._id);
                    setCurrentIndex(idx);
                    setPracticeMode(true);
                    setShowAnswer(true);
                  }}
                >
                  Practice <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
