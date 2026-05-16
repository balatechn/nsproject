import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Return Home</Link>
    </div>
  );
}
