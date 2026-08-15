import SkillAssessment from '../models/SkillAssessment.js';
import AssessmentResult from '../models/AssessmentResult.js';
import ApiError from '../utils/apiError.js';

/**
 * List all active assessments with optional skill/difficulty filter.
 * Strips correct answers from the response.
 */
export const listAssessments = async (filters = {}) => {
  const query = { isActive: true };
  if (filters.skill) query.skill = new RegExp(filters.skill, 'i');
  if (filters.difficulty) query.difficulty = filters.difficulty;

  const assessments = await SkillAssessment.find(query)
    .select('-questions.correctAnswer -questions.explanation')
    .sort({ createdAt: -1 })
    .lean();

  return assessments;
};

/**
 * Get a single assessment detail (without answers for candidates).
 */
export const getAssessment = async (id, includeAnswers = false) => {
  const selectFields = includeAnswers ? '' : '-questions.correctAnswer -questions.explanation';
  const assessment = await SkillAssessment.findById(id).select(selectFields).lean();
  if (!assessment) {
    throw new ApiError(404, 'Assessment not found');
  }
  return assessment;
};

/**
 * Submit answers for an assessment and compute score.
 */
export const submitAssessment = async (userId, assessmentId, userAnswers, timeTakenSeconds) => {
  // Check if already attempted
  const existing = await AssessmentResult.findOne({ userId, assessmentId });
  if (existing) {
    throw new ApiError(409, 'You have already completed this assessment');
  }

  // Fetch full assessment with answers
  const assessment = await SkillAssessment.findById(assessmentId);
  if (!assessment) {
    throw new ApiError(404, 'Assessment not found');
  }
  if (!assessment.isActive) {
    throw new ApiError(400, 'This assessment is no longer active');
  }

  // Grade the answers
  let pointsEarned = 0;
  const totalPoints = assessment.questions.reduce((sum, q) => sum + (q.points || 1), 0);

  const gradedAnswers = assessment.questions.map((question) => {
    const userAnswer = userAnswers.find(
      (a) => a.questionId === question._id.toString()
    );
    const selected = userAnswer?.selectedAnswer || '';
    const isCorrect = selected === question.correctAnswer;
    const pts = isCorrect ? (question.points || 1) : 0;
    pointsEarned += pts;

    return {
      questionId: question._id,
      selectedAnswer: selected,
      isCorrect,
      pointsEarned: pts
    };
  });

  const scorePercent = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
  const passed = scorePercent >= assessment.passingScore;

  // Save result
  const result = await AssessmentResult.create({
    userId,
    assessmentId,
    answers: gradedAnswers,
    score: scorePercent,
    pointsEarned,
    totalPoints,
    passed,
    timeTakenSeconds,
    completedAt: new Date()
  });

  // Update assessment stats
  assessment.totalAttempts += 1;
  assessment.avgScore = Math.round(
    ((assessment.avgScore * (assessment.totalAttempts - 1)) + scorePercent) / assessment.totalAttempts
  );
  await assessment.save();

  // Return result with question explanations for review
  const questionsWithExplanations = assessment.questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation
  }));

  return {
    result: result.toObject(),
    questions: questionsWithExplanations
  };
};

/**
 * Get all results/badges for a user.
 */
export const getUserResults = async (userId) => {
  const results = await AssessmentResult.find({ userId })
    .populate('assessmentId', 'title skill difficulty icon timeLimitMinutes')
    .sort({ completedAt: -1 })
    .lean();

  return results;
};

/**
 * Get only passed assessments as "badges".
 */
export const getUserBadges = async (userId) => {
  const badges = await AssessmentResult.find({ userId, passed: true })
    .populate('assessmentId', 'title skill difficulty icon')
    .sort({ completedAt: -1 })
    .lean();

  return badges.map((b) => ({
    skill: b.assessmentId?.skill,
    title: b.assessmentId?.title,
    difficulty: b.assessmentId?.difficulty,
    icon: b.assessmentId?.icon,
    score: b.score,
    earnedAt: b.completedAt
  }));
};

/**
 * Seed initial skill assessments for common tech stacks.
 */
export const seedAssessments = async () => {
  const count = await SkillAssessment.countDocuments();
  if (count > 0) return { seeded: false, message: 'Assessments already exist' };

  const assessments = [
    {
      title: 'JavaScript Fundamentals',
      skill: 'JavaScript',
      description: 'Test your knowledge of core JavaScript concepts including closures, prototypes, async/await, and ES6+ features.',
      difficulty: 'intermediate',
      icon: '🟨',
      timeLimitMinutes: 15,
      passingScore: 60,
      questions: [
        {
          questionText: 'What is the output of: typeof null?',
          options: [
            { label: '"null"', value: 'null' },
            { label: '"object"', value: 'object' },
            { label: '"undefined"', value: 'undefined' },
            { label: '"boolean"', value: 'boolean' }
          ],
          correctAnswer: 'object',
          explanation: 'This is a well-known JavaScript quirk. typeof null returns "object" due to a legacy bug in the language.',
          points: 1
        },
        {
          questionText: 'Which method creates a new array with elements that pass a test?',
          options: [
            { label: 'Array.prototype.map()', value: 'map' },
            { label: 'Array.prototype.filter()', value: 'filter' },
            { label: 'Array.prototype.reduce()', value: 'reduce' },
            { label: 'Array.prototype.forEach()', value: 'forEach' }
          ],
          correctAnswer: 'filter',
          explanation: 'filter() creates a new array with all elements that pass the provided testing function.',
          points: 1
        },
        {
          questionText: 'What does "use strict" do in JavaScript?',
          options: [
            { label: 'Enables strict type checking', value: 'type-check' },
            { label: 'Prevents the use of undeclared variables and other silent errors', value: 'strict-mode' },
            { label: 'Makes all variables immutable', value: 'immutable' },
            { label: 'Enables ES6 module syntax', value: 'modules' }
          ],
          correctAnswer: 'strict-mode',
          explanation: '"use strict" activates strict mode which catches common coding mistakes and unsafe actions.',
          points: 1
        },
        {
          questionText: 'What is a closure in JavaScript?',
          options: [
            { label: 'A way to close browser tabs programmatically', value: 'close-tab' },
            { label: 'A function that has access to variables from its outer (enclosing) scope', value: 'closure' },
            { label: 'A method to end a loop early', value: 'break' },
            { label: 'A way to seal an object from modification', value: 'seal' }
          ],
          correctAnswer: 'closure',
          explanation: 'A closure is a function that retains access to the variables of its enclosing lexical scope even after the outer function has returned.',
          points: 2
        },
        {
          questionText: 'What is the difference between == and ===?',
          options: [
            { label: '== checks value, === checks reference', value: 'ref' },
            { label: '== allows type coercion, === checks value and type strictly', value: 'strict' },
            { label: 'They are identical in behavior', value: 'same' },
            { label: '=== is used only for objects', value: 'objects' }
          ],
          correctAnswer: 'strict',
          explanation: '== performs type coercion before comparison. === checks both value and type without coercion.',
          points: 1
        }
      ]
    },
    {
      title: 'React Essentials',
      skill: 'React',
      description: 'Assess your understanding of React hooks, component lifecycle, state management, and modern patterns.',
      difficulty: 'intermediate',
      icon: '⚛️',
      timeLimitMinutes: 15,
      passingScore: 60,
      questions: [
        {
          questionText: 'Which hook is used to manage side effects in a functional component?',
          options: [
            { label: 'useState', value: 'useState' },
            { label: 'useEffect', value: 'useEffect' },
            { label: 'useContext', value: 'useContext' },
            { label: 'useReducer', value: 'useReducer' }
          ],
          correctAnswer: 'useEffect',
          explanation: 'useEffect is the hook for performing side effects such as data fetching, subscriptions, or DOM mutations.',
          points: 1
        },
        {
          questionText: 'What is the virtual DOM?',
          options: [
            { label: 'A DOM implementation that runs in a web worker', value: 'worker' },
            { label: 'A lightweight in-memory representation of the real DOM that React uses for efficient updates', value: 'virtual' },
            { label: 'A shadow DOM implementation', value: 'shadow' },
            { label: 'A server-side DOM rendering technique', value: 'ssr' }
          ],
          correctAnswer: 'virtual',
          explanation: 'The virtual DOM is an in-memory representation. React diffs changes against it and batch-updates the real DOM for performance.',
          points: 1
        },
        {
          questionText: 'What does the useCallback hook do?',
          options: [
            { label: 'Calls a function immediately', value: 'call' },
            { label: 'Memoizes a callback function so it is not recreated on every render', value: 'memoize' },
            { label: 'Creates a ref to a DOM element', value: 'ref' },
            { label: 'Subscribes to a context value', value: 'context' }
          ],
          correctAnswer: 'memoize',
          explanation: 'useCallback returns a memoized version of the callback that only changes if one of the dependencies has changed.',
          points: 2
        },
        {
          questionText: 'In React, keys in lists should be:',
          options: [
            { label: 'Random numbers', value: 'random' },
            { label: 'The array index (always)', value: 'index' },
            { label: 'Stable, unique identifiers among siblings', value: 'unique' },
            { label: 'The component name', value: 'name' }
          ],
          correctAnswer: 'unique',
          explanation: 'Keys help React identify which items have changed. They should be stable and unique among siblings.',
          points: 1
        },
        {
          questionText: 'What pattern does React.lazy() enable?',
          options: [
            { label: 'Lazy evaluation of state', value: 'state' },
            { label: 'Code splitting / dynamic import of components', value: 'splitting' },
            { label: 'Lazy initialization of hooks', value: 'hooks' },
            { label: 'Deferred rendering of animations', value: 'animation' }
          ],
          correctAnswer: 'splitting',
          explanation: 'React.lazy() lets you render a dynamically imported component, enabling code splitting at the route level.',
          points: 1
        }
      ]
    },
    {
      title: 'Node.js Backend',
      skill: 'Node.js',
      description: 'Test your Node.js knowledge covering the event loop, modules, streams, Express, and async patterns.',
      difficulty: 'intermediate',
      icon: '🟩',
      timeLimitMinutes: 15,
      passingScore: 60,
      questions: [
        {
          questionText: 'What is the Node.js event loop?',
          options: [
            { label: 'A loop that processes DOM events', value: 'dom' },
            { label: 'A mechanism that allows Node.js to perform non-blocking I/O by offloading operations to the OS kernel', value: 'event-loop' },
            { label: 'A for loop that runs continuously', value: 'for-loop' },
            { label: 'A timer function', value: 'timer' }
          ],
          correctAnswer: 'event-loop',
          explanation: 'The event loop allows Node.js to handle I/O operations asynchronously despite being single-threaded.',
          points: 2
        },
        {
          questionText: 'Which module is used to create an HTTP server in Node.js?',
          options: [
            { label: 'fs', value: 'fs' },
            { label: 'http', value: 'http' },
            { label: 'path', value: 'path' },
            { label: 'net', value: 'net' }
          ],
          correctAnswer: 'http',
          explanation: 'The http module provides functionality to create HTTP servers and clients.',
          points: 1
        },
        {
          questionText: 'What does middleware do in Express.js?',
          options: [
            { label: 'Serves static files only', value: 'static' },
            { label: 'Functions that have access to req, res, and next, executing during the request-response cycle', value: 'middleware' },
            { label: 'Manages database connections', value: 'db' },
            { label: 'Handles WebSocket connections', value: 'ws' }
          ],
          correctAnswer: 'middleware',
          explanation: 'Middleware functions execute during the request-response lifecycle and can modify req/res or end the cycle.',
          points: 1
        },
        {
          questionText: 'What is the purpose of package.json?',
          options: [
            { label: 'Stores application logs', value: 'logs' },
            { label: 'Defines project metadata, scripts, and dependency versions', value: 'metadata' },
            { label: 'Compiles JavaScript to machine code', value: 'compile' },
            { label: 'Manages environment variables', value: 'env' }
          ],
          correctAnswer: 'metadata',
          explanation: 'package.json holds project information, scripts, dependency declarations, and configuration.',
          points: 1
        },
        {
          questionText: 'What is a stream in Node.js?',
          options: [
            { label: 'A video streaming protocol', value: 'video' },
            { label: 'An abstract interface for working with data that can be read or written in chunks', value: 'stream' },
            { label: 'A console output method', value: 'console' },
            { label: 'A database query result', value: 'query' }
          ],
          correctAnswer: 'stream',
          explanation: 'Streams allow reading/writing data piece by piece without loading entire files into memory.',
          points: 1
        }
      ]
    },
    {
      title: 'Python Basics',
      skill: 'Python',
      description: 'Evaluate your Python fundamentals including data types, list comprehensions, OOP, and standard library usage.',
      difficulty: 'beginner',
      icon: '🐍',
      timeLimitMinutes: 12,
      passingScore: 60,
      questions: [
        {
          questionText: 'What is the output of: print(type([]))?',
          options: [
            { label: "<class 'array'>", value: 'array' },
            { label: "<class 'list'>", value: 'list' },
            { label: "<class 'tuple'>", value: 'tuple' },
            { label: "<class 'dict'>", value: 'dict' }
          ],
          correctAnswer: 'list',
          explanation: '[] creates an empty list in Python, so type([]) returns <class \'list\'>.',
          points: 1
        },
        {
          questionText: 'Which keyword is used to define a function in Python?',
          options: [
            { label: 'function', value: 'function' },
            { label: 'func', value: 'func' },
            { label: 'def', value: 'def' },
            { label: 'fn', value: 'fn' }
          ],
          correctAnswer: 'def',
          explanation: 'The def keyword is used to define functions in Python.',
          points: 1
        },
        {
          questionText: 'What does a list comprehension do?',
          options: [
            { label: 'Sorts a list', value: 'sort' },
            { label: 'Creates a new list by applying an expression to each item in an iterable', value: 'comprehension' },
            { label: 'Deletes items from a list', value: 'delete' },
            { label: 'Converts a list to a tuple', value: 'tuple' }
          ],
          correctAnswer: 'comprehension',
          explanation: 'List comprehensions provide a concise syntax: [expression for item in iterable if condition].',
          points: 1
        }
      ]
    },
    {
      title: 'SQL Mastery',
      skill: 'SQL',
      description: 'Test your SQL skills covering queries, joins, aggregations, subqueries, and database design concepts.',
      difficulty: 'advanced',
      icon: '🗃️',
      timeLimitMinutes: 20,
      passingScore: 70,
      questions: [
        {
          questionText: 'What is the difference between INNER JOIN and LEFT JOIN?',
          options: [
            { label: 'They are identical', value: 'same' },
            { label: 'INNER JOIN returns only matching rows; LEFT JOIN returns all left table rows plus matching right rows', value: 'left' },
            { label: 'LEFT JOIN is faster than INNER JOIN', value: 'faster' },
            { label: 'INNER JOIN works with 3+ tables; LEFT JOIN works with only 2', value: 'tables' }
          ],
          correctAnswer: 'left',
          explanation: 'INNER JOIN returns rows that have matching values in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right.',
          points: 2
        },
        {
          questionText: 'Which SQL clause is used to filter groups?',
          options: [
            { label: 'WHERE', value: 'where' },
            { label: 'HAVING', value: 'having' },
            { label: 'GROUP BY', value: 'groupby' },
            { label: 'ORDER BY', value: 'orderby' }
          ],
          correctAnswer: 'having',
          explanation: 'HAVING filters groups created by GROUP BY, while WHERE filters individual rows before grouping.',
          points: 1
        },
        {
          questionText: 'What does ACID stand for in database transactions?',
          options: [
            { label: 'Automated, Concurrent, Isolated, Durable', value: 'wrong1' },
            { label: 'Atomicity, Consistency, Isolation, Durability', value: 'acid' },
            { label: 'Asynchronous, Cached, Indexed, Distributed', value: 'wrong2' },
            { label: 'Abstract, Compiled, Integrated, Dynamic', value: 'wrong3' }
          ],
          correctAnswer: 'acid',
          explanation: 'ACID properties guarantee reliable processing of database transactions.',
          points: 2
        }
      ]
    }
  ];

  await SkillAssessment.insertMany(assessments);
  return { seeded: true, count: assessments.length };
};
