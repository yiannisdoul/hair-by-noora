import { createCheckoutSession } from './api/create-checkout-session.js';
import { handleStripeWebhook } from './api/stripe-webhook.js';
import { handleCheckSession } from './api/check-session.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (url.pathname === '/api/create-checkout-session' && request.method === 'POST') {
      return createCheckoutSession(request, env);
    }

    if (url.pathname === '/api/stripe-webhook' && request.method === 'POST') {
      return handleStripeWebhook({ request, env });
    }

    if (url.pathname === '/api/check-session' && request.method === 'GET') {
      return handleCheckSession({ request, env });
    }

    return new Response('Not Found', { status: 404 });
  }
};
