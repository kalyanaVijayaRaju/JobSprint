import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Toast alert overlay for success/error feedback messages.
 */
export default function Toast({ successMsg, errorMsg }) {
  if (!successMsg && !errorMsg) return null;

  return (
    <>
      {successMsg && (
        <div className="toast-alert success" role="status">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="toast-alert error" role="alert">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}
    </>
  );
}
