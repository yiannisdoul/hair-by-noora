import { handleCreateCheckoutSession } from './api/create-checkout-session.js';
import { handleStripeWebhook } from './api/stripe-webhook.js';
import { handleCheckSession } from './api/check-session.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
};

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { 
          status: 204, 
          headers: corsHeaders 
        });
      }

      // Validate required environment variables
      if (!env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured');
      }

      let response;

      // Route handling
      if (pathname === '/api/create-checkout-session' && request.method === 'POST') {
        response = await handleCreateCheckoutSession({ request, env });
      } else if (pathname === '/stripe-webhook' && request.method === 'POST') {
        if (!env.STRIPE_WEBHOOK_SECRET) {
          throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }
        response = await handleStripeWebhook({ request, env });
      } else if (pathname === '/api/check-session' && request.method === 'GET') {
        response = await handleCheckSession({ request, env });
      } else {
        return new Response('Not found', { 
          status: 404,
          headers: corsHeaders
        });
      }

      // Add CORS headers to the response
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Internal Server Error' }), 
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
  }
};