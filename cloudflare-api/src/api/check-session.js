import Stripe from 'stripe';

export async function handleCheckSession(context) {
  try {
    const { STRIPE_SECRET_KEY } = context.env;
    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return new Response(
      JSON.stringify({ 
        success: session.payment_status === 'paid',
        status: session.payment_status 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );

  } catch (err) {
    console.error('Check session error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}