import Stripe from 'stripe';

export async function handleCreateCheckoutSession(context) {
  try {
    const { STRIPE_SECRET_KEY, DOMAIN } = context.env;
    const body = await context.request.json();

    console.log('Processing checkout request:', body);

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    // Extract numeric price from string like "From $35" or "Long – $45"
    const priceMatch = body.price.match(/\$(\d+)/);
    const basePrice = priceMatch ? Number(priceMatch[1]) : 50;
    const depositAmount = Math.floor(basePrice * 0.2 * 100); // 20% deposit in cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: `${body.service} – ${body.option || 'Standard'}`,
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/canceled`,
      metadata: body,
    });

    console.log('Stripe response:', session);

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (err) {
    console.error('Checkout session error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }), 
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}