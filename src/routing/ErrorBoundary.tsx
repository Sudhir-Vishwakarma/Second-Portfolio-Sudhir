import React from 'react';

interface Props { onError: () => void; children: React.ReactNode }
interface State { failed: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Multiverse crashed, switching to the classic site:', error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
