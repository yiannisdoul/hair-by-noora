import { handleCreateCheckoutSession } from './api/create-checkout-session.js';
import { handleStripeWebhook } from './api/stripe-webhook.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, stripe-signature, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (!env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured');
      }

      if (request.method === 'POST' && pathname === '/api/create-checkout-session') {
        const response = await handleCreateCheckoutSession({ request, env });
        return appendCorsHeaders(response);
      }

      if (request.method === 'POST' && pathname === '/api/stripe-webhook') {
        if (!env.STRIPE_WEBHOOK_SECRET) {
          throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }
        const response = await handleStripeWebhook({ request }, env); // Pass env separately
        return appendCorsHeaders(response);
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

function appendCorsHeaders(response) {
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
