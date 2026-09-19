import { Suspense } from 'react';
import PaymentPage from '@/components/PaymentPage';

export default function Home() {
  return (
    <Suspense fallback={<PaymentPageSkeleton />}>
      <PaymentPage />
    </Suspense>
  );
}

function PaymentPageSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] mx-auto">
        <div
          className="rounded-[24px] p-6 space-y-6 animate-pulse"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--bg-elevated)' }} />
          <div className="h-12 w-48 mx-auto rounded" style={{ backgroundColor: 'var(--bg-elevated)' }} />
          <div className="h-14 w-full rounded-2xl" style={{ backgroundColor: 'var(--bg-elevated)' }} />
        </div>
      </div>
    </div>
  );
}
