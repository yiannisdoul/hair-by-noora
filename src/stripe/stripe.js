import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

export async function createCheckoutSession(bookingData) {
  try {
    if (!stripePromise) {
      stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    }

    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }

    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal
      ? 'http://127.0.0.1:8787'
      : 'https://hairbynoora.com.au';

    console.log('Creating checkout session with data:', bookingData);

    const response = await fetch(`${baseUrl}/api/create-checkout-session`, {
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

    // Use the URL directly from Stripe instead of redirectToCheckout
    window.location.href = url;
  } catch (err) {
    console.error('Stripe checkout error:', err);
    throw err;
  }
}