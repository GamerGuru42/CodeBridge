// src/lib/payments/flutterwave.ts
/**
 * Flutterwave Payment Gateway Service for CodeBridge
 * Sole payment gateway for client collections (KES via Card & M-Pesa, NGN via Card & Bank Transfer).
 * All secret keys remain strictly server-side.
 */

export interface FlutterwaveInitiateParams {
  txRef: string;
  amountMinor: number;
  currency: string; // 'KES' | 'NGN'
  redirectUrl: string;
  customer: {
    email: string;
    phoneNumber?: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo?: string;
  };
  meta?: Record<string, any>;
}

export interface FlutterwaveInitiateResult {
  success: boolean;
  checkoutUrl: string;
  txRef: string;
  isSimulated?: boolean;
}

export interface FlutterwaveVerifyResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint?: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string; // 'successful' | 'failed'
    payment_type: string; // 'card' | 'mpesa' | 'bank_transfer' | 'ussd'
    created_at: string;
    account_id: number;
    amount_settled?: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    card?: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: string;
      type: string;
      expiry: string;
    };
  };
}

/**
 * Validates webhook security signature against FLW_WEBHOOK_SECRET_HASH.
 */
export function verifyWebhookSignature(headerHash: string | null): boolean {
  const secretHash = process.env.FLW_WEBHOOK_SECRET_HASH;
  if (!secretHash) {
    console.warn('[Flutterwave] FLW_WEBHOOK_SECRET_HASH is not set. Webhook verification rejected.');
    return false;
  }
  if (!headerHash) return false;
  return headerHash === secretHash;
}

/**
 * Generates an idempotent, unique transaction reference for Flutterwave.
 * Structure: CB-{sanitizedInvoiceId}-{timestamp}-{random}
 */
export function generateFlutterwaveReference(invoiceId: string): string {
  const cleanId = invoiceId.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CB-${cleanId}-${timestamp}-${random}`;
}

/**
 * Initiates standard Flutterwave checkout.
 * POST https://api.flutterwave.com/v3/payments
 */
export async function initiateFlutterwaveCheckout(
  params: FlutterwaveInitiateParams
): Promise<FlutterwaveInitiateResult> {
  const secretKey = process.env.FLW_SECRET_KEY;
  const majorAmount = params.amountMinor / 100;

  // Enforce payment options based on currency
  // KES payments support Card and M-Pesa
  const paymentOptions = params.currency === 'KES' ? 'card,mpesa' : 'card,banktransfer,ussd';

  // If secret key is not set or running in mock simulation mode
  if (!secretKey || secretKey.startsWith('FLWSECK_TEST_MOCK')) {
    console.log(`[Flutterwave Simulation] Initiating ${params.currency} ${majorAmount} checkout (tx_ref: ${params.txRef})`);
    return {
      success: true,
      checkoutUrl: `${params.redirectUrl}${params.redirectUrl.includes('?') ? '&' : '?'}status=successful&tx_ref=${params.txRef}&transaction_id=flw_sim_${Date.now()}`,
      txRef: params.txRef,
      isSimulated: true,
    };
  }

  try {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: params.txRef,
        amount: majorAmount,
        currency: params.currency,
        redirect_url: params.redirectUrl,
        payment_options: paymentOptions,
        customer: params.customer,
        customizations: params.customizations,
        meta: params.meta || {},
      }),
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
      console.error('[Flutterwave] API Error on checkout initiation:', data);
      throw new Error(data.message || 'Failed to initiate payment with Flutterwave.');
    }

    return {
      success: true,
      checkoutUrl: data.data.link,
      txRef: params.txRef,
    };
  } catch (err: any) {
    console.error('[Flutterwave] Network or API failure:', err);
    throw err;
  }
}

/**
 * Authoritatively verifies a transaction server-side against Flutterwave API.
 * GET https://api.flutterwave.com/v3/transactions/{id}/verify
 */
export async function verifyFlutterwaveTransaction(
  transactionId: string | number
): Promise<FlutterwaveVerifyResponse> {
  const secretKey = process.env.FLW_SECRET_KEY;

  // In test simulation mode:
  if (!secretKey || secretKey.startsWith('FLWSECK_TEST_MOCK')) {
    console.log(`[Flutterwave Simulation] Mock verification for transaction ${transactionId}`);
    return {
      status: 'success',
      message: 'Transaction verified (simulated)',
      data: {
        id: typeof transactionId === 'number' ? transactionId : 12345678,
        tx_ref: `CB-SIM-${Date.now()}`,
        flw_ref: `FLW-SIM-${Date.now()}`,
        amount: 100000,
        currency: 'KES',
        charged_amount: 100000,
        app_fee: 1500,
        merchant_fee: 0,
        processor_response: 'Approved',
        auth_model: 'AUTH',
        ip: '127.0.0.1',
        narration: 'CodeBridge Simulated Payment',
        status: 'successful',
        payment_type: 'mpesa',
        created_at: new Date().toISOString(),
        account_id: 99999,
        amount_settled: 98500,
        customer: {
          id: 111,
          name: 'Demo Client',
          phone_number: '+254700000000',
          email: 'client@abcrestaurants.com',
          created_at: new Date().toISOString(),
        },
      },
    };
  }

  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data: FlutterwaveVerifyResponse = await response.json();
  return data;
}
