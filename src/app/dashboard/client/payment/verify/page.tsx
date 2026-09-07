// src/app/dashboard/client/payment/verify/page.tsx
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const invoiceId = searchParams.get('invoice_id');
  const txRef = searchParams.get('tx_ref');
  const transactionId = searchParams.get('transaction_id');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'ERROR';
    message?: string;
    invoice?: any;
    payment?: any;
  }>({ status: 'PENDING' });

  useEffect(() => {
    async function verifyPayment() {
      if (!invoiceId && !txRef) {
        setLoading(false);
        setResult({
          status: 'ERROR',
          message: 'Missing invoice or transaction reference in callback.',
        });
        return;
      }

      try {
        const query = new URLSearchParams();
        if (invoiceId) query.set('invoice_id', invoiceId);
        if (txRef) query.set('tx_ref', txRef);
        if (transactionId) query.set('transaction_id', transactionId);

        const res = await fetch(`/api/payments/flutterwave/verify?${query.toString()}`);
        const data = await res.json();

        if (res.ok && data.status === 'SUCCESSFUL') {
          setResult({
            status: 'SUCCESSFUL',
            invoice: data.invoice,
            payment: data.payment,
          });
        } else if (res.ok && data.status === 'FAILED') {
          setResult({
            status: 'FAILED',
            message: data.message || 'Payment transaction failed or was cancelled.',
          });
        } else {
          setResult({
            status: 'PENDING',
            message: data.message || 'Your payment confirmation is being finalized by Flutterwave.',
            invoice: data.invoice,
          });
        }
      } catch (err: any) {
        setResult({
          status: 'ERROR',
          message: 'Failed to contact payment verification service. Please refresh or check your dashboard.',
        });
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [invoiceId, txRef, transactionId]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-bold tracking-tight">Verifying Payment...</h2>
            <p className="text-sm text-neutral-400">
              Contacting Flutterwave server to confirm your transaction details. Please do not close this window.
            </p>
          </div>
        ) : result.status === 'SUCCESSFUL' ? (
          <div className="py-6 space-y-6">
            <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
                Authoritative Confirmation
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Payment Verified</h2>
              <p className="text-sm text-neutral-400 mt-1">
                Your payment has been confirmed server-side by Flutterwave.
              </p>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 text-left text-sm space-y-2.5">
              {result.invoice?.invoiceNumber && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Invoice:</span>
                  <span className="font-mono font-medium text-neutral-200">{result.invoice.invoiceNumber}</span>
                </div>
              )}
              {result.invoice?.amountMinor && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-400">
                    {result.invoice.currency} {(result.invoice.amountMinor / 100).toLocaleString()}
                  </span>
                </div>
              )}
              {txRef && (
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Reference:</span>
                  <span className="font-mono text-neutral-300 truncate max-w-[200px]">{txRef}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Gateway:</span>
                <span className="text-neutral-300 font-medium">Flutterwave (Card / M-Pesa)</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/dashboard/client"
                className="block w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold rounded-xl transition text-center shadow-lg shadow-emerald-500/20"
              >
                Return to Client Dashboard
              </Link>
            </div>
          </div>
        ) : result.status === 'PENDING' ? (
          <div className="py-6 space-y-6">
            <div className="w-16 h-16 bg-amber-950 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ⏳
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
                Settlement Pending
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Payment Processing</h2>
              <p className="text-sm text-neutral-400 mt-1">
                {result.message || 'Your payment is being confirmed with the Flutterwave / M-Pesa network.'}
              </p>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-400 text-left space-y-1.5">
              <p>• Mobile network confirmations (e.g. M-Pesa STK push) may take 1-2 minutes to settle.</p>
              <p>• Once verified, your invoice will automatically update to PAID.</p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl transition"
              >
                Check Status Again
              </button>
              <Link
                href="/dashboard/client"
                className="block w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-xl transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-6">
            <div className="w-16 h-16 bg-rose-950 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ✕
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
                Unsuccessful
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Payment Unsuccessful</h2>
              <p className="text-sm text-neutral-400 mt-1">
                {result.message || 'Your payment could not be verified or was cancelled.'}
              </p>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-400 text-left">
              <p>Your invoice remains outstanding and unpaid. No funds have been finalized for this transaction.</p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/dashboard/client"
                className="block w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-xl transition"
              >
                Back to Invoices & Try Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentVerifyContent />
    </Suspense>
  );
}
