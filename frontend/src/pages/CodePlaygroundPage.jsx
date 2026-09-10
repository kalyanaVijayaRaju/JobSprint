import { useState, useEffect } from 'react';
import { codePlaygroundApi } from '../api/client.js';

const SAMPLE_PROBLEMS = [
  {
    title: 'LRU Cache Implementation',
    difficulty: 'Medium',
    defaultCode: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, val);\n    return val;\n  }\n  put(key, value) {\n    if (this.cache.has(key)) this.cache.delete(key);\n    else if (this.cache.size >= this.capacity) {\n      this.cache.delete(this.cache.keys().next().value);\n    }\n    this.cache.set(key, value);\n  }\n}`
  },
  {
    title: 'Debounce Function',
    difficulty: 'Easy',
    defaultCode: `function debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}`
  },
  {
    title: 'Async Task Queue with Concurrency Limit',
    difficulty: 'Hard',
    defaultCode: `class TaskQueue {\n  constructor(concurrency) {\n    this.concurrency = concurrency;\n    this.running = 0;\n    this.queue = [];\n  }\n  add(task) {\n    return new Promise((resolve, reject) => {\n      this.queue.push({ task, resolve, reject });\n      this.next();\n    });\n  }\n  next() {\n    while (this.running < this.concurrency && this.queue.length) {\n      const { task, resolve, reject } = this.queue.shift();\n      this.running++;\n      task().then(resolve).catch(reject).finally(() => {\n        this.running--;\n        this.next();\n      });\n    }\n  }\n}`
  }
];

export default function CodePlaygroundPage() {
  const [selectedProblem, setSelectedProblem] = useState(SAMPLE_PROBLEMS[0]);
  const [code, setCode] = useState(SAMPLE_PROBLEMS[0].defaultCode);
  const [submissions, setSubmissions] = useState([]);
  const [running, setRunning] = useState(false);
  const [latestResult, setLatestResult] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await codePlaygroundApi.getSubmissions();
      if (res.data) setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectProblem = (prob) => {
    setSelectedProblem(prob);
    setCode(prob.defaultCode);
    setLatestResult(null);
  };

  const handleRunCode = async () => {
    try {
      setRunning(true);
      const res = await codePlaygroundApi.runCode({
        problemTitle: selectedProblem.title,
        language: 'javascript',
        code
      });
      if (res.data) {
        setLatestResult(res.data);
        setSubmissions([res.data, ...submissions]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' }}>
          ⚡ Live Code Sandbox & Assessment Playground
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
          Interactive code editor for technical interviews, algorithm challenges, and automated execution testing.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        {/* Left Column: Problem List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#cbd5e1', margin: '0 0 4px' }}>Select Challenge</h3>
          {SAMPLE_PROBLEMS.map((prob, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectProblem(prob)}
              style={{
                padding: 16, borderRadius: 12, cursor: 'pointer',
                background: selectedProblem.title === prob.title ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.7)',
                border: `1px solid ${selectedProblem.title === prob.title ? '#6366f1' : 'rgba(148,163,184,0.1)'}`
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{prob.title}</div>
              <span style={{ fontSize: 11, color: prob.difficulty === 'Easy' ? '#34d399' : prob.difficulty === 'Medium' ? '#facc15' : '#f87171', fontWeight: 600, marginTop: 6, display: 'inline-block' }}>
                {prob.difficulty}
              </span>
            </div>
          ))}

          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#cbd5e1', margin: '16px 0 4px' }}>Submission History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
            {submissions.map((sub) => (
              <div key={sub._id} style={{ padding: 12, borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#f1f5f9' }}>
                  <span>{sub.problemTitle}</span>
                  <span style={{ color: sub.status === 'Passed' ? '#34d399' : '#f87171', fontWeight: 600 }}>{sub.status}</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Passed {sub.testCasesPassed}/{sub.totalTestCases} tests • {sub.executionTimeMs}ms
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Code Editor & Console Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(15,23,42,0.9)', borderRadius: 16, padding: 20, border: '1px solid rgba(148,163,184,0.15)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#38bdf8' }}>
                JS Code Sandbox — {selectedProblem.title}
              </div>
              <button
                onClick={handleRunCode}
                disabled={running}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer'
                }}
              >
                {running ? 'Executing...' : '▶ Run & Test Code'}
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              style={{
                width: '100%', fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 13,
                background: '#090d16', color: '#38bdf8', padding: 16, borderRadius: 10,
                border: '1px solid rgba(56,189,248,0.2)', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5
              }}
            />
          </div>

          {latestResult && (
            <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 16, padding: 20, border: `1px solid ${latestResult.status === 'Passed' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{latestResult.status === 'Passed' ? '🎉' : '❌'}</span>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: latestResult.status === 'Passed' ? '#34d399' : '#f87171', margin: 0 }}>
                    Execution Result: {latestResult.status}
                  </h4>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    Score: {latestResult.score}/100 • Execution Time: {latestResult.executionTimeMs} ms
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#cbd5e1', background: 'rgba(15,23,42,0.6)', padding: 12, borderRadius: 8 }}>
                ✅ Passed {latestResult.testCasesPassed} out of {latestResult.totalTestCases} automated unit test assertions.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
