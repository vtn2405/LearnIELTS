"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Something went wrong</h2>
      <p style={{ color: "#666", margin: "1rem 0" }}>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
