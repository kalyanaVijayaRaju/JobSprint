import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { assessmentsApi } from '../api/client.js';
import { Award, Clock, BarChart3, CheckCircle2, XCircle, ArrowRight, Timer, Trophy, ChevronRight } from 'lucide-react';
import { Badge, Button, Spinner, EmptyState, Modal } from '../components/ui';

/**
 * QuizRunner — full-screen quiz experience with timer and progress.
 */
function QuizRunner({ assessment, onComplete, onCancel }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((assessment.timeLimitMinutes || 15) * 60);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const questions = assessment.questions || [];
  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (value) => {
    setAnswers((prev) => ({ ...prev, [question._id]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer
    }));
    try {
      const res = await assessmentsApi.submit(assessment._id || assessment.id, {
        answers: formattedAnswers,
        timeTakenSeconds: timeTaken
      });
      onComplete(res?.data || res);
    } catch (err) {
      onComplete({ error: err.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!question) return null;

  const isUrgent = timeLeft < 60;

  return (
    <div className="quiz-runner">
      <div className="quiz-header">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="quiz-header-info">
          <span className="quiz-question-counter">
            Question {currentQ + 1} of {questions.length}
          </span>
          <span className={`quiz-timer ${isUrgent ? 'urgent' : ''}`}>
            <Timer size={16} /> {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="quiz-body">
        <h3 className="quiz-question-text">{question.questionText}</h3>
        <div className="quiz-options">
          {(question.options || []).map((opt, idx) => (
            <button
              key={opt.value}
              type="button"
              className={`quiz-option ${answers[question._id] === opt.value ? 'selected' : ''}`}
              onClick={() => handleAnswer(opt.value)}
            >
              <span className="quiz-option-letter">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="quiz-option-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-footer">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <div style={{ display: 'flex', gap: '10px' }}>
          {currentQ > 0 && (
            <Button variant="outline" onClick={() => setCurrentQ((c) => c - 1)}>Previous</Button>
          )}
          {currentQ < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQ((c) => c + 1)}
              disabled={!answers[question._id]}
              icon={<ArrowRight size={16} />}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length === 0}
              icon={<CheckCircle2 size={16} />}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ResultsView — shows quiz results with score breakdown.
 */
function ResultsView({ result, questions, onBack }) {
  if (result.error) {
    return (
      <div className="quiz-results">
        <div className="quiz-result-header failed">
          <XCircle size={48} />
          <h2>Submission Error</h2>
          <p>{result.error}</p>
        </div>
        <Button onClick={onBack}>Back to Assessments</Button>
      </div>
    );
  }

  const r = result.result || result;
  const passed = r.passed;

  return (
    <div className="quiz-results">
      <div className={`quiz-result-header ${passed ? 'passed' : 'failed'}`}>
        {passed ? <Trophy size={56} /> : <XCircle size={56} />}
        <h2>{passed ? '🎉 Congratulations!' : 'Keep Practicing!'}</h2>
        <div className="quiz-result-score">{r.score}%</div>
        <p className="quiz-result-points">
          {r.pointsEarned} / {r.totalPoints} points
          {passed && ' — Badge Earned!'}
        </p>
      </div>

      {questions && questions.length > 0 && (
        <div className="quiz-result-breakdown">
          <h3>Question Breakdown</h3>
          {questions.map((q, idx) => {
            const userAns = (r.answers || []).find((a) => a.questionId === (q._id || q.id));
            return (
              <div key={q._id || idx} className={`quiz-result-item ${userAns?.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="quiz-result-item-header">
                  {userAns?.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  <span>Q{idx + 1}: {q.questionText}</span>
                </div>
                {q.explanation && (
                  <p className="quiz-result-explanation">{q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button onClick={onBack} icon={<ArrowRight size={16} />}>Back to Assessments</Button>
      </div>
    </div>
  );
}

/**
 * AssessmentsPage — browse assessments, take quizzes, view badges.
 */
export default function AssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [tab, setTab] = useState('browse');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assRes, resRes, badgeRes] = await Promise.allSettled([
        assessmentsApi.list(),
        assessmentsApi.myResults(),
        assessmentsApi.myBadges()
      ]);
      if (assRes.status === 'fulfilled' && assRes.value?.success) {
        setAssessments(assRes.value.data.assessments || []);
      }
      if (resRes.status === 'fulfilled' && resRes.value?.success) {
        setResults(resRes.value.data.results || []);
      }
      if (badgeRes.status === 'fulfilled' && badgeRes.value?.success) {
        setBadges(badgeRes.value.data.badges || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartQuiz = async (assessment) => {
    try {
      const res = await assessmentsApi.get(assessment._id || assessment.id);
      if (res?.success) {
        setActiveQuiz(res.data.assessment);
        setQuizResult(null);
      }
    } catch {
      // silently fail
    }
  };

  const handleQuizComplete = (data) => {
    setQuizResult(data);
    setActiveQuiz(null);
    fetchData(); // Refresh results and badges
  };

  const completedIds = new Set(results.map((r) => r.assessmentId?._id || r.assessmentId));
  const difficultyColor = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' };

  if (activeQuiz) {
    return (
      <QuizRunner
        assessment={activeQuiz}
        onComplete={handleQuizComplete}
        onCancel={() => setActiveQuiz(null)}
      />
    );
  }

  if (quizResult) {
    return (
      <ResultsView
        result={quizResult}
        questions={quizResult.questions || []}
        onBack={() => setQuizResult(null)}
      />
    );
  }

  return (
    <div className="assessments-page">
      <div className="assessments-header">
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800 }}>
            <Award size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Skill Assessments
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Take quizzes to earn badges and prove your expertise to recruiters
          </p>
        </div>
        {badges.length > 0 && (
          <div className="assessments-badge-count">
            <Trophy size={20} />
            <span>{badges.length} Badge{badges.length !== 1 ? 's' : ''} Earned</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="assessments-tabs">
        <button
          type="button"
          className={`assessments-tab ${tab === 'browse' ? 'active' : ''}`}
          onClick={() => setTab('browse')}
        >
          Browse Assessments
        </button>
        <button
          type="button"
          className={`assessments-tab ${tab === 'badges' ? 'active' : ''}`}
          onClick={() => setTab('badges')}
        >
          My Badges ({badges.length})
        </button>
        <button
          type="button"
          className={`assessments-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Spinner size="lg" label="Loading assessments..." />
        </div>
      ) : tab === 'browse' ? (
        <div className="assessments-grid">
          {assessments.length === 0 ? (
            <EmptyState icon={<Award size={40} />} title="No assessments available" description="Check back later for new skill assessments." />
          ) : (
            assessments.map((a) => {
              const completed = completedIds.has(a._id || a.id);
              const result = results.find((r) => (r.assessmentId?._id || r.assessmentId) === (a._id || a.id));
              return (
                <div key={a._id || a.id} className={`assessment-card ${completed ? 'completed' : ''}`}>
                  <div className="assessment-card-icon">{a.icon || '📝'}</div>
                  <h3 className="assessment-card-title">{a.title}</h3>
                  <p className="assessment-card-desc">{a.description?.substring(0, 100)}...</p>
                  <div className="assessment-card-meta">
                    <Badge style={{ background: difficultyColor[a.difficulty] + '22', color: difficultyColor[a.difficulty] }}>
                      {a.difficulty}
                    </Badge>
                    <span className="assessment-card-stat">
                      <Clock size={14} /> {a.timeLimitMinutes} min
                    </span>
                    <span className="assessment-card-stat">
                      <BarChart3 size={14} /> {a.questionCount || a.questions?.length || '?'} Q
                    </span>
                  </div>
                  {completed ? (
                    <div className="assessment-card-result">
                      <CheckCircle2 size={16} style={{ color: result?.passed ? '#10b981' : '#ef4444' }} />
                      <span>Score: {result?.score}%</span>
                      {result?.passed && <Badge style={{ background: '#10b98122', color: '#10b981' }}>Passed</Badge>}
                    </div>
                  ) : (
                    <Button onClick={() => handleStartQuiz(a)} icon={<ChevronRight size={16} />} style={{ marginTop: '12px', width: '100%' }}>
                      Start Assessment
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : tab === 'badges' ? (
        <div className="badges-grid">
          {badges.length === 0 ? (
            <EmptyState icon={<Trophy size={40} />} title="No badges yet" description="Complete assessments to earn skill badges." />
          ) : (
            badges.map((badge, idx) => (
              <div key={idx} className="badge-card">
                <div className="badge-card-icon">{badge.icon || '🏆'}</div>
                <h4 className="badge-card-title">{badge.skill}</h4>
                <p className="badge-card-subtitle">{badge.title}</p>
                <Badge style={{ background: difficultyColor[badge.difficulty] + '22', color: difficultyColor[badge.difficulty] }}>
                  {badge.difficulty}
                </Badge>
                <div className="badge-card-score">Score: {badge.score}%</div>
                <div className="badge-card-date">
                  Earned {new Date(badge.earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="assessment-history">
          {results.length === 0 ? (
            <EmptyState icon={<Clock size={40} />} title="No history" description="Your completed assessments will appear here." />
          ) : (
            results.map((r, idx) => (
              <div key={idx} className="assessment-history-item">
                <div className="assessment-history-icon">
                  {r.passed ? <CheckCircle2 size={20} style={{ color: '#10b981' }} /> : <XCircle size={20} style={{ color: '#ef4444' }} />}
                </div>
                <div className="assessment-history-info">
                  <strong>{r.assessmentId?.title || 'Assessment'}</strong>
                  <span className="assessment-history-detail">
                    {r.assessmentId?.skill} · {r.assessmentId?.difficulty} · Score: {r.score}%
                  </span>
                </div>
                <div className="assessment-history-date">
                  {new Date(r.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
