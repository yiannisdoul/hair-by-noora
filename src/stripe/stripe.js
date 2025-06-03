import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

export async function createCheckoutSession(bookingData) {
  try {
    // Use correct env var name
    if (!stripePromise) {
      stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    }

    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }

    // Use API base URL from .env
    const BASE_API = import.meta.env.VITE_API_BASE;
    const apiUrl = `${BASE_API}/create-checkout-session`;

    console.log('Creating checkout session with data:', bookingData);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create checkout session: ${errorText}`);
    }

    const { sessionId, url } = await response.json();
    console.log('Received session ID:', sessionId);

    if (!sessionId) {
      throw new Error('No session ID returned from server');
    }

    // Redirect to Stripe Checkout
    window.location.href = url;
  } catch (err) {
    console.error('Stripe checkout error:', err);
    throw err;
  }
}
