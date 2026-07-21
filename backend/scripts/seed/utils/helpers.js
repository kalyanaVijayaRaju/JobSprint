/**
 * Shared helper functions for seed data generation.
 * All utilities produce deterministic-style but randomized data
 * that respects the existing Mongoose schema constraints.
 */

/**
 * Returns a random element from an array.
 * @param {Array} arr - Source array
 * @returns {*} Random element
 */
export const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Returns N unique random elements from an array.
 * @param {Array} arr - Source array
 * @param {number} count - Number of unique elements to pick
 * @returns {Array} Array of unique random elements
 */
export const randomPicks = (arr, count) => {
  const safeCount = Math.min(count, arr.length);
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, safeCount);
};

/**
 * Returns a random integer between min and max (inclusive).
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Returns a random date between start and end dates.
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Date} Random date within range
 */
export const randomDate = (start, end) => {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return new Date(startMs + Math.random() * (endMs - startMs));
};

/**
 * Generates a valid Indian E.164 phone number.
 * Format: +91 followed by 10 digits starting with 6-9.
 * @returns {string} Phone number like +919876543210
 */
export const generatePhone = () => {
  const firstDigit = randomPick(['6', '7', '8', '9']);
  const rest = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  return `+91${firstDigit}${rest}`;
};

/**
 * Generates a realistic LinkedIn profile URL.
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} LinkedIn URL
 */
export const generateLinkedIn = (firstName, lastName) => {
  const slug = `${firstName}-${lastName}-${randomBetween(100, 999)}`.toLowerCase().replace(/\s+/g, '-');
  return `https://www.linkedin.com/in/${slug}`;
};

/**
 * Generates a realistic GitHub profile URL.
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} GitHub URL
 */
export const generateGitHub = (firstName, lastName) => {
  const styles = [
    () => `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    () => `${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    () => `${firstName.toLowerCase()}${randomBetween(10, 999)}`,
    () => `${firstName.toLowerCase()}_dev`,
  ];
  const username = randomPick(styles)();
  return `https://www.github.com/${username}`;
};

/**
 * Generates a unique email address.
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} domain - Email domain
 * @param {number} [index] - Optional index for guaranteed uniqueness
 * @returns {string} Email address
 */
export const generateEmail = (firstName, lastName, domain, index) => {
  const styles = [
    () => `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    () => `${firstName.toLowerCase()}${lastName.toLowerCase().charAt(0)}`,
    () => `${firstName.toLowerCase().charAt(0)}${lastName.toLowerCase()}`,
  ];

  const base = randomPick(styles)().replace(/\s+/g, '');
  const suffix = index !== undefined ? index : randomBetween(1, 9999);
  return `${base}${suffix}@${domain}`;
};

/**
 * Generates a realistic salary range in INR (annual LPA * 100000).
 * Returns values in absolute INR for the salaryRange.min/max fields.
 * @param {string} experienceLevel - One of: 'fresher', '1-3', '3-5', '5-8', '8+'
 * @returns {{ min: number, max: number }} Salary range in INR
 */
export const generateSalaryRange = (experienceLevel) => {
  const ranges = {
    'fresher': { minLPA: 3, maxLPA: 8 },
    '1-3':     { minLPA: 5, maxLPA: 15 },
    '3-5':     { minLPA: 10, maxLPA: 25 },
    '5-8':     { minLPA: 18, maxLPA: 40 },
    '8+':      { minLPA: 30, maxLPA: 70 },
  };

  const range = ranges[experienceLevel] || ranges['1-3'];
  const minLPA = randomBetween(range.minLPA, Math.floor((range.minLPA + range.maxLPA) / 2));
  const maxLPA = randomBetween(minLPA + 2, range.maxLPA);

  return {
    min: minLPA * 100000,
    max: maxLPA * 100000,
  };
};

/**
 * Generates a profile photo URL using UI Avatars.
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {object} [options] - Customization options
 * @param {string} [options.background] - Background color (hex without #)
 * @param {string} [options.color] - Text color (hex without #)
 * @param {number} [options.size] - Image size in pixels
 * @returns {string} Profile photo URL
 */
export const generateProfilePhoto = (firstName, lastName, options = {}) => {
  const { background = 'random', color = 'fff', size = 200 } = options;
  const name = encodeURIComponent(`${firstName} ${lastName}`);
  return `https://ui-avatars.com/api/?name=${name}&background=${background}&color=${color}&size=${size}&bold=true&format=png`;
};

/**
 * Inserts documents in batches using insertMany for performance.
 * Skips the Mongoose pre-save hooks (by design for seed performance).
 * @param {import('mongoose').Model} Model - Mongoose model
 * @param {Array} documents - Array of plain objects to insert
 * @param {object} [options] - Options
 * @param {number} [options.batchSize=500] - Documents per batch
 * @param {Function} [options.onProgress] - Callback after each batch (receives count)
 * @returns {Promise<Array>} Array of all inserted document IDs
 */
export const batchInsert = async (Model, documents, options = {}) => {
  const { batchSize = 500, onProgress } = options;
  const allIds = [];

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    const result = await Model.insertMany(batch, { ordered: false });
    const ids = result.map((doc) => doc._id);
    allIds.push(...ids);

    if (onProgress) {
      onProgress(batch.length);
    }
  }

  return allIds;
};

/**
 * Generates a realistic Indian IP address.
 * Uses common Indian ISP ranges.
 * @returns {string} IP address
 */
export const generateIPAddress = () => {
  const indianPrefixes = [
    '49.36', '49.37', '103.21', '106.51', '106.76',
    '122.161', '122.162', '157.33', '157.34', '182.64',
    '182.65', '183.82', '183.83', '202.142', '223.226',
    '223.227', '223.228', '223.229', '223.230', '223.231',
  ];
  const prefix = randomPick(indianPrefixes);
  return `${prefix}.${randomBetween(1, 254)}.${randomBetween(1, 254)}`;
};

/**
 * Returns a random realistic user agent string.
 * @returns {string} User-Agent header value
 */
export const generateUserAgent = () => {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  ];
  return randomPick(agents);
};

/**
 * Generates a website URL for a personal portfolio.
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Website URL
 */
export const generateWebsite = (firstName, lastName) => {
  const domains = ['dev', 'io', 'com', 'in', 'tech'];
  const slug = `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/\s+/g, '');
  return `https://${slug}.${randomPick(domains)}`;
};
