import assert from 'node:assert/strict';
import test from 'node:test';

// Set env vars BEFORE importing the app so env.js validates them.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-with-at-least-thirty-two-chars';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsprint_test_health';

const { default: app } = await import('../src/app.js');
import { markReady, markShuttingDown } from '../src/config/health.js';

test('health probes reflect the application lifecycle', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  t.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const liveResponse = await fetch(`${baseUrl}/health/live`);
  assert.equal(liveResponse.status, 200);

  const startingResponse = await fetch(`${baseUrl}/health/ready`);
  assert.equal(startingResponse.status, 503);

  markReady();
  const readyResponse = await fetch(`${baseUrl}/health/ready`);
  assert.equal(readyResponse.status, 200);

  markShuttingDown();
  const stoppingResponse = await fetch(`${baseUrl}/health/ready`);
  assert.equal(stoppingResponse.status, 503);
});
