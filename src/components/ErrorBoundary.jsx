import { Component } from 'react';
import Button from './ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
          <p className="max-w-md text-sm text-slate-600">
            The page hit an unexpected error. Reload to try again.
          </p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
