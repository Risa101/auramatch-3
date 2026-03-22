import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFCFB] px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D23669]">AuraMatch</p>
          <h2 className="mt-4 text-2xl font-[900] tracking-tight text-[#1A1A1A]">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-500">เกิดข้อผิดพลาดบางอย่าง กรุณารีเฟรชหน้าเว็บ</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-[#1A1A1A] px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white transition hover:bg-[#D23669]"
          >
            Refresh Page
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 max-w-xl overflow-x-auto rounded-xl bg-gray-100 p-4 text-left text-xs text-gray-700">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
