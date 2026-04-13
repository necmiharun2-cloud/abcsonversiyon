import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: unknown;
};

function stringifyError(err: unknown) {
  if (err instanceof Error) return `${err.name}: ${err.message}\n${err.stack || ''}`.trim();
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // keep console error so Vercel logs + browser console show it
    console.error('[AppErrorBoundary]', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#111218] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#1a1b23] p-6">
          <div className="text-lg font-extrabold mb-2">Uygulama yüklenirken hata oluştu</div>
          <div className="text-sm text-gray-300 mb-4">
            Bu ekran, “boş sayfa” yerine gerçek hatayı göstermek için eklendi. Aşağıdaki metni kopyalayıp gönderirsen sorunu net yakalarız.
          </div>
          <pre className="text-[12px] whitespace-pre-wrap break-words bg-black/30 border border-white/10 rounded-xl p-4 text-gray-200 max-h-[50vh] overflow-auto">
            {stringifyError(this.state.error)}
          </pre>
          <div className="mt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }
}

