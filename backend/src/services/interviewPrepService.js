import { InterviewQuestion, PracticeSession } from '../models/InterviewQuestion.js';
import ApiError from '../utils/apiError.js';

/**
 * List questions with optional filters.
 */
export const listQuestions = async (filters = {}) => {
  const query = { isActive: true };
  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.skill) query.skill = new RegExp(filters.skill, 'i');
  if (filters.companyType && filters.companyType !== 'any') query.companyType = filters.companyType;

  return InterviewQuestion.find(query).sort({ createdAt: -1 }).lean();
};

/**
 * Get a single question.
 */
export const getQuestion = async (id) => {
  const question = await InterviewQuestion.findById(id).lean();
  if (!question) throw new ApiError(404, 'Question not found');
  return question;
};

/**
 * Save a practice session.
 */
export const savePractice = async (userId, data) => {
  const session = await PracticeSession.findOneAndUpdate(
    { userId, questionId: data.questionId },
    {
      userId,
      questionId: data.questionId,
      confidence: data.confidence || 'somewhat',
      notes: data.notes || '',
      isFavorite: data.isFavorite || false,
      practicedAt: new Date()
    },
    { upsert: true, new: true }
  );
  return session;
};

/**
 * Get user's practice history.
 */
export const getPracticeHistory = async (userId) => {
  return PracticeSession.find({ userId })
    .populate('questionId', 'question category difficulty skill')
    .sort({ practicedAt: -1 })
    .lean();
};

/**
 * Get user's favorite questions.
 */
export const getFavorites = async (userId) => {
  return PracticeSession.find({ userId, isFavorite: true })
    .populate('questionId')
    .sort({ practicedAt: -1 })
    .lean();
};

/**
 * Toggle favorite on a question.
 */
export const toggleFavorite = async (userId, questionId) => {
  const session = await PracticeSession.findOne({ userId, questionId });
  if (!session) {
    return PracticeSession.create({
      userId,
      questionId,
      isFavorite: true,
      practicedAt: new Date()
    });
  }
  session.isFavorite = !session.isFavorite;
  await session.save();
  return session;
};

/**
 * Get practice stats for a user.
 */
export const getPracticeStats = async (userId) => {
  const total = await PracticeSession.countDocuments({ userId });
  const favorites = await PracticeSession.countDocuments({ userId, isFavorite: true });
  const byConfidence = await PracticeSession.aggregate([
    { $match: { userId: (await import('mongoose')).default.Types.ObjectId.createFromHexString(userId.toString()) } },
    { $group: { _id: '$confidence', count: { $sum: 1 } } }
  ]);

  return {
    total,
    favorites,
    confidence: Object.fromEntries(byConfidence.map(c => [c._id, c.count]))
  };
};

/**
 * Seed interview questions with curated data.
 */
export const seedQuestions = async () => {
  const count = await InterviewQuestion.countDocuments();
  if (count > 0) return { seeded: false, message: 'Questions already exist' };

  const questions = [
    // Behavioral
    { category: 'behavioral', difficulty: 'easy', question: 'Tell me about yourself.', sampleAnswer: 'Use the Present-Past-Future framework: Start with your current role, highlight key past experiences, and express enthusiasm for the future opportunity.', tips: ['Keep it under 2 minutes', 'Tailor to the job description', 'End with why this role excites you'], skill: 'Communication', companyType: 'any', tags: ['introduction', 'common'] },
    { category: 'behavioral', difficulty: 'medium', question: 'Describe a time when you had to deal with a difficult team member.', sampleAnswer: 'Use the STAR method: Describe the Situation, Task, Action you took, and the Result. Focus on how you maintained professionalism and found a resolution.', tips: ['Focus on your actions, not blame', 'Show empathy', 'Highlight the positive outcome'], skill: 'Teamwork', companyType: 'any', tags: ['teamwork', 'conflict-resolution'] },
    { category: 'behavioral', difficulty: 'medium', question: 'Tell me about a time you failed. How did you handle it?', sampleAnswer: 'Choose a genuine failure, explain what happened, what you learned, and how you applied that learning. Employers want to see resilience and growth mindset.', tips: ['Be honest', 'Show what you learned', 'Demonstrate growth'], skill: 'Self-awareness', companyType: 'any', tags: ['failure', 'growth'] },
    { category: 'behavioral', difficulty: 'medium', question: 'How do you handle tight deadlines?', sampleAnswer: 'Describe your prioritization process, communication with stakeholders, and any tools you use. Give a specific example.', tips: ['Mention prioritization frameworks', 'Show calm under pressure', 'Give specific metrics'], skill: 'Time Management', companyType: 'any', tags: ['deadlines', 'pressure'] },
    { category: 'behavioral', difficulty: 'hard', question: 'Describe a situation where you had to influence without authority.', sampleAnswer: 'Explain the context, your approach to building consensus, data you used to support your position, and the outcome.', tips: ['Show leadership without title', 'Use data to persuade', 'Demonstrate emotional intelligence'], skill: 'Leadership', companyType: 'any', tags: ['leadership', 'influence'] },
    { category: 'behavioral', difficulty: 'easy', question: 'Why do you want to work here?', sampleAnswer: 'Research the company culture, mission, and recent news. Connect your skills and career goals to their specific needs.', tips: ['Research the company deeply', 'Be specific, not generic', 'Show genuine enthusiasm'], skill: 'Communication', companyType: 'any', tags: ['motivation', 'common'] },
    { category: 'behavioral', difficulty: 'medium', question: 'How do you handle receiving critical feedback?', sampleAnswer: 'Show that you listen actively, ask clarifying questions, reflect on the feedback objectively, and take concrete steps to improve.', tips: ['Give a real example', 'Show emotional maturity', 'Demonstrate improvement'], skill: 'Self-awareness', companyType: 'any', tags: ['feedback', 'growth'] },

    // Technical
    { category: 'technical', difficulty: 'easy', question: 'What is the difference between REST and GraphQL?', sampleAnswer: 'REST uses multiple endpoints with fixed data structures; GraphQL uses a single endpoint where clients specify exactly what data they need, reducing over-fetching.', tips: ['Compare pros and cons', 'Mention use cases for each', 'Discuss caching differences'], skill: 'API Design', companyType: 'any', tags: ['api', 'web-development'] },
    { category: 'technical', difficulty: 'medium', question: 'Explain the concept of database indexing and when you would use it.', sampleAnswer: 'Indexes are data structures that improve query speed by creating a sorted reference to table data. Use them on frequently queried columns, foreign keys, and columns used in WHERE/ORDER BY clauses.', tips: ['Mention B-tree vs Hash indexes', 'Discuss trade-offs (write performance)', 'Give practical examples'], skill: 'Databases', companyType: 'any', tags: ['database', 'performance'] },
    { category: 'technical', difficulty: 'medium', question: 'What is the difference between SQL and NoSQL databases?', sampleAnswer: 'SQL databases are relational with structured schemas (MySQL, PostgreSQL). NoSQL databases are non-relational with flexible schemas (MongoDB, Redis). Choice depends on data structure, scalability needs, and consistency requirements.', tips: ['Compare ACID vs BASE', 'Discuss scalability patterns', 'Mention real-world use cases'], skill: 'Databases', companyType: 'any', tags: ['database', 'architecture'] },
    { category: 'technical', difficulty: 'hard', question: 'How would you optimize a slow API endpoint?', sampleAnswer: 'Profile the endpoint, check for N+1 queries, add database indexes, implement caching (Redis), paginate large datasets, use lazy loading, and consider CDN for static content.', tips: ['Start with measurement', 'Mention specific tools', 'Discuss caching strategies'], skill: 'Performance', companyType: 'any', tags: ['optimization', 'api'] },
    { category: 'technical', difficulty: 'easy', question: 'What are React hooks and why were they introduced?', sampleAnswer: 'Hooks let you use state and lifecycle features in functional components. They were introduced to simplify code, promote reusable logic, and avoid class component complexity.', tips: ['Mention useState, useEffect, useContext', 'Explain custom hooks', 'Compare with class components'], skill: 'React', companyType: 'any', tags: ['react', 'frontend'] },
    { category: 'technical', difficulty: 'medium', question: 'Explain the JavaScript event loop.', sampleAnswer: 'JavaScript is single-threaded. The event loop manages asynchronous operations by processing the call stack, then checking the microtask queue (Promises) and macrotask queue (setTimeout, I/O).', tips: ['Draw the diagram mentally', 'Mention microtasks vs macrotasks', 'Give a code example'], skill: 'JavaScript', companyType: 'any', tags: ['javascript', 'async'] },
    { category: 'technical', difficulty: 'hard', question: 'How do you ensure security in a Node.js application?', sampleAnswer: 'Input validation/sanitization, JWT authentication, HTTPS, rate limiting, CORS configuration, helmet for HTTP headers, parameterized queries, dependency auditing, and proper error handling without leaking stack traces.', tips: ['Cover OWASP Top 10', 'Mention specific packages', 'Discuss auth vs authz'], skill: 'Node.js', companyType: 'any', tags: ['security', 'node'] },

    // System Design
    { category: 'system-design', difficulty: 'medium', question: 'Design a URL shortening service like bit.ly.', sampleAnswer: 'Use a hash/base62 encoding to generate short codes, store mappings in a database with the original URL, implement 301 redirects, add analytics tracking, and consider a cache layer for popular URLs.', tips: ['Discuss scale estimates', 'Mention database choice', 'Consider collision handling'], skill: 'System Design', companyType: 'any', tags: ['system-design', 'common'] },
    { category: 'system-design', difficulty: 'hard', question: 'Design a real-time chat application.', sampleAnswer: 'Use WebSockets for real-time communication, message queue (RabbitMQ/Redis) for reliable delivery, NoSQL database for message storage, implement presence detection, and consider horizontal scaling with sticky sessions or pub/sub.', tips: ['Discuss WebSocket vs polling', 'Mention message ordering', 'Consider offline/reconnection'], skill: 'System Design', companyType: 'any', tags: ['system-design', 'real-time'] },
    { category: 'system-design', difficulty: 'hard', question: 'How would you design a job board platform like LinkedIn Jobs?', sampleAnswer: 'Microservices architecture: Job service, User service, Search service (Elasticsearch), Recommendation engine, Notification service. Use event-driven architecture for real-time updates, CDN for static assets, and a job matching algorithm.', tips: ['Start with requirements', 'Discuss database schema', 'Mention search optimization'], skill: 'System Design', companyType: 'enterprise', tags: ['system-design', 'platform'] },

    // HR
    { category: 'hr', difficulty: 'easy', question: 'What are your salary expectations?', sampleAnswer: 'Research market rates beforehand. Provide a range based on your experience level and the role. Express flexibility and willingness to discuss total compensation package.', tips: ['Research on Glassdoor/Levels.fyi', 'Give a range, not exact number', 'Consider total compensation'], skill: 'Negotiation', companyType: 'any', tags: ['salary', 'negotiation'] },
    { category: 'hr', difficulty: 'easy', question: 'Where do you see yourself in 5 years?', sampleAnswer: 'Express ambition aligned with the role. Show you want to grow within the company, take on more responsibility, and develop expertise in relevant areas.', tips: ['Be realistic', 'Align with company growth', 'Show commitment'], skill: 'Career Planning', companyType: 'any', tags: ['future', 'career'] },
    { category: 'hr', difficulty: 'medium', question: 'Why are you leaving your current job?', sampleAnswer: 'Focus on positive reasons: seeking new challenges, career growth, learning opportunities, or better alignment with your long-term goals. Never badmouth your current employer.', tips: ['Stay positive', 'Never badmouth', 'Focus on growth'], skill: 'Communication', companyType: 'any', tags: ['transition', 'motivation'] },

    // Situational
    { category: 'situational', difficulty: 'medium', question: 'You discover a critical bug in production right before a major release. What do you do?', sampleAnswer: 'Immediately assess severity and impact. Notify the team lead and stakeholders. If critical, recommend delaying the release. Document the bug, create a hotfix, test thoroughly, and do a post-mortem.', tips: ['Show communication skills', 'Demonstrate calm decision-making', 'Mention post-incident review'], skill: 'Problem Solving', companyType: 'any', tags: ['crisis', 'decision-making'] },
    { category: 'situational', difficulty: 'medium', question: 'Your team disagrees on the technical approach. How do you resolve it?', sampleAnswer: 'Facilitate a discussion where each side presents their approach with pros/cons. Use data and benchmarks when possible. If still deadlocked, propose a time-boxed prototype or proof of concept.', tips: ['Stay objective', 'Use data to decide', 'Be open to compromise'], skill: 'Teamwork', companyType: 'any', tags: ['conflict', 'teamwork'] },
    { category: 'situational', difficulty: 'hard', question: 'A stakeholder keeps changing requirements mid-sprint. How do you handle this?', sampleAnswer: 'Set up a requirements freeze process, demonstrate sprint impact of changes, negotiate scope with product owner, and use a change request process. Communicate the trade-offs clearly.', tips: ['Show agile knowledge', 'Discuss scope management', 'Emphasize communication'], skill: 'Project Management', companyType: 'any', tags: ['agile', 'stakeholder-management'] },

    // Coding
    { category: 'coding', difficulty: 'easy', question: 'Write a function to reverse a string without using built-in reverse methods.', sampleAnswer: 'function reverseString(str) { let result = ""; for (let i = str.length - 1; i >= 0; i--) { result += str[i]; } return result; }', tips: ['Discuss time complexity O(n)', 'Mention alternative approaches', 'Consider edge cases (empty string, single char)'], skill: 'JavaScript', companyType: 'any', tags: ['coding', 'strings'] },
    { category: 'coding', difficulty: 'medium', question: 'Implement a function to check if a string has all unique characters.', sampleAnswer: 'Use a Set to track seen characters. Iterate through the string; if a character is already in the Set, return false. If you complete the loop, return true. Time: O(n), Space: O(n).', tips: ['Discuss Set vs Object approach', 'Mention sorting approach O(n log n)', 'Consider ASCII vs Unicode'], skill: 'Data Structures', companyType: 'any', tags: ['coding', 'strings', 'sets'] },
    { category: 'coding', difficulty: 'medium', question: 'How would you implement debounce in JavaScript?', sampleAnswer: 'function debounce(fn, delay) { let timer; return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); }; }', tips: ['Explain the use case (search input)', 'Compare with throttle', 'Discuss leading vs trailing edge'], skill: 'JavaScript', companyType: 'any', tags: ['coding', 'performance', 'patterns'] },
  ];

  await InterviewQuestion.insertMany(questions);
  return { seeded: true, count: questions.length };
};
