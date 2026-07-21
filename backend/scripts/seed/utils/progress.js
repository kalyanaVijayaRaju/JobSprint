/**
 * CLI progress logging utility for seed scripts.
 * Provides visual feedback during long-running seed operations.
 */

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
};

/**
 * Creates a progress tracker for a seed operation.
 * @param {string} label - Name of the seed phase (e.g., "Companies")
 * @param {number} total - Total number of records to seed
 * @returns {object} Progress tracker with update() and finish() methods
 */
export const createProgress = (label, total) => {
  const startTime = Date.now();
  let current = 0;

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  const render = () => {
    const percent = Math.round((current / total) * 100);
    const elapsed = Date.now() - startTime;
    const rate = current / (elapsed / 1000) || 0;
    const eta = current > 0 ? formatTime(((total - current) / rate) * 1000) : '—';

    const barWidth = 30;
    const filled = Math.round((percent / 100) * barWidth);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

    process.stdout.write(
      `\r  ${COLORS.cyan}${label}${COLORS.reset} ${COLORS.dim}[${bar}]${COLORS.reset} ` +
      `${COLORS.bright}${percent}%${COLORS.reset} ` +
      `${COLORS.dim}(${current.toLocaleString()}/${total.toLocaleString()})${COLORS.reset} ` +
      `${COLORS.dim}ETA: ${eta}${COLORS.reset}   `
    );
  };

  return {
    /**
     * Increment the progress counter.
     * @param {number} [count=1] - Number of records completed
     */
    update(count = 1) {
      current += count;
      if (current > total) current = total;
      render();
    },

    /**
     * Mark the operation as complete and print summary.
     */
    finish() {
      current = total;
      const elapsed = formatTime(Date.now() - startTime);
      process.stdout.write(
        `\r  ${COLORS.green}✔${COLORS.reset} ${COLORS.bright}${label}${COLORS.reset} ` +
        `${COLORS.green}${total.toLocaleString()} records${COLORS.reset} ` +
        `${COLORS.dim}in ${elapsed}${COLORS.reset}` +
        ' '.repeat(30) + '\n'
      );
    },
  };
};

/**
 * Prints a styled section header for a seed phase.
 * @param {string} title - Section title
 */
export const printHeader = (title) => {
  const line = '─'.repeat(50);
  console.log(`\n${COLORS.blue}${line}${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.blue}  🌱 ${title}${COLORS.reset}`);
  console.log(`${COLORS.blue}${line}${COLORS.reset}\n`);
};

/**
 * Prints a styled summary when all seeding is complete.
 * @param {number} startTime - Timestamp from Date.now() at script start
 */
export const printSummary = (startTime) => {
  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.round((elapsed % 60000) / 1000);

  console.log(`\n${COLORS.bgGreen}${COLORS.white}${COLORS.bright}`);
  console.log(`  ✅ DATABASE SEEDING COMPLETE  `);
  console.log(`${COLORS.reset}`);
  console.log(`${COLORS.dim}  Total time: ${minutes}m ${seconds}s${COLORS.reset}\n`);
};
