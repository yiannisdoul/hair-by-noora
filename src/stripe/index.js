import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const createCheckoutSession = async (bookingData) => {
  try {
    // First, send WhatsApp notification to owner about new booking attempt
    const notifyResponse = await fetch(`${import.meta.env.VITE_API_BASE}/notify-booking-attempt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!notifyResponse.ok) {
      console.error('Failed to send WhatsApp notification, continuing with checkout');
    }

    // Then proceed with Stripe checkout
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stripe API error:', response.status, errorText.substring(0, 200));
      throw new Error(`Failed to create checkout session: ${response.status}`);
    }

    const { url } = await response.json();

    // Redirect to Stripe checkout
    window.location.href = url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};