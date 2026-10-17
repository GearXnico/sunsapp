interface LoadingScreenProps {
  place: string;
}

// A small sun that turns inside the card while the search runs.
function LoadingScreen({ place }: LoadingScreenProps) {
  return (
    <div className="loading" role="status">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="8" />
        <path d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M8 32l3.5-3.5M28.5 11.5L32 8" />
      </svg>
      <span>Looking up the sun for {place}…</span>
    </div>
  );
}

export default LoadingScreen;
