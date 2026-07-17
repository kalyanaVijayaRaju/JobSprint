import JobAlert from '../models/JobAlert.js';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import * as notificationService from './notificationService.js';

/**
 * Create a new job alert subscription for a candidate.
 *
 * @param {string} userId   - Candidate's authenticated user ID
 * @param {Object} data     - Validated alert filter options
 * @returns {Object} The created JobAlert document
 */
export const createAlert = async (userId, data) => {
  return await JobAlert.create({
    userId,
    ...data
  });
};

/**
 * List all job alert subscriptions of a candidate.
 *
 * @param {string} userId - Candidate's authenticated user ID
 * @returns {Array} List of JobAlert documents
 */
export const listAlerts = async (userId) => {
  return await JobAlert.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Delete a job alert subscription, verifying owner candidate authority.
 *
 * @param {string} alertId - The target alert subscription ID
 * @param {string} userId  - Candidate's authenticated user ID
 */
export const deleteAlert = async (alertId, userId) => {
  const alert = await JobAlert.findOneAndDelete({ _id: alertId, userId });
  if (!alert) {
    throw new ApiError(404, 'Job alert subscription not found');
  }
};

/**
 * Scan all active alerts and dispatch notifications if matching criteria.
 *
 * @param {Object} job - The newly created Job document
 */
export const dispatchJobAlerts = async (job) => {
  try {
    const activeAlerts = await JobAlert.find({ isActive: true }).populate('userId');
    if (!activeAlerts || activeAlerts.length === 0) return;

    for (const alert of activeAlerts) {
      // Check locationType match
      if (alert.locationType && alert.locationType !== job.locationType) {
        continue;
      }

      // Check jobType match
      if (alert.jobType && alert.jobType !== job.jobType) {
        continue;
      }

      // Check minSalary match (if minSalary set, verify job's max salary exceeds it)
      if (alert.minSalary > 0) {
        const jobMaxSalary = job.salaryRange?.max || 0;
        if (jobMaxSalary < alert.minSalary) {
          continue;
        }
      }

      // Check keyword match (matching against title, description, or skills)
      if (alert.keyword) {
        const textToSearch = `${job.title} ${job.description} ${job.skillsRequired?.join(' ')}`.toLowerCase();
        if (!textToSearch.includes(alert.keyword.toLowerCase())) {
          continue;
        }
      }

      // Candidate matches criteria! Trigger in-app notification
      const recipientId = alert.userId?._id || alert.userId;
      const title = `New Job Match: ${job.title}`;
      const message = `A new job matching your alert preferences was posted: ${job.title} (${job.jobType}) in ${job.location}`;
      
      await notificationService.createNotification(
        recipientId,
        title,
        message,
        'new_job'
      );

      // Print email mock log
      const recipientEmail = alert.userId?.email || 'Candidate';
      console.log(`[Email Dispatch Console] Sending job alert matching notification for "${job.title}" to "${recipientEmail}"`);
    }
  } catch (err) {
    console.error('Failed to scan and dispatch job alerts:', err);
  }
};
