import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error boundary that catches render errors and shows a fallback UI
 * instead of crashing the entire application.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<CustomFallback />}>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <div className="error-boundary-fallback">
          <div className="error-boundary-content">
            <AlertTriangle size={48} className="error-boundary-icon" />
            <h2>Something went wrong</h2>
            <p>An unexpected error occurred. Please try refreshing the page.</p>
            {this.state.error && (
              <details className="error-boundary-details">
                <summary>Error details</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}
            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
