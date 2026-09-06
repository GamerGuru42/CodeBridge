'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export default function ReferralStartPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const { code } = use(params);
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [repName, setRepName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function validateReferral() {
      try {
        const res = await fetch(`/api/referral/${code}`);
        const data = await res.json();
        
        if (isMounted) {
          if (data.success) {
            setStatus('success');
            setRepName(data.data.name);
            // Redirect after a short delay so they see the success message
            setTimeout(() => {
              if (isMounted) {
                router.push('/request-project');
              }
            }, 2500);
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
  }, [code, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-700">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Applying Referral Code</h1>
            <p className="text-slate-400">Please wait a moment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">You're Invited!</h1>
            <p className="text-slate-300 mb-6">
              You've been successfully referred by <span className="font-semibold text-cyan-400">{repName}</span>.
            </p>
            <p className="text-sm text-slate-500">Redirecting you to our project intake form...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <XCircle className="w-16 h-16 text-rose-400 mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Code</h1>
            <p className="text-slate-300 mb-8">
              This referral code is invalid or no longer active. You can still request a project directly.
            </p>
            <button 
              onClick={() => router.push('/request-project')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
              Continue Anyway
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
