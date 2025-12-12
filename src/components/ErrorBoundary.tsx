import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _info: React.ErrorInfo) {
    // You can log the error to an external service here
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    setTimeout(() => {
      if (!this.state.hasError) return;
      window.location.reload();
    }, 500);
  };

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;

    return (
      <div style={{ minHeight: "100vh" }} className="flex items-center justify-center p-6 bg-white">
        <div className="max-w-2xl w-full rounded-lg border p-6 shadow">
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The application encountered an error while rendering. You can try to reload the page or go back
            to the main menu.
          </p>
          <div className="mb-4">
            <pre style={{ whiteSpace: "pre-wrap" }} className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-48">{this.state.error?.stack}</pre>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={this.handleReload}>
              Retry
            </button>
            <button className="px-4 py-2 rounded border" onClick={() => (window.location.href = "/")}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }
}
