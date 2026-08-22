import MockInterview from '../models/MockInterview.js';
import ApiError from '../utils/apiError.js';

const QUESTION_BANK = {
  'Software Engineer': [
    { text: 'Explain the difference between process and thread, and how Node.js handles asynchronous I/O.', category: 'technical', ideal: 'Processes have independent memory space, while threads share memory within a process. Node.js uses a single-threaded event loop with libuv thread pool for non-blocking asynchronous I/O operations.' },
    { text: 'Describe a situation where you had to debug a complex production performance bottleneck.', category: 'behavioral', ideal: 'Used profiling tools (APM, Chrome DevTools), identified memory leak or database unindexed query, systematically isolated the root cause, deployed patch, and validated post-fix metrics.' },
    { text: 'How would you design a rate limiter for an API endpoint handling 100,000 requests per minute?', category: 'system-design', ideal: 'Use Redis token bucket or sliding window algorithm. Store request counts per user IP with TTL, returning HTTP 429 Too Many Requests when limits are exceeded.' },
    { text: 'How do you handle disagreement with a technical decision made by your lead engineer?', category: 'situational', ideal: 'Present data-driven benchmarks or working proof-of-concept respectfully, focus on project goals, and align with final decision once team consensus is reached.' }
  ],
  'Frontend Developer': [
    { text: 'What are React Server Components, and how do they differ from traditional Client Components?', category: 'technical', ideal: 'Server Components execute exclusively on the server, producing zero bundle size for client-side rendering. Client Components run in browser DOM and handle interactivity like state and event listeners.' },
    { text: 'How do you optimize Web Vitals (LCP, CLS, FID) for a modern React web application?', category: 'technical', ideal: 'Lazy load non-critical routes, compress images to WebP, eliminate layout shifts with explicit width/height dimensions, and optimize JavaScript bundle splitting.' },
    { text: 'Walk through how CSS Grid and Flexbox differ in core layout methodology.', category: 'technical', ideal: 'Flexbox is one-dimensional (row or column), ideal for component layouts. CSS Grid is two-dimensional (rows and columns simultaneously), ideal for macro page layouts.' },
    { text: 'Describe how you handle state management across deeply nested component hierarchies.', category: 'technical', ideal: 'Use React Context or Zustand/Redux for global application state, avoiding prop drilling while keeping local UI state inside component hooks.' }
  ],
  'Product Manager': [
    { text: 'How do you prioritize competing feature requests from Sales, Engineering, and Customers?', category: 'situational', ideal: 'Use frameworks like RICE (Reach, Impact, Confidence, Effort) or Kano model, align prioritization with quarterly business OKRs, and maintain transparent roadmap communication.' },
    { text: 'Walk me through a metric dashboard you designed to evaluate feature adoption.', category: 'behavioral', ideal: 'Track Daily Active Users (DAU), retention cohort rate, feature click-through rate, and Net Promoter Score (NPS) to measure satisfaction.' },
    { text: 'How would you measure the success of a new search filter feature on an e-commerce platform?', category: 'technical', ideal: 'Measure conversion rate increase, average search-to-cart time reduction, filter usage engagement %, and drop-off rate.' }
  ]
};

/**
 * Start a new mock interview session.
 */
export const startInterview = async (userId, { jobRole = 'Software Engineer', difficulty = 'medium' }) => {
  const roleQuestions = QUESTION_BANK[jobRole] || QUESTION_BANK['Software Engineer'];

  const questions = roleQuestions.map(q => ({
    questionText: q.text,
    category: q.category,
    userAnswer: '',
    feedback: '',
    score: 0,
    idealAnswer: q.ideal,
    keyTakeaways: ['Be specific with technical examples', 'Structure response using STAR method']
  }));

  return MockInterview.create({
    userId,
    jobRole,
    difficulty,
    questions,
    status: 'in-progress'
  });
};

/**
 * Submit an answer for a specific question in an ongoing interview.
 */
export const answerQuestion = async (userId, interviewId, { questionIndex, answerText }) => {
  const interview = await MockInterview.findOne({ _id: interviewId, userId });
  if (!interview) throw new ApiError(404, 'Mock interview session not found');

  if (questionIndex < 0 || questionIndex >= interview.questions.length) {
    throw new ApiError(400, 'Invalid question index');
  }

  const q = interview.questions[questionIndex];
  q.userAnswer = answerText;

  // AI Answer Evaluation Logic
  const lengthScore = Math.min(40, Math.round(answerText.length / 5)); // Reward detailed explanations
  const keywordMatches = (q.idealAnswer.toLowerCase().match(/\b(node|react|state|memory|cache|redis|star|data|metrics|system|performance|scale)\b/g) || []).length;
  const matchScore = Math.min(60, keywordMatches * 15 + 20);

  q.score = Math.min(100, lengthScore + matchScore);

  if (q.score >= 80) {
    q.feedback = 'Excellent answer! You hit all key technical concepts and structured your explanation clearly.';
  } else if (q.score >= 60) {
    q.feedback = 'Good response. Consider elaborating more on trade-offs and real-world metrics to achieve top score.';
  } else {
    q.feedback = 'Adequate start. Be sure to reference concrete architecture concepts and provide structured examples.';
  }

  await interview.save();
  return interview;
};

/**
 * Finish mock interview and calculate overall report card.
 */
export const finishInterview = async (userId, interviewId) => {
  const interview = await MockInterview.findOne({ _id: interviewId, userId });
  if (!interview) throw new ApiError(404, 'Mock interview session not found');

  const totalScore = interview.questions.reduce((sum, q) => sum + q.score, 0);
  interview.overallScore = Math.round(totalScore / (interview.questions.length || 1));
  interview.status = 'completed';
  interview.completedAt = new Date();

  await interview.save();
  return interview;
};

/**
 * Get user's past mock interview history.
 */
export const getUserInterviews = async (userId) => {
  return MockInterview.find({ userId }).sort({ createdAt: -1 }).lean();
};
