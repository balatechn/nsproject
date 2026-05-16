import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign In — NsProject' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {children}
    </div>
  );
}
