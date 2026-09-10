import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Chalk Talk crashed', error, info.componentStack);
  }

  retry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div className="error-screen" role="alert">
        <p className="error-screen-mark">Chalk Talk</p>
        <h1 className="error-screen-title">Something went wrong</h1>
        <p className="error-screen-body">Reload the page to keep practicing. Your timer settings are still saved.</p>
        <button type="button" className="btn primary" onClick={this.retry}>
          Try again
        </button>
      </div>
    );
  }
}
