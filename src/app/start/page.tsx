// src/app/start/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle, ArrowRight } from 'lucide-react';

function StartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || 'KEN-001';
  const clientId = searchParams.get('client');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [repName, setRepName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function validateReferral() {
      try {
        const res = await fetch(`/api/referral/${refCode}`);
        const data = await res.json();

        if (isMounted) {
          if (data.success) {
            setStatus('success');
            setRepName(data.data.name);

            // Redirect after 2 seconds to intake form
            setTimeout(() => {
              if (isMounted) {
                const targetUrl = clientId
                  ? `/request-project?client=${encodeURIComponent(clientId)}`
                  : '/request-project';
                router.push(targetUrl);
              }
            }, 2000);
          } else {
            setStatus('error');
          }
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
        }
      }
    }

    validateReferral();

    return () => {
      isMounted = false;
    };
  }, [refCode, clientId, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-700">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Connecting to CodeBridge</h1>
            <p className="text-slate-400">Verifying representative authorization ({refCode})...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to CodeBridge!</h1>
            <p className="text-slate-300 mb-4">
              You are working with <span className="font-semibold text-cyan-400">{repName}</span>.
            </p>
            <p className="text-sm text-slate-500 mb-6">Redirecting you to the project intake form...</p>
            <button
              onClick={() => {
                const targetUrl = clientId ? `/request-project?client=${encodeURIComponent(clientId)}` : '/request-project';
                router.push(targetUrl);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
              Continue Now <ArrowRight size={16} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <XCircle className="w-16 h-16 text-rose-400 mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Direct Intake</h1>
            <p className="text-slate-300 mb-6">
              Proceeding directly with CodeBridge Digital Services.
            </p>
            <button
              onClick={() => router.push('/request-project')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
              Start Project Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
      <StartContent />
    </Suspense>
  );
}
