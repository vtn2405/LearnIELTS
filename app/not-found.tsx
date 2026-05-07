import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>404 — Page Not Found</h2>
      <Link href="/">Go back to Dashboard</Link>
    </div>
  );
}
