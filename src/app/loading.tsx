export default function Loading() {
  return (
    <main className="loading-shell" aria-label="Loading LifeHub">
      <div className="loading-main">
        <div className="loading-inner">
          <div className="skeleton loading-eyebrow" />
          <div className="skeleton loading-title" />
          <div className="skeleton loading-copy" />
          <div className="loading-grid">
            <div className="skeleton loading-card" />
            <div className="skeleton loading-card small" />
          </div>
        </div>
      </div>
    </main>
  );
}