import { Upload, CheckCircle2, CircleAlert, FileText, ExternalLink } from 'lucide-react';
import { Spinner } from '../ui';

/**
 * Resume PDF file upload card component.
 */
export default function ResumeUploader({
  resumeUrl,
  onResumeUpload,
  resumeUploadStatus,
  resumeUploadError,
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onResumeUpload(file);
  };

  return (
    <div className="profile-card resume-upload-card">
      <h2>Resume Attachment</h2>
      <p
        className="card-description"
        style={{
          color: 'var(--color-text-secondary)',
          marginBottom: '20px',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        Upload your resume in PDF format (maximum size 5MB). This resume is snapshotted and attached
        to all future applications.
      </p>

      <div className="resume-uploader-area">
        <Upload size={36} className="upload-icon" />
        <div>
          <input
            type="file"
            id="resume-file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden-file-input"
          />
          <label htmlFor="resume-file" className="btn btn-outline upload-file-btn">
            Choose PDF Resume
          </label>
        </div>

        {resumeUploadStatus === 'uploading' && (
          <div className="upload-loader">
            <Spinner size="sm" label="Uploading PDF file..." />
            <p>Uploading PDF file...</p>
          </div>
        )}

        {resumeUploadStatus === 'success' && (
          <p
            className="success-text"
            style={{
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            <CheckCircle2 size={16} /> File uploaded successfully!
          </p>
        )}

        {resumeUploadStatus === 'error' && (
          <p
            className="error-text"
            style={{
              color: 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            <CircleAlert size={16} /> {resumeUploadError}
          </p>
        )}
      </div>

      {resumeUrl && (
        <div
          className="current-resume-card"
          style={{
            marginTop: '20px',
            padding: '16px',
            background: 'var(--color-bg)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="meta-item" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <FileText size={24} style={{ color: 'var(--color-primary)' }} />
            <div>
              <strong style={{ fontSize: '14px', display: 'block' }}>Active resume file:</strong>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="resume-link"
                style={{
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: '600',
                }}
              >
                View uploaded resume <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
