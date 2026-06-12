import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null indicates anonymous actions (e.g. login failures before user is recognized)
  },
  action: {
    type: String,
    required: [true, 'Action description is required'],
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  }
}, {
  // Only track createdAt as logs are write-once records
  timestamps: { createdAt: true, updatedAt: false }
});

// Static log helper for server-wide audit entries
auditLogSchema.statics.logEvent = function({ userId = null, action, details = {}, severity = 'info', ipAddress = '', userAgent = '' }) {
  return this.create({
    userId,
    action,
    details,
    severity,
    ipAddress,
    userAgent
  });
};

// Indexes
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
