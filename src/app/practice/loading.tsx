export default function PracticeLoading() {
  return (
    <main className="loading-shell" aria-label="Loading practice">
      <div className="loading-main">
        <div className="loading-inner">
          <div className="skeleton loading-eyebrow" />
          <div className="skeleton loading-title" />
          <div className="skeleton loading-copy" />
          <div className="skeleton loading-card" style={{ marginTop: 34 }} />
        </div>
      </div>
    </main>
  );
}