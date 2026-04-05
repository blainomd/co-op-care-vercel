/**
 * FeatureErrorBoundary — Granular error boundary for individual features
 *
 * Unlike the top-level ErrorBoundary in App.tsx (which catches everything),
 * this component wraps individual feature modules to:
 * 1. Prevent one feature's crash from taking down the whole app
 * 2. Show contextual error messages with feature name
 * 3. Offer retry without full page reload
 * 4. Log errors with feature context for debugging
 */
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  /** Feature name for error context (e.g., "Care Plan Builder") */
  feature: string;
  /** Optional: where to navigate on "Go Back" */
  fallbackHref?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[CareOS:${this.props.feature}] Error:`, error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-lg px-6 py-12 text-center" role="alert">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zone-red/10">
            <svg
              className="h-6 w-6 text-zone-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="font-heading text-base font-semibold text-text-primary">
            {this.props.feature} encountered an issue
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {this.state.error?.message || 'Something unexpected happened. Please try again.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={this.handleRetry}
              className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-sage/40"
            >
              Try Again
            </button>
            <a
              href={this.props.fallbackHref || '#/'}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-warm-gray focus:outline-none focus:ring-2 focus:ring-sage/40"
            >
              Go Back
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
