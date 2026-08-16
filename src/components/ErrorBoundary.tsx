import {Component, type ErrorInfo, type ReactNode} from 'react';
import {captureError} from '../lib/sentry';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Shows a fallback for render and lifecycle errors in descendants instead of
 * blanking the app. React does not route event-handler, timer, or async
 * callback errors through an error boundary — those surface separately.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {hasError: false};

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {hasError: true};
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
    captureError(error, {componentStack: info.componentStack});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0B10] flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-zinc-900 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4">
            <div className="text-3xl">⚠️</div>
            <h1 className="font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
              Secure Terminal Fault
            </h1>
            <p className="font-mono text-[10px] text-slate-400 leading-relaxed">
              Something went wrong rendering this screen. Your session state is
              safe — restart to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-xl bg-[#00f0ff] hover:bg-cyan-400 text-slate-950 font-display text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Restart Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
