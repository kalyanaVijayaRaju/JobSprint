import { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, Check } from 'lucide-react';
import { Button } from '../ui';

const TOUR_STEPS = {
  candidate: [
    { title: 'Welcome to JobSprint! 🚀', content: 'Your all-in-one career platform. Discover jobs, track applications, build ATS resumes, and take skill assessments.', target: null },
    { title: 'Find & Compare Jobs 🔍', content: 'Filter jobs by salary, location, and skills. Use our side-by-side comparison tool to evaluate roles.', target: '/jobs' },
    { title: 'Skill Assessments 🏆', content: 'Take quizzes in React, Node.js, and SQL to earn verified badges that boost your profile visibility.', target: '/assessments' },
    { title: 'Resume & CV Builder 📄', content: 'Create ATS-friendly resumes with live styling and one-click PDF export.', target: '/resumes' },
    { title: 'Global Navigation (Ctrl+K) ⌘', content: 'Press Ctrl+K anytime to quickly jump between pages or search jobs.', target: null }
  ],
  recruiter: [
    { title: 'Welcome Recruiter! 🎯', content: 'Manage your entire hiring pipeline from job posting to candidate outreach.', target: null },
    { title: 'ATS Pipelines 📊', content: 'Track candidate applications across review, interview, and offer stages.', target: '/applications' },
    { title: 'Talent Pool Search 🔍', content: 'Search candidates by skills, experience, and verified badges with match scoring.', target: '/talent-pool' },
    { title: 'Email Outreach 📧', content: 'Send personalized templated emails directly to candidates from the platform.', target: '/settings' }
  ]
};

export default function OnboardingTour({ role = 'candidate' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem(`has_seen_tour_${role}`);
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, [role]);

  const steps = TOUR_STEPS[role] || TOUR_STEPS.candidate;
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`has_seen_tour_${role}`, 'true');
    setIsOpen(false);
  };

  if (!isOpen || !step) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '360px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      zIndex: 9999,
      animation: 'cmdAppear 0.2s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
          <Sparkles size={14} /> Feature Tour ({currentStep + 1}/{steps.length})
        </div>
        <button
          type="button"
          onClick={handleComplete}
          style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
        >
          <X size={16} />
        </button>
      </div>

      <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800 }}>{step.title}</h3>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{step.content}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleComplete}
          style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
        >
          Skip tour
        </button>

        <Button variant="primary" size="sm" onClick={handleNext}>
          {currentStep === steps.length - 1 ? 'Got it!' : 'Next'} <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
