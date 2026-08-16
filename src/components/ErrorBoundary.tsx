import {Component, type ErrorInfo, type ReactNode} from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Catches runtime errors anywhere in the tree so a single component crash
 * blanks the fallback screen instead of the whole app.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {hasError: false, message: ''};

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {hasError: true, message: error instanceof Error ? error.message : String(error)};
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
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
            <p className="font-mono text-[10px] text-slate-400 leading-relaxed break-words">
              {this.state.message || 'Something went wrong rendering this screen.'}
            </p>
            <button
              onClick={() => {
                this.setState({hasError: false, message: ''});
                window.location.reload();
              }}
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
